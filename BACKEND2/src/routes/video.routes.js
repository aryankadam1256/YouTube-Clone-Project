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

/**
 * @swagger
 * /videos:
 *   get:
 *     summary: List all published videos (paginated)
 *     tags: [Videos]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 100 }
 *       - in: query
 *         name: query
 *         schema: { type: string }
 *         description: Search query against title, description, tags
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [publishedAt, views, duration, title], default: publishedAt }
 *       - in: query
 *         name: sortType
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *         description: Filter videos by owner ID
 *     responses:
 *       200: { description: Paginated list of videos }
 */
router.route("/").get(getAllVideos);

/**
 * @swagger
 * /videos/trending:
 *   get:
 *     summary: Get trending videos by time range
 *     tags: [Videos]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema: { type: string, enum: [now, week, month], default: now }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 50 }
 *     responses:
 *       200: { description: Trending videos sorted by views/recency score }
 */
router.route("/trending").get(getTrendingVideos);

/**
 * @swagger
 * /videos/publish:
 *   post:
 *     summary: Upload and publish a new video
 *     tags: [Videos]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, videoFile]
 *             properties:
 *               title: { type: string, maxLength: 200 }
 *               description: { type: string, maxLength: 5000 }
 *               videoFile: { type: string, format: binary }
 *               tags: { type: string, description: "Comma-separated tags" }
 *               language: { type: string, default: en }
 *               thumbnailUrl: { type: string, format: uri }
 *     responses:
 *       201: { description: Video published; embedding generated and indexed }
 *       400: { description: Missing required fields }
 */
router.route("/publish").post(verifyJWT, upload.single("videoFile"), validateBody(publishVideoSchema), publishAVideo);

/**
 * @swagger
 * /videos/{videoId}/toggle-publish:
 *   patch:
 *     summary: Toggle published/draft status (owner only)
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Publish status toggled }
 *       403: { description: Not the video owner }
 */
router.route("/:videoId/toggle-publish").patch(verifyJWT, togglePublishStatus);

/**
 * @swagger
 * /videos/{videoId}:
 *   get:
 *     summary: Get a single video by ID
 *     tags: [Videos]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Video with owner details }
 *       404: { description: Video not found }
 *   patch:
 *     summary: Update video metadata (owner only)
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               tags: { type: array, items: { type: string } }
 *               language: { type: string }
 *               isPublished: { type: boolean }
 *     responses:
 *       200: { description: Video updated; embedding regenerated if title/desc/tags changed }
 *       403: { description: Not the video owner }
 *   delete:
 *     summary: Delete a video (owner only)
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Video deleted and removed from search index }
 *       403: { description: Not the video owner }
 */
router.route("/:videoId").get(getVideoById);
router.route("/:videoId").patch(verifyJWT, validateBody(updateVideoSchema), updateVideo);
router.route("/:videoId").delete(verifyJWT, deleteVideo);

export default router;
