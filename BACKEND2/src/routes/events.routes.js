import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { logLikeEvent, logWatchEvent } from "../controllers/events.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Client-side event logging for recommendation engine signals
 *
 * /events/watch:
 *   post:
 *     summary: Log a video watch event (adds to watch history, increments view count)
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [videoId]
 *             properties:
 *               videoId: { type: string }
 *     responses:
 *       200: { description: Watch logged; returns updated view count }
 *
 * /events/like:
 *   post:
 *     summary: Log a like event signal for the recommendation engine
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [videoId]
 *             properties:
 *               videoId: { type: string }
 *     responses:
 *       200: { description: Like event recorded }
 */
router.post("/watch", verifyJWT, logWatchEvent);
router.post("/like", verifyJWT, logLikeEvent);

export default router;

