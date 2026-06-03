import { Router } from "express";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *
 * /subscriptions/toggle-subscription/{channelId}:
 *   patch:
 *     summary: Subscribe or unsubscribe from a channel
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Subscription toggled }
 *
 * /subscriptions/subscribers/{channelId}:
 *   get:
 *     summary: Get subscriber list for a channel
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Array of subscribers }
 *
 * /subscriptions/subscribed-channels/{subscriberId}:
 *   get:
 *     summary: Get channels a user is subscribed to
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: subscriberId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Array of subscribed channels }
 */
router.route("/toggle-subscription/:channelId").patch(verifyJWT, toggleSubscription);
router.route("/subscribers/:channelId").get(verifyJWT,getUserChannelSubscribers);
router.route("/subscribed-channels/:subscriberId").get(verifyJWT, getSubscribedChannels);

export default router;