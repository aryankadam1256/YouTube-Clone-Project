import { Router } from "express";
import { addComment, deleteComment,getVideoComments,updateComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { addCommentSchema, updateCommentSchema } from "../validators/comment.validators.js";

const router = Router();

/**
 * @swagger
 * /comments/{videoId}:
 *   get:
 *     summary: Get all comments for a video
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Array of comments with owner details }
 */
router.route("/:videoId").get(verifyJWT, getVideoComments);

/**
 * @swagger
 * /comments/add-comment/{videoId}:
 *   post:
 *     summary: Add a comment to a video
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [comment]
 *             properties:
 *               comment: { type: string, maxLength: 2000 }
 *     responses:
 *       200: { description: Comment created }
 *       400: { description: Empty comment rejected }
 */
router.route("/add-comment/:videoId").post(verifyJWT, validateBody(addCommentSchema), addComment);

/**
 * @swagger
 * /comments/delete-comment/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Comment deleted }
 */
router.route("/delete-comment/:commentId").delete(verifyJWT, deleteComment);

/**
 * @swagger
 * /comments/update-comment/{commentId}:
 *   patch:
 *     summary: Update a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newcomment]
 *             properties:
 *               newcomment: { type: string, maxLength: 2000 }
 *     responses:
 *       200: { description: Comment updated }
 */
router.route("/update-comment/:commentId").patch(verifyJWT, validateBody(updateCommentSchema), updateComment);

export default router;