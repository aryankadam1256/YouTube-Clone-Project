import { Router } from "express";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike, getVideoLikeCount, getCommentLikeCount } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Likes
 *   description: Like/unlike videos, comments, and tweets
 *
 * /likes/toggle-videolike/{videoId}:
 *   patch:
 *     summary: Toggle like on a video
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Like toggled }
 *
 * /likes/video-like-count/{videoId}:
 *   get:
 *     summary: Get like count and liked state for a video
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "{ count: number, liked: boolean }" }
 *
 * /likes/getlikedvideos:
 *   get:
 *     summary: Get all videos liked by the current user
 *     tags: [Likes]
 *     responses:
 *       200: { description: Array of liked videos }
 */
router.route("/toggle-videolike/:videoId").patch(verifyJWT, toggleVideoLike);
router.route("/toggle-tweetlike/:tweetId").patch(verifyJWT, toggleTweetLike);
router.route("/toggle-commentlike/:commentId").patch(verifyJWT, toggleCommentLike);
router.route("/getlikedvideos").get(verifyJWT, getLikedVideos);
router.route("/video-like-count/:videoId").get(verifyJWT, getVideoLikeCount);
router.route("/comment-like-count/:commentId").get(verifyJWT, getCommentLikeCount);

export default router;