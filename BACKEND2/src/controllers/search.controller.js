import Video from "../models/video.model.js";
import User from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getEsClient } from "../services/esClient.js";
import { generateEmbedding } from "../services/embeddings.js";

const VIDEO_INDEX = process.env.ELASTICSEARCH_VIDEO_INDEX || "videos";
const DEFAULT_RRF_K = 60;

// Basic synonym/alias expansion for common developer terms
const expandQuery = (q) => {
    const lower = (q || "").toLowerCase();
    const aliases = {
        js: ["javascript"],
        javascript: ["js"],
        ts: ["typescript"],
        typescript: ["ts"],
        node: ["nodejs", "node.js"],
        nodejs: ["node", "node.js"],
        react: ["reactjs", "react.js"],
        reactjs: ["react", "react.js"],
        py: ["python"],
        python: ["py"],
        mongo: ["mongodb"],
        mongodb: ["mongo"],
    };
    const set = new Set([q]);
    if (aliases[lower]) {
        for (const a of aliases[lower]) set.add(a);
    }
    return Array.from(set);
};

const reciprocalRankFusion = (lexicalHits, semanticHits, { k = DEFAULT_RRF_K } = {}) => {
    const combined = new Map();

    lexicalHits.forEach((hit, idx) => {
        const id = hit._id;
        const contribution = 1 / (k + idx + 1);
        const existing = combined.get(id) ?? { hit, score: 0 };
        combined.set(id, { hit: existing.hit ?? hit, score: existing.score + contribution });
    });

    semanticHits.forEach((hit, idx) => {
        const id = hit._id;
        const contribution = 1 / (k + idx + 1);
        const existing = combined.get(id) ?? { hit, score: 0 };
        combined.set(id, { hit: existing.hit ?? hit, score: existing.score + contribution });
    });

    return Array.from(combined.values())
        .sort((a, b) => b.score - a.score)
        .map(({ hit }) => hit);
};

const formatEsHits = (hits) =>
    hits.map((hit) => ({
        id: hit._id,
        _id: hit._id,
        score: hit._score,
        ...hit._source,
    }));

/**
 * Get search suggestions (autocomplete)
 * Returns video titles and channel names that match the query
 */
const getSearchSuggestions = asyncHandler(async (req, res) => {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
        return res.status(200).json(
            new ApiResponse(200, [], "Suggestions fetched successfully")
        );
    }

    const query = q.trim();
    const terms = expandQuery(query);
    const titleOrs = terms.map(t => ({ title: { $regex: new RegExp(t, "i") } }));
    const userOrs = terms.map(t => ({ username: { $regex: new RegExp(t, "i") } }));

    // Get matching video titles (limit 5)
    const videoTitles = await Video.find({
        isPublished: true,
        $or: titleOrs
    })
        .select("title _id")
        .limit(5)
        .sort({ views: -1 });

    // Get matching channel names (limit 3)
    const channels = await User.find({
        $or: userOrs
    })
        .select("username fullname avatar _id")
        .limit(3);

    // Format suggestions
    const suggestions = [
        ...videoTitles.map(v => ({
            type: "video",
            id: v._id,
            title: v.title,
            display: v.title
        })),
        ...channels.map(c => ({
            type: "channel",
            id: c._id,
            username: c.username,
            fullname: c.fullname,
            avatar: c.avatar,
            display: c.username
        }))
    ];

    return res.status(200).json(
        new ApiResponse(200, suggestions, "Search suggestions fetched successfully")
    );
});

/**
 * Search videos with ranking
 * Ranking factors:
 * 1. Text match score (title/description)
 * 2. Subscribed channels boost
 * 3. Views and recency
 */
const searchVideos = asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 10, sortBy = "relevance" } = req.query;
    const userId = req.user?._id; // Optional - for personalized ranking

    if (!q || q.trim().length < 1) {
        throw new ApiError(400, "Search query is required");
    }

    const query = q.trim();
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Get user's subscriptions if authenticated
    let subscribedChannelIds = [];
    if (userId) {
        const subscriptions = await Subscription.find({ subscriber: userId });
        subscribedChannelIds = subscriptions.map(sub => sub.channel);
    }

    const es = getEsClient();
    if (es) {
        const lexicalParams = {
            index: VIDEO_INDEX,
            from: (pageNum - 1) * limitNum,
            size: limitNum,
            track_total_hits: true,
            query: {
                bool: {
                    must: [
                        {
                            multi_match: {
                                query,
                                fields: [
                                    "title^3",
                                    "description",
                                    "tags^2",
                                    "transcript^0.5"
                                ],
                                type: "best_fields",
                                operator: "or",
                                fuzziness: "AUTO"
                            }
                        }
                    ],
                    filter: [{ term: { isPublished: true } }]
                }
            },
            sort: sortBy === "date"
                ? [{ publishedAt: "desc" }]
                : sortBy === "views"
                    ? [{ views: "desc" }, { publishedAt: "desc" }]
                    : undefined
        };

        // Build additional "should" clauses for boosts and recall
        const shouldClauses = [];
        // Boost subscribed channels
        if (subscribedChannelIds.length > 0) {
            shouldClauses.push({
                terms: { ownerId: subscribedChannelIds.map((id) => id.toString()) }
            });
        }
        // Prefix matches for better UX on partial queries (e.g., "jav" -> javascript)
        shouldClauses.push({
            multi_match: {
                query,
                type: "phrase_prefix",
                fields: ["title^3", "tags^2", "description"]
            }
        });
        // Synonym/alias expansion (js<->javascript, etc.)
        const expanded = expandQuery(query);
        if (expanded.length > 1) {
            shouldClauses.push({
                multi_match: {
                    query: expanded.join(" "),
                    fields: ["title^3", "tags^2", "description"],
                    type: "best_fields",
                    operator: "or"
                }
            });
        }
        if (shouldClauses.length > 0) {
            lexicalParams.query.bool.should = shouldClauses;
        }

        const [lexicalResult, embedding] = await Promise.all([
            es.search(lexicalParams),
            generateEmbedding(query).catch(() => null)
        ]);

        let hits = lexicalResult.hits.hits;
        let total = lexicalResult.hits.total?.value ?? hits.length;

        if (embedding && Array.isArray(embedding)) {
            const semanticResult = await es.knnSearch({
                index: VIDEO_INDEX,
                knn: {
                    field: "embedding",
                    query_vector: embedding,
                    k: Math.max(limitNum, 20),
                    num_candidates: Math.max(limitNum * 2, 50),
                    filter: { term: { isPublished: true } }
                }
            });

            hits = reciprocalRankFusion(
                lexicalResult.hits.hits,
                semanticResult.hits.hits
            ).slice(0, limitNum);
            total = Math.max(
                lexicalResult.hits.total?.value ?? 0,
                semanticResult.hits.total?.value ?? 0
            );
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                formatEsHits(hits),
                "Search results fetched successfully",
                {
                    query,
                    page: pageNum,
                    limit: limitNum,
                    totalVideos: total,
                    totalPages: Math.ceil(total / limitNum),
                    sortBy,
                    engine: "elasticsearch"
                }
            )
        );
    }

    // --- MongoDB fallback ---
    const fallbackResults = await Video.aggregate([
        {
            $match: {
                isPublished: true,
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } },
                    { tags: { $regex: query, $options: "i" } }
                ]
            }
        },
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
                relevanceScore: {
                    $add: [
                        {
                            $cond: [
                                { $regexMatch: { input: "$title", regex: query, options: "i" } },
                                50,
                                0
                            ]
                        },
                        {
                            $cond: [
                                { $regexMatch: { input: "$description", regex: query, options: "i" } },
                                20,
                                0
                            ]
                        },
                        {
                            $cond: [
                                { $in: ["$owner", subscribedChannelIds] },
                                30,
                                0
                            ]
                        },
                        {
                            $min: [{ $divide: ["$views", 1000] }, 20]
                        },
                        {
                            $max: [
                                0,
                                {
                                    $subtract: [
                                        10,
                                        {
                                            $min: [
                                                {
                                                    $divide: [
                                                        { $subtract: [new Date(), "$createdAt"] },
                                                        86400000
                                                    ]
                                                },
                                                10
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
        {
            $sort:
                sortBy === "date"
                    ? { createdAt: -1 }
                    : sortBy === "views"
                    ? { views: -1, createdAt: -1 }
                    : { relevanceScore: -1, createdAt: -1 }
        },
        { $skip: (pageNum - 1) * limitNum },
        { $limit: limitNum }
    ]);

    const totalCount = await Video.countDocuments({
        isPublished: true,
        $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { tags: { $regex: query, $options: "i" } }
        ]
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            fallbackResults,
            "Search results fetched successfully",
            {
                query,
                page: pageNum,
                limit: limitNum,
                totalVideos: totalCount,
                totalPages: Math.ceil(totalCount / limitNum),
                sortBy,
                engine: "mongo-fallback"
            }
        )
    );
});

export {
    getSearchSuggestions,
    searchVideos
};

