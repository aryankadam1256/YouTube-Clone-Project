import mongoose, {isValidObjectId} from "mongoose"
import User from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
   // const toggleSubscription = asyncHandler(async (req, res) => {
        const { channelId } = req.params;
        const subscriberId = req.user._id;
    
        const existingSubscription = await Subscription.findOne({
            subscriber: subscriberId,
            channel: channelId
        });
    
        if (existingSubscription) {
            // If already subscribed → unsubscribe (delete doc)
            await Subscription.deleteOne({
                subscriber: subscriberId,
                channel: channelId
            });
    
            return res.status(200).json(
                new ApiResponse(200, null, "Unsubscribed successfully")
            );
        } else {
            // If not subscribed → create subscription
            const newSubscription = await Subscription.create({
                subscriber: subscriberId,
                channel: channelId
            });
    
            return res.status(200).json(
                new ApiResponse(200, newSubscription, "Subscribed successfully")
            );
        }
    //});
    


    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    const subscribers=await Subscription.aggregate([
        {
            $match:{channel: mongoose.Types.ObjectId(channelId)}
        },
        {
            $lookup:{
                from:"users",
                localfield:"subscriber",
                foreignfield:"_id",
                as:"subscribers"

            }
        },{
            $unwind:"$subscribers"
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,subscribers,"Subscribers fetched successfully")
    )
// ********* MEANING of this controller *********

// Meaning of the getUserChannelSubscribers method

// Start with the Subscription collection
// Each document says: “User A (subscriber) has subscribed to Channel B (channel).”

// Filter for one channel
// Using $match, we only keep the rows where channel == channelId (the channel we’re checking subscribers for).
// 👉 This gives us a list of all subscription documents for that channel.

// Join with the users collection
// Now we take each subscription and connect the subscriber field (the ID of the user who subscribed) with the _id field in the users collection.
// 👉 This is like saying: “For each subscription, find the actual user document of the subscriber.”

// Result
// The result is a list of subscription records, each having an array of subscriberDetails that contains the full user info of the subscriber.
// 👉 In simple words: “Here’s the full list of users who subscribed to this channel.”
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const channels= await Subscription.aggregate([
        {
            $match:{subscriber: mongoose.Types.ObjectId(subscriberId)}
        },
        {
            $lookup:{
                from:"users",
                localfield:"channel",
                foreignfield:"_id",
                as:"channels"
            }
        }
        
    ])

    return res.status(200).json(
        new ApiResponse(200,channels,"Channels fetched successfully")
    )

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}