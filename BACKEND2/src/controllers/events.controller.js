import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import Video from "../models/video.model.js";
import { indexVideo } from "../services/videoIndexer.js";

export const logWatchEvent = asyncHandler(async (req, res) => {
  const { videoId, progress = 1 } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);
  if (!video || !video.isPublished) {
    throw new ApiError(404, "Video not found");
  }

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { watchHistory: video._id },
  });

  if (progress >= 0.5) {
    video.views += 1;
    await video.save();
    await indexVideo(video._id);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { videoId }, "Watch event logged"));
});

export const logLikeEvent = asyncHandler(async (req, res) => {
  const { videoId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { watchHistory: videoId },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { videoId }, "Like event logged"));
});

