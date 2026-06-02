import mongoose from "mongoose";
import Video from "../models/video.model.js";
import User from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { Subscription } from "../models/subscription.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { index as pineconeIndex } from "../services/pineconeClient.js";
import { generateEmbedding } from "../services/hfService.js";
import { getEsClient } from "../services/esClient.js";

const VIDEO_INDEX = process.env.ELASTICSEARCH_VIDEO_INDEX || "videos";

const averageVectors = (vectors) => {
    if (!vectors.length) return null;
    const length = vectors[0].length;
    const sum = new Array(length).fill(0);
    vectors.forEach((vec) => {
        vec.forEach((val, idx) => {
            sum[idx] += val;
        });
    });
    return sum.map((val) => val / vectors.length);
};

/**
 * Get personalized video recommendations for the logged-in user
 * Algorithm:
 * 1. Boost videos from subscribed channels
 * 2. Boost videos similar to watch history (by title/description keywords)
 * 3. Boost videos liked by users with similar interests
 * 4. Include trending videos (high views, recent)
 * 5. Exclude already watched videos
 */
const getRecommendedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Get user's subscriptions
    const subscriptions = await Subscription.find({ subscriber: userId });
    const subscribedChannelIds = subscriptions.map(sub => sub.channel);

    // Get user's watch history (last 20 videos)
    const user = await User.findById(userId).select("watchHistory");
    const watchHistoryIds = (user.watchHistory || []).slice(-100).map((id) => id.toString());
    const watchHistoryObjectIds = watchHistoryIds.map((id) => new mongoose.Types.ObjectId(id));

    // Fetch recent interactions
    const watchedVideos = await Video.find({ _id: { $in: watchHistoryIds } })
        .select("title description tags embedding owner")
        .limit(100);

    const likedVideos = await Like.find({ likedBy: userId, video: { $exists: true } })
        .select("video")
        .limit(50);
    const likedVideoIds = likedVideos.map((like) => like.video.toString());

    const preferenceVectors = [];
    const tagFrequency = {};

    watchedVideos.forEach((video) => {
        if (Array.isArray(video.embedding) && video.embedding.length) {
            preferenceVectors.push(video.embedding);
        }
        (video.tags || []).forEach((tag) => {
            if (!tag) return;
            tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
        });
    });

    const topTags = Object.keys(tagFrequency)
        .sort((a, b) => tagFrequency[b] - tagFrequency[a])
        .slice(0, 10);

    let recommendationHits = [];

    let userEmbedding = preferenceVectors.length
        ? averageVectors(preferenceVectors)
        : null;

    if (!userEmbedding && watchedVideos.length) {
        const text = watchedVideos
            .slice(-20)
            .map((video) => `${video.title || ""}\n${video.description || ""}`)
            .join("\n");
        if (text.trim().length) {
            userEmbedding = await generateEmbedding(text).catch(() => null);
        }
    }

    // --- Pinecone Recommendations ---
    if (pineconeIndex && userEmbedding) {
        try {
            const searchResponse = await pineconeIndex.query({
                vector: userEmbedding,
                topK: Math.max(limitNum * 2, 20),
                includeMetadata: true,
                filter: { isPublished: true }
            });

            const matches = searchResponse.matches || [];
            // Filter out watched/liked videos
            recommendationHits = matches.filter(match =>
                !watchHistoryIds.includes(match.id) &&
                !likedVideoIds.includes(match.id)
            ).map(match => ({
                _id: match.id,
                _source: match.metadata // Map metadata to _source to match previous structure if needed, or just handle IDs
            }));

        } catch (error) {
            console.error("❌ Pinecone Recommendation Error:", error);
        }
    }

    let recommendedVideos = [];
    if (recommendationHits.length) {
        const hitIds = recommendationHits.map(hit => new mongoose.Types.ObjectId(hit._id));

        // Fetch full details from Mongo
        recommendedVideos = await Video.aggregate([
            { $match: { _id: { $in: hitIds } } },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerDetails"
                }
            },
            { $unwind: "$ownerDetails" },
            // Maintain order from Pinecone
            {
                $addFields: {
                    __order: { $indexOfArray: [hitIds, "$_id"] }
                }
            },
            { $sort: { __order: 1 } },
            { $skip: (pageNum - 1) * limitNum },
            { $limit: limitNum }
        ]);
    } else {
        // MongoDB fallback: blend subscriptions, tags, and trending.
        const pipeline = [
            {
                $match: {
                    isPublished: true
                }
            },
            {
                $addFields: {
                    score: {
                        $add: [
                            {
                                $cond: [{ $in: ["$owner", subscribedChannelIds] }, 30, 0]
                            },
                            {
                                $cond: [
                                    { $gt: [{ $size: { $ifNull: ["$tags", []] } }, 0] },
                                    {
                                        $multiply: [
                                            {
                                                $size: {
                                                    $setIntersection: ["$tags", topTags]
                                                }
                                            },
                                            8
                                        ]
                                    },
                                    0
                                ]
                            },
                            {
                                $min: [{ $divide: ["$views", 1000] }, 25]
                            },
                            {
                                $max: [
                                    0,
                                    {
                                        $subtract: [
                                            20,
                                            {
                                                $min: [
                                                    {
                                                        $divide: [
                                                            { $subtract: [new Date(), "$publishedAt"] },
                                                            86400000
                                                        ]
                                                    },
                                                    20
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                }
            },
            { $sort: { score: -1, publishedAt: -1 } },
            { $skip: (pageNum - 1) * limitNum },
            { $limit: limitNum },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerDetails"
                }
            },
            { $unwind: "$ownerDetails" }
        ];

        recommendedVideos = await Video.aggregate(pipeline);
    }

    const totalCount =
        recommendationHits.length > 0
            ? Math.max(recommendationHits.length, (pageNum - 1) * limitNum + recommendedVideos.length)
            : await Video.countDocuments({
                isPublished: true
            });

    return res.status(200).json(
        new ApiResponse(
            200,
            recommendedVideos,
            "Recommended videos fetched successfully",
            {
                page: pageNum,
                limit: limitNum,
                totalVideos: totalCount,
                totalPages: Math.ceil(totalCount / limitNum),
                engine: recommendationHits.length ? "pinecone" : "mongo-fallback"
            }
        )
    );
});

export {
    getRecommendedVideos
};

export const getRelatedVideos = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findById(videoId).select(
        "embedding tags language isPublished"
    );

    if (!video || !video.isPublished) {
        throw new ApiError(404, "Video not found");
    }

    const es = getEsClient();
    let relatedHits = [];


    if (pineconeIndex && Array.isArray(video.embedding) && video.embedding.length) {
        try {
            const searchResponse = await pineconeIndex.query({
                vector: video.embedding,
                topK: 20,
                includeMetadata: true,
                filter: { isPublished: true }
            });

            // Filter out the current video
            relatedHits = (searchResponse.matches || []).filter(match => match.id !== videoId);

        } catch (error) {
            console.error("❌ Pinecone Related Videos Error:", error);
        }
    }

    if (es && !relatedHits.length && video.tags?.length) {
        const { hits } = await es.search({
            index: VIDEO_INDEX,
            size: 20,
            query: {
                bool: {
                    must: [{ term: { isPublished: true } }],
                    should: [{ terms: { tags: video.tags, boost: 2 } }],
                    must_not: [{ term: { _id: videoId } }]
                }
            }
        });
        relatedHits = hits.hits;
    }

    let relatedVideos;
    if (relatedHits.length) {
        const hitIds = relatedHits.map(hit => new mongoose.Types.ObjectId(hit.id));
        relatedVideos = await Video.aggregate([
            { $match: { _id: { $in: hitIds } } },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerDetails"
                }
            },
            { $unwind: "$ownerDetails" },
            {
                $addFields: {
                    __order: { $indexOfArray: [hitIds, "$_id"] }
                }
            },
            { $sort: { __order: 1 } }
        ]);
    } else {
        relatedVideos = await Video.aggregate([
            {
                $match: {
                    _id: { $ne: new mongoose.Types.ObjectId(videoId) },
                    isPublished: true,
                    tags: { $in: video.tags || [] }
                }
            },
            { $sort: { views: -1, publishedAt: -1 } },
            { $limit: 20 },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "ownerDetails"
                }
            },
            { $unwind: "$ownerDetails" }
        ]);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, relatedVideos, "Related videos fetched"));
});

export const getTagRecommendations = asyncHandler(async (req, res) => {
    const { tags } = req.query;
    if (!tags) {
        throw new ApiError(400, "Provide tags");
    }

    const tagList = Array.isArray(tags)
        ? tags
        : String(tags)
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);

    const videos = await Video.aggregate([
        {
            $match: {
                isPublished: true,
                tags: { $in: tagList }
            }
        },
        { $sort: { views: -1, publishedAt: -1 } },
        { $limit: 20 },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        { $unwind: "$ownerDetails" }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Tag recommendations fetched"));
});

