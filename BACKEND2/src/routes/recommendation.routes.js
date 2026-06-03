import { Router } from "express";
import { getRecommendedVideos, getRelatedVideos, getTagRecommendations } from "../controllers/recommendation.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * /recommendations:
 *   get:
 *     summary: Get personalized home feed recommendations
 *     tags: [Recommendations]
 *     description: >
 *       Uses Pinecone vector similarity search on the user's average watch-history embedding.
 *       Falls back to a MongoDB scoring pipeline (subscriptions + tags + views + recency)
 *       if Pinecone is unavailable or the user has no watch history.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Recommended videos with engine info (pinecone | mongo-fallback)
 */
router.route("/").get(verifyJWT, getRecommendedVideos);

/**
 * @swagger
 * /recommendations/{videoId}/related:
 *   get:
 *     summary: Get videos related to a given video
 *     tags: [Recommendations]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Related videos via Pinecone or tag/ES fallback }
 *       404: { description: Video not found }
 */
router.route("/:videoId/related").get(getRelatedVideos);

/**
 * @swagger
 * /recommendations/tags:
 *   get:
 *     summary: Discover videos by tags
 *     tags: [Recommendations]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: tags
 *         required: true
 *         schema: { type: string }
 *         description: Comma-separated tag list
 *     responses:
 *       200: { description: Videos matching any of the provided tags }
 */
router.route("/tags").get(getTagRecommendations);

export default router;

