import mongoose, {isValidObjectId} from "mongoose"
import Video from "../models/video.model.js"
import User from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import {uploadCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    // const videos= await Video.aggregate([
    //     {
    //         $match:{owner: mongoose.Types.ObjectId(userId)}
    //     },
    //     {
    //         $lookup:{
    //             from:"users",
    //             localfield:"owner",
    //             foreignfield:"_id",
    //             as:"owner"
    //         }
    //     }
    // ])

    page = parseInt(page);
    limit = parseInt(limit);

    // Sorting object for aggregation
    const sortObj = {};
    sortObj[sortBy] = sortType === "asc" ? 1 : -1;

    // Build match stage
    const matchStage = {};
    if (query) {
        // Text search on title or description
        matchStage.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }
    if (userId) {
        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }

    // Aggregation pipeline
    const videos = await Video.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: "users",          // Join with users collection
                localField: "owner",    // owner field in Video
                foreignField: "_id",    // _id in User collection
                as: "ownerDetails"
            }
        },
        { $unwind: "$ownerDetails" }, // Flatten array to object
        { $sort: sortObj },
        { $skip: (page - 1) * limit },
        { $limit: limit }
    ]);

    // Get total count for pagination
    const totalVideos = await Video.countDocuments(matchStage);
    const totalPages = Math.ceil(totalVideos / limit);

    return res.status(200).json(
        new ApiResponse(200, videos, "Videos fetched successfully", {
            page,
            limit,
            totalVideos,
            totalPages
        })
    );

})

const publishAVideo = asyncHandler(async (req, res) => {
    // const { title, description} = req.body;
    // // TODO: get video, upload to cloudinary, create video
    // const videofile=req.file;

    // const video= await uploadOnCloudinary(videofile);

    // if(!video.url){
    //     throw ApiError(400,"Error while uploading on cloudinary");
    // }

    // const videoCreated=await Video.create({
    //     title,
    //     description,
    //     videoFile:video.url,
    //     owner:req.user._id
    // })

    // return res.status(200).json(new ApiResponse(200,videoCreated,"Video created successfully"));

        const { title, description } = req.body;
        const videofile = req.file;
    
        if (!videofile) {
            throw new ApiError(400, "Video file is required");
        }
    
        // Upload video to Cloudinary
        const videoData = await uploadOnCloudinary(videofile);
    
        if (!videoData.url || !videoData.duration || !videoData.thumbnail) {
            throw new ApiError(400, "Error while uploading video or generating metadata");
        }
    
        // Create Video document
        const videoCreated = await Video.create({
            title,
            description,
            videoFile: videoData.url,
            thumbnail: videoData.thumbnail,  // new
            duration: videoData.duration,    // new
            owner: req.user._id
        });
    
        return res.status(200).json(
            new ApiResponse(200, videoCreated, "Video created successfully")
        );
    
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video=await Video.findById(videoId).populate("owner", "username fullName avatar");
    return res.status(200).json(new ApiResponse(200,video,"Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: update video details like title, description, thumbnail
    const {title, description, thumbnail}=req.body;
const video=await Video.findByIdAndUpdate(
    videoId,
    {
        $set:{
            title,
            description,
            thumbnail
        }
    },
    { new : true}
)

return res.status(200).json(new ApiResponse(200,video,"Video updated successfully"));

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete 
    const video= await Video.findByIdAndDelete(videoId);
    return res.status(200).json(new ApiResponse(200,video,"Video deleted successfully"));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Find the video
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Toggle publish status
    video.isPublished = !video.isPublished;

    // Save changes
    await video.save();

    return res.status(200).json(
        new ApiResponse(200, video, `Video ${video.isPublished ? "published" : "unpublished"} successfully`)
    );
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}