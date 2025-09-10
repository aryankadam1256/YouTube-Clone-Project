import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
  //  const {videoId} = req.params
   // const {page = 1, limit = 10} = req.query
    
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    // Fetch comments for this video, populate owner info
    //method 1 :- find + populate it is less flexible when multiple joins 
    // const comments = await Comment.find({ user: videoId })
    //     .populate("owner", "username fullName avatar") // only these fields from User
    //     .sort({ createdAt: -1 }); // latest comments first
    
        // method 2 :- using agg pipeline 
    const comments = await Comment.aggregate([
            {
              $match: { user: mongoose.Types.ObjectId(videoId) }
            },
            {
              $lookup: {
                from: "users",                // collection name in DB
                localField: "owner",          // Comment.owner
                foreignField: "_id",          // User._id
                as: "owner"
              }
            },
            {
              $addFields: {
                owner: { $first: "$owner" }   // flatten array into single object
              }
            },
            {
              $sort: { createdAt: -1 }
            },
            {
              $project: {
                content: 1,
                createdAt: 1,
                "owner.username": 1,
                "owner.fullName": 1,
                "owner.avatar": 1
              }
            }
          ]);
          
    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"));



})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {comment}= req.body;
    const videoId=req.params.videoId;
    const userId=req.user._id;

    if(!comment?.trim()){
        throw new ApiError(400,"Comment is missing");
    }

    const commentObj={
        comment,
        user:userId,
        video:videoId
    }
    const commentCreated=await Comment.create(commentObj);
    return res
    .status(200)
    .json(
        new ApiResponse(200,commentCreated,"Comment added successfully")
    )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
   const {newcomment}= req.body;
   const commentId=req.params.commentId;

   if(!newcomment?.trim()){
    throw new ApiError(400,"comment is missing");
   }

   const user = await Comment.findByIdAndUpdate(
    commentId,
    {
        $set:{
            comment:newcomment
        }
    },
    {new:true}
    )
    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    // const {newcomment}= req.body;

//    if(!newcomment?.trim()){
//     throw new ApiError(400,"comment is missing");
//    }

// method 1 :- find and update wit hcomment settign to null
//    const user = await User.findByIdAndUpdate(
//     req.user._id,
//     {
//         $set:{
//             comment:null
//         }
//     },
//     {new:true}
//     )
//     return res
//     .status(200)
//     .json(
//         new ApiResponse(200,user,"Comment deleted successfully")
//     )  

// method 2 :- by using findByIdAndDelete
    const{commentId}=req.params;
    const user = await Comment.findByIdAndDelete(commentId);
    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Comment deleted successfully")
    )

    
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }