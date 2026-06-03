import { Router } from "express";
import {
    loginUser,
     registerUser,
     logoutUser,
      refreshAccessToken,
      getCurrentUser,
       updateUserDetails,
        updatecoverImage,
       changeCurrentPassword,
        updateAvatar,
         getUserChannelProfile,
          getWatchHistory
         } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
    registerSchema,
    loginSchema,
    changePasswordSchema,
    updateUserSchema,
} from "../validators/user.validators.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";

const router=Router();

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [fullname, username, email, password, avatar]
 *             properties:
 *               fullname: { type: string, example: "Aryan Kadam" }
 *               username: { type: string, example: "aryan123" }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               avatar: { type: string, format: binary }
 *               coverImage: { type: string, format: binary }
 *     responses:
 *       201: { description: User registered successfully }
 *       400: { description: Validation error or user already exists }
 *       429: { description: Too many requests }
 */
router.route("/register").post(
     authLimiter,
     upload.fields([
         {name:"avatar",maxCount:1},
         {name:"coverImage",maxCount:1}
     ]),
     validateBody(registerSchema),
     registerUser
     )

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login with username/email and password
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               username: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful — sets httpOnly JWT cookies }
 *       401: { description: Invalid credentials }
 *       429: { description: Too many login attempts }
 */
router.route("/login").post(authLimiter, validateBody(loginSchema), loginUser);

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout and clear auth cookies
 *     tags: [Users]
 *     responses:
 *       200: { description: Logged out successfully }
 */
router.route("/logout").post(verifyJWT,logoutUser);

/**
 * @swagger
 * /users/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token cookie
 *     tags: [Users]
 *     security: []
 *     responses:
 *       200: { description: New access token issued }
 *       401: { description: Invalid or expired refresh token }
 */
router.route("/refresh-token").post(refreshAccessToken);

/**
 * @swagger
 * /users/change-password:
 *   post:
 *     summary: Change current user password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *     responses:
 *       200: { description: Password changed }
 *       401: { description: Old password incorrect }
 */
router.route("/change-password").post(verifyJWT, validateBody(changePasswordSchema), changeCurrentPassword);

/**
 * @swagger
 * /users/current-user:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags: [Users]
 *     responses:
 *       200: { description: Current user profile }
 */
router.route("/current-user").get(verifyJWT,getCurrentUser);

/**
 * @swagger
 * /users/update-user:
 *   patch:
 *     summary: Update fullname and email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newfullname, newemail]
 *             properties:
 *               newfullname: { type: string }
 *               newemail: { type: string, format: email }
 *     responses:
 *       200: { description: User updated }
 */
router.route("/update-user").patch(verifyJWT, validateBody(updateUserSchema), updateUserDetails);

/**
 * @swagger
 * /users/avatar:
 *   patch:
 *     summary: Update profile avatar
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar: { type: string, format: binary }
 *     responses:
 *       200: { description: Avatar updated }
 */
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar);

/**
 * @swagger
 * /users/cover-image:
 *   patch:
 *     summary: Update channel cover image
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               coverImage: { type: string, format: binary }
 *     responses:
 *       200: { description: Cover image updated }
 */
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updatecoverImage);

/**
 * @swagger
 * /users/c/{username}:
 *   get:
 *     summary: Get public channel profile by username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Channel profile with subscriber count }
 *       404: { description: Channel not found }
 */
router.route("/c/:username").get(verifyJWT,getUserChannelProfile);

/**
 * @swagger
 * /users/history:
 *   get:
 *     summary: Get watch history of current user
 *     tags: [Users]
 *     responses:
 *       200: { description: Array of watched videos }
 */
router.route("/history").get(verifyJWT,getWatchHistory);

export default router;
