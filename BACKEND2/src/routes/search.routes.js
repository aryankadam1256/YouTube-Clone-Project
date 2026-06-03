import { Router } from "express";
import { getSearchSuggestions, searchVideos } from "../controllers/search.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const router = Router();

/**
 * @swagger
 * /search/suggest:
 *   get:
 *     summary: Autocomplete search suggestions
 *     tags: [Search]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Array of suggestion strings from Elasticsearch }
 */
router.route("/suggest").get(getSearchSuggestions);

// Optional auth middleware - sets req.user if token is valid, but doesn't fail if missing
const optionalAuth = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || 
            req.header("Authorization")?.replace("Bearer ", "");
        
        if (token) {
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decodedToken?._id)
                .select("-password -refreshToken");
            
            if (user) {
                req.user = user;
            }
        }
    } catch (err) {
        // Ignore auth errors for optional auth
    }
    next();
});

/**
 * @swagger
 * /search/videos:
 *   get:
 *     summary: Full-text video search via Elasticsearch
 *     tags: [Search]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: language
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [relevance, views, publishedAt] }
 *     responses:
 *       200: { description: Paginated search results with relevance scores }
 */
router.route("/videos").get(optionalAuth, searchVideos);

export default router;

