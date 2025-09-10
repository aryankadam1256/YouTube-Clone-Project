import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import User from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const content = req.body.content;
    if(!content?.trim()){
        throw new ApiError(400,"Tweet content is required")
    }
    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })

    return res.status(200).json(new ApiResponse(200,tweet,"Tweet created successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userid=req.params.userId;
    const tweets=await Tweet.aggregate([
        {
            $match:{ 
                owner:mongoose.Types.ObjectId(userid)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner"
            }
        },
        {
            $unwind:"$owner"
        }

    ])

    return res.status(200).json(new ApiResponse(200,tweets,"User tweets fetched successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId}=req.params;
    const tweet=req.body.content;
    if(!tweet?.trim()){
        throw new ApiError(400,"Tweet content is required");
    }
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet id");
    }
    const updatedTweet= await Tweet.findByIdAndUpdate(
        tweetId,
        {content:tweet},
        {new:true}
    )

    return res.status(200).json(new ApiResponse(200,updatedTweet,"Tweet updated successfully"));

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete 
    const {tweetId}=req.params;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet id");
    }

    const deletedtweet=await Tweet.findByIdAndDelete(tweetId);

    return res.status(200).json(new ApiResponse(200,deletedtweet,"Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}