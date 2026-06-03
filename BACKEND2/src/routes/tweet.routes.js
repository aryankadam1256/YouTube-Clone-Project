import { Router } from "express";
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { createTweetSchema, updateTweetSchema } from "../validators/tweet.validators.js";

const router = Router();

router.route("/create-tweet").post(verifyJWT, validateBody(createTweetSchema), createTweet);

router.route("/get-user-tweets/:userId").get(verifyJWT, getUserTweets);

router.route("/update-tweet/:tweetId").patch(verifyJWT, validateBody(updateTweetSchema), updateTweet);

router.route("/delete-tweet/:tweetId").delete(verifyJWT, deleteTweet);

export default router;