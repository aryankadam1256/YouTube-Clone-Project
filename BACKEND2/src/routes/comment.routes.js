import { Router } from "express";
import { addComment, deleteComment,getVideoComments,updateComment } from "../controllers/comment.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/add-comment/:videoId").post(verifyJWT, addComment);

router.route("/delete-comment/:commentId").delete(verifyJWT, deleteComment);

router.route("/update-comment/:commentId").patch(verifyJWT, updateComment);

router.route("/update-comment/:videoId").get(verifyJWT, getVideoComments);

export default router;