import mongoose from "mongoose";
import Video from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { indexVideo, removeVideo } from "../services/videoIndexer.js";
import { generateEmbedding } from "../services/embeddings.js";

const buildMatchStage = ({ query, userId, includeDrafts = false }) => {
    const match = {};
    if (query) {
        match.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { tags: { $regex: query, $options: "i" } }
        ];
    }
    if (userId) {
        match.owner = new mongoose.Types.ObjectId(userId);
    }
    if (!includeDrafts) {
        match.isPublished = true;
    }
    return match;
};

const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query,
        sortBy = "publishedAt",
        sortType = "desc",
        userId,
        includeDrafts = false
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);

    const sortField = ["publishedAt", "views", "duration", "title"].includes(sortBy)
        ? sortBy
        : "publishedAt";
    const sortDirection = sortType === "asc" ? 1 : -1;
    const sortStage = { [sortField]: sortDirection, createdAt: -1 };

    const includeUnpublished = includeDrafts === "true";
    const matchStage = buildMatchStage({ query, userId, includeDrafts: includeUnpublished });

    const pipeline = [
        { $match: matchStage },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        { $unwind: "$ownerDetails" },
        { $sort: sortStage },
        { $skip: (pageNum - 1) * limitNum },
        { $limit: limitNum }
    ];

    const [videos, totalVideos] = await Promise.all([
        Video.aggregate(pipeline),
        Video.countDocuments(matchStage)
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(200, videos, "Videos fetched successfully", {
                page: pageNum,
                limit: limitNum,
                totalVideos,
                totalPages: Math.ceil(totalVideos / limitNum)
            })
        );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, tags = [], language = "en", publishedAt } = req.body;
    const videofile = req.file;

    if (!videofile?.path) {
        throw new ApiError(400, "Video file is required");
    }
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    const videoData = await uploadCloudinary(videofile.path);

    if (!videoData?.secure_url) {
        throw new ApiError(400, "Error while uploading video");
    }

    const thumbnailUrl =
        req.body.thumbnailUrl ||
        videoData.thumbnail_url ||
        videoData.secure_url.replace(/\.mp4$/, ".jpg");

    if (!thumbnailUrl) {
        throw new ApiError(400, "Thumbnail is required");
    }

    const embeddingInput = [title, description, [].concat(tags).join(" ")].join("\n");
    const embedding = await generateEmbedding(embeddingInput).catch(() => null);

    const created = await Video.create({
        title,
        description,
        videoFile: videoData.secure_url,
        thumbnail: thumbnailUrl,
        duration: Math.round(videoData.duration ?? 0),
        owner: req.user._id,
        tags: Array.isArray(tags) ? tags : String(tags).split(",").map((t) => t.trim()),
        language,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        embedding: embedding ?? undefined
    });

    await indexVideo(created._id);

    return res
        .status(201)
        .json(new ApiResponse(201, created, "Video created successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const videoDoc = await Video.findById(videoId);
    if (!videoDoc) {
        throw new ApiError(404, "Video not found");
    }

    const canViewDraft =
        videoDoc.isPublished ||
        (req.user && videoDoc.owner.toString() === req.user._id.toString());

    if (!canViewDraft) {
        throw new ApiError(403, "Video is not published");
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
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
        { $unwind: "$ownerDetails" }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, video[0], "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const allowedFields = [
        "title",
        "description",
        "thumbnail",
        "tags",
        "language",
        "isPublished",
        "publishedAt",
        "transcript",
        "transcriptUrl"
    ];

    const updates = {};
    for (const field of allowedFields) {
        if (typeof req.body[field] !== "undefined") {
            updates[field] =
                field === "tags"
                    ? Array.isArray(req.body[field])
                        ? req.body[field]
                        : String(req.body[field])
                              .split(",")
                              .map((t) => t.trim())
                    : field === "publishedAt"
                    ? new Date(req.body[field])
                    : req.body[field];
        }
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "Provide at least one field to update");
    }

    if (updates.title || updates.description || updates.tags) {
        const embeddingInput = [
            updates.title,
            updates.description,
            Array.isArray(updates.tags) ? updates.tags.join(" ") : ""
        ]
            .filter(Boolean)
            .join("\n");
        if (embeddingInput) {
            const embedding = await generateEmbedding(embeddingInput).catch(() => null);
            if (embedding) {
                updates.embedding = embedding;
            }
        }
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        { $set: updates },
        { new: true }
    );

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    await indexVideo(video._id);

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findByIdAndDelete(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    await removeVideo(video._id);

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    video.isPublished = !video.isPublished;
    if (video.isPublished && !video.publishedAt) {
        video.publishedAt = new Date();
    }

    await video.save();
    await indexVideo(video._id);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                `Video ${video.isPublished ? "published" : "unpublished"} successfully`
            )
        );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};