import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { logLikeEvent, logWatchEvent } from "../controllers/events.controller.js";

const router = Router();

router.post("/watch", verifyJWT, logWatchEvent);
router.post("/like", verifyJWT, logLikeEvent);

export default router;

