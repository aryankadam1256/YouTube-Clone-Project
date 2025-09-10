import { Router } from "express";
import { 
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus 
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js"; // Assuming you have this for file uploads

const router = Router();

// Get all videos (with optional query params for pagination, filtering, etc.)
router.route("/").get(verifyJWT, getAllVideos);

// Publish a new video (upload video file)
router.route("/publish").post(verifyJWT, upload.single("videoFile"), publishAVideo);

// Get a video by ID
router.route("/:videoId").get(verifyJWT, getVideoById);

// Update a video by ID
router.route("/:videoId").patch(verifyJWT, updateVideo);

// Delete a video by ID
router.route("/:videoId").delete(verifyJWT, deleteVideo);

// Toggle publish status of a video by ID
router.route("/toggle-publishstatus/:videoId").patch(verifyJWT, togglePublishStatus);

export default router;
