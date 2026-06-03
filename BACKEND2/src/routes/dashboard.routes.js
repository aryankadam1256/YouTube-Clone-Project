import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelStats , getChannelVideos } from "../controllers/dashboard.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *
 * /dashboards/get-channel-stats/{channelId}:
 *   get:
 *     summary: Get aggregated channel statistics
 *     tags: [Dashboard]
 *     description: Returns totalVideos, totalViews, totalSubscribers, totalLikes for a channel
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Channel stats object }
 *
 * /dashboards/get-channel-videos/{channelId}:
 *   get:
 *     summary: Get all videos for a channel (including drafts for owner)
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Array of channel videos }
 */
router.route("/get-channel-stats/:channelId").get(verifyJWT,getChannelStats);
router.route("/get-channel-videos/:channelId").get(verifyJWT,getChannelVideos);

export default router;