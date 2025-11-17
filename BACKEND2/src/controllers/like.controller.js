import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    //TODO: toggle like on video
    const userId = req.user._id;

    const existingLike=await Like.findOne({
        video:videoId,
        likedBy:userId
    })

    if(existingLike){
        await Like.deleteOne({
            video:videoId,
            likedBy:userId
        })
        return res.status(200).json(
            new ApiResponse(200,videoId,"Video unliked successfully")
        )
    }
    else{
        const likeObj={
            video:videoId,
            likedBy:userId
        }
        const likeCreated=await Like.create(likeObj);
        return res.status(200).json(
            new ApiResponse(200,likeCreated,"Video liked successfully")
        )
    }
     

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const userId = req.user._id;

    const existingLike=await Like.findOne({
        comment:commentId,
        likedBy:userId
    })

    if(existingLike){
        await Like.deleteOne({
            comment:commentId,
            likedBy:userId
        })
        return res.status(200).json(
            new ApiResponse(200,commentId,"comment unliked successfully")
        )
    }
    else{
        const likeObj={
            comment:commentId,
            likedBy:userId
        }
        const likeCreated=await Like.create(likeObj);
        return res.status(200).json(
            new ApiResponse(200,likeCreated,"comment liked successfully")
        )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const userId = req.user._id;

    const existingLike=await Like.findOne({
        tweet:tweetId,
        likedBy:userId
    })

    if(existingLike){
        await Like.deleteOne({
            tweet:tweetId,
            likedBy:userId
        })
        return res.status(200).json(
            new ApiResponse(200,tweetId,"tweet unliked successfully")
        )
    }
    else{
        const likeObj={
            tweet:tweetId,
            likedBy:userId
        }
        const likeCreated=await Like.create(likeObj);
        return res.status(200).json(
            new ApiResponse(200,likeCreated,"tweet liked successfully")
        )
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user._id;

// method -1 :- 
    // const likedVideos=await Like.find({likedBy:userId}).populate("video");
    // return res.status(200).json(
    //     new ApiResponse(200,likedVideos,"Liked videos fetched successfully")
    // )
// method - 2:- 
const likedVideos = await Like.aggregate([
    {
        $match: { likedBy:  mongoose.Types.ObjectId(userId) }
    },
    {
        $lookup: {
            from: "videos",             // collection name in MongoDB
            localField: "video",        // Like.video
            foreignField: "_id",        // Video._id
            as: "videoDetails"
        }
    },
    {
        $unwind: "$videoDetails"       // convert array to object
    },
    {
        $project: {                    // pick only fields you want
            _id: 0,
            video: "$videoDetails"
        }
    }
]);

return res.status(200).json(
    new ApiResponse(200,likedVideos,"Liked videos fetched successfully")
)

})

// Return like count for a video and whether current user liked it
const getVideoLikeCount = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }
    const userId = req.user?._id;
    const [count, existingLike] = await Promise.all([
        Like.countDocuments({ video: videoId }),
        userId ? Like.findOne({ video: videoId, likedBy: userId }) : null
    ]);
    return res.status(200).json(new ApiResponse(200, {
        count,
        liked: !!existingLike
    }, "Video like count fetched successfully"));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getVideoLikeCount
}