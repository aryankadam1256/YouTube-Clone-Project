import { Router } from "express";
import { getSearchSuggestions, searchVideos } from "../controllers/search.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const router = Router();

// Get search suggestions (autocomplete) - public endpoint
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

// Search videos - optional auth (better ranking if authenticated)
router.route("/videos").get(optionalAuth, searchVideos);

export default router;

