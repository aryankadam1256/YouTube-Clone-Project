import mongoose from "mongoose"
import Video from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id");
    }

    // Total videos
    const totalVideos = await Video.countDocuments({ owner: channelId });

    // Total views (sum of views of all videos)
    const videos = await Video.find({ owner: channelId }, "views");
    const totalViews = videos.reduce((sum, vid) => sum + vid.views, 0);

    // Total subscribers
    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

    // Total likes (on videos of this channel)
    const videoIds = videos.map(v => v._id);
    const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });

    const stats = {
        totalVideos,
        totalViews,
        totalSubscribers,
        totalLikes
    };

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));


  // method 2 :-


//   const getChannelStats = asyncHandler(async (req, res) => {
//     const { channelId } = req.params;

//     if (!mongoose.isValidObjectId(channelId)) {
//         throw new ApiError(400, "Invalid channel id");
//     }

//     const stats = await Video.aggregate([
//         { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
//         {
//             $group: {
//                 _id: null,
//                 totalVideos: { $sum: 1 },
//                 totalViews: { $sum: "$views" }
//             }
//         }
//     ]);

//     // Subscribers
//     const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

//     // Likes
//     const videoIds = await Video.find({ owner: channelId }, "_id");
//     const totalLikes = await Like.countDocuments({
//         video: { $in: videoIds.map(v => v._id) }
//     });

//     const finalStats = {
//         totalVideos: stats[0]?.totalVideos || 0,
//         totalViews: stats[0]?.totalViews || 0,
//         totalSubscribers,
//         totalLikes
//     };

//     return res
//        .status(200)
 //       .json(new ApiResponse(200, finalStats, "Channel stats fetched successfully"));
//});

});


const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {channelId}=req.params;
    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel id");
    }
    const channelvideos= await Video.aggregate([
        {
            $match:{ owner: mongoose.Types.ObjectId(channelId)}
        },
        {
            $lookup:{
                from:"users",
                localfield:"owner",
                foreignfield:"_id",
                as:"owner"
            }
        },
        {
            $unwind:"$owner"
        }
    ])

    return res.status(200).json(new ApiResponse(200,channelvideos,"Channel videos fetched successfully"));

})

export {
    getChannelStats, 
    getChannelVideos
    }