import mongoose from "mongoose";
import Video from "../models/video.model.js";
import User from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { Subscription } from "../models/subscription.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getEsClient } from "../services/esClient.js";
import { generateEmbedding } from "../services/embeddings.js";

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
    const { page = 1, limit = 10 } = req.query;
    
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

    const es = getEsClient();
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

    if (es && userEmbedding) {
        try {
            const knnResult = await es.knnSearch({
                index: VIDEO_INDEX,
                knn: {
                    field: "embedding",
                    query_vector: userEmbedding,
                    k: Math.max(limitNum * 2, 40),
                    num_candidates: Math.max(limitNum * 3, 80),
                    filter: {
                        bool: {
                            must: [{ term: { isPublished: true } }],
                            must_not: [
                                { terms: { _id: watchHistoryIds } },
                                { terms: { _id: likedVideoIds } }
                            ]
                        }
                    }
                }
            });

            recommendationHits = knnResult.hits.hits;

            // Boost subscribed channels & tags via a secondary lexical query
            if (subscribedChannelIds.length || topTags.length) {
                const lexicalShould = [];
                if (subscribedChannelIds.length) {
                    lexicalShould.push({
                        terms: {
                            ownerId: subscribedChannelIds.map((id) => id.toString()),
                            boost: 2
                        }
                    });
                }
                if (topTags.length) {
                    lexicalShould.push({
                        terms: {
                            tags: topTags,
                            boost: 1.5
                        }
                    });
                }

                if (lexicalShould.length) {
                    const lexicalResult = await es.search({
                        index: VIDEO_INDEX,
                        size: Math.max(limitNum, 20),
                        query: {
                            bool: {
                                filter: [{ term: { isPublished: true } }],
                                should: lexicalShould,
                                minimum_should_match: 1
                            }
                        }
                    });

                    // Simple fusion
                    const ids = new Set();
                    recommendationHits = recommendationHits.concat(lexicalResult.hits.hits);
                    recommendationHits = recommendationHits.filter((hit) => {
                        if (ids.has(hit._id)) return false;
                        ids.add(hit._id);
                        return true;
                    });
                }
            }
        } catch (error) {
            console.error("Recommendation ES error: ", error);
        }
    }

    let recommendedVideos = [];
    if (recommendationHits.length) {
        recommendedVideos = recommendationHits
            .map((hit) => ({
                id: hit._id,
                _id: hit._id,
                ...hit._source
            }))
            .filter((video) => !watchHistoryIds.includes(video.id))
            .slice((pageNum - 1) * limitNum, pageNum * limitNum);
    } else {
        // MongoDB fallback: blend subscriptions, tags, and trending.
        const pipeline = [
            {
                $match: {
                    isPublished: true,
                    _id: { $nin: watchHistoryObjectIds }
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
                  isPublished: true,
                  _id: { $nin: watchHistoryObjectIds }
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
                engine: recommendationHits.length ? "elasticsearch" : "mongo-fallback"
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

    if (es && Array.isArray(video.embedding) && video.embedding.length) {
        try {
            const { hits } = await es.knnSearch({
                index: VIDEO_INDEX,
                knn: {
                    field: "embedding",
                    query_vector: video.embedding,
                    k: 20,
                    num_candidates: 50,
                    filter: {
                        bool: {
                            must: [{ term: { isPublished: true } }],
                            must_not: [{ term: { _id: videoId } }]
                        }
                    }
                }
            });
            relatedHits = hits.hits;
        } catch (error) {
            console.error("Related videos ES error:", error);
        }
    }

    if (!relatedHits.length && video.tags?.length) {
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
        relatedVideos = relatedHits.map((hit) => ({
            id: hit._id,
            _id: hit._id,
            ...hit._source
        }));
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

    const es = getEsClient();
    if (es) {
        try {
            const { hits } = await es.search({
                index: VIDEO_INDEX,
                size: 20,
                query: {
                    bool: {
                        filter: [{ term: { isPublished: true } }],
                        should: [{ terms: { tags: tagList, boost: 2 } }],
                        minimum_should_match: 1
                    }
                }
            });

            return res.status(200).json(
                new ApiResponse(
                    200,
                    hits.hits.map((hit) => ({
                        id: hit._id,
                        _id: hit._id,
                        ...hit._source
                    })),
                    "Tag recommendations fetched"
                )
            );
        } catch (error) {
            console.error("Tag recommendations ES error:", error);
        }
    }

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

