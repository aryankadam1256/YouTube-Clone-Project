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

router.route("/register").post(
     authLimiter,
     upload.fields([
         {name:"avatar",maxCount:1},
         {name:"coverImage",maxCount:1}
     ]),
     validateBody(registerSchema),
     registerUser
     )

router.route("/login").post(authLimiter, validateBody(loginSchema), loginUser);

// SECURE ROUTE

router.route("/logout").post(verifyJWT,logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, validateBody(changePasswordSchema), changeCurrentPassword);

router.route("/current-user").get(verifyJWT,getCurrentUser);

router.route("/update-user").patch(verifyJWT, validateBody(updateUserSchema), updateUserDetails);

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar);

router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updatecoverImage);

router.route("/c/:username").get(verifyJWT,getUserChannelProfile);

router.route("/history").get(verifyJWT,getWatchHistory);

export default router; 