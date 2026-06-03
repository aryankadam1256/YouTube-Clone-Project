import { Router } from "express";
import { addComment, deleteComment,getVideoComments,updateComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { addCommentSchema, updateCommentSchema } from "../validators/comment.validators.js";

const router = Router();

router.route("/add-comment/:videoId").post(verifyJWT, validateBody(addCommentSchema), addComment);

router.route("/delete-comment/:commentId").delete(verifyJWT, deleteComment);

router.route("/update-comment/:commentId").patch(verifyJWT, validateBody(updateCommentSchema), updateComment);

router.route("/:videoId").get(verifyJWT, getVideoComments);

export default router;