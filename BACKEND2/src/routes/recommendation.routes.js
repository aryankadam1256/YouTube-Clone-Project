import { Router } from "express";
import { getRecommendedVideos, getRelatedVideos, getTagRecommendations } from "../controllers/recommendation.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Personalized feed (requires authentication)
router.route("/").get(verifyJWT, getRecommendedVideos);

// Related recommendations (public)
router.route("/:videoId/related").get(getRelatedVideos);

// Tag-based discovery (public)
router.route("/tags").get(getTagRecommendations);

export default router;

