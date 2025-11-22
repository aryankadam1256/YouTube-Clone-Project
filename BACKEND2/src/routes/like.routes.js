import { Router } from "express";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike, getVideoLikeCount } from "../controllers/like.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/toggle-videolike/:videoId").patch(verifyJWT, toggleVideoLike);

router.route("/toggle-tweetlike/:tweetId").patch(verifyJWT, toggleTweetLike);

router.route("/toggle-commentlike/:commentId").patch(verifyJWT, toggleCommentLike);

router.route("/getlikedvideos").get(verifyJWT, getLikedVideos);

router.route("/video-like-count/:videoId").get(verifyJWT, getVideoLikeCount);

export default router;