import { Router } from "express";
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getTrendingVideos
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { publishVideoSchema, updateVideoSchema } from "../validators/video.validators.js";

const router = Router();

// Get all videos (public)
router.route("/").get(getAllVideos);

// Get trending videos (public)
router.route("/trending").get(getTrendingVideos);

// Publish a new video (upload video file)
router.route("/publish").post(verifyJWT, upload.single("videoFile"), validateBody(publishVideoSchema), publishAVideo);

// Toggle publish status (auth required)
router.route("/:videoId/toggle-publish").patch(verifyJWT, togglePublishStatus);

// Get a video by ID (public)
router.route("/:videoId").get(getVideoById);

// Update a video by ID
router.route("/:videoId").patch(verifyJWT, validateBody(updateVideoSchema), updateVideo);

// Delete a video by ID
router.route("/:videoId").delete(verifyJWT, deleteVideo);

export default router;
