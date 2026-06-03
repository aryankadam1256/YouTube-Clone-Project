import { Router } from "express";
import {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    updatePlaylist,
    removeVideoFromPlaylist,
    addVideoToPlaylist
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { createPlaylistSchema, updatePlaylistSchema } from "../validators/playlist.validators.js";

const router = Router();

router.route("/playlists/:playlistId/add-video/:videoId")
    .patch(verifyJWT, addVideoToPlaylist);

router.route("/playlists/:playlistId/remove-video/:videoId")
    .patch(verifyJWT, removeVideoFromPlaylist);

router.route("/playlists/:playlistId")
    .get(verifyJWT, getPlaylistById);

router.route("/playlists")
    .post(verifyJWT, validateBody(createPlaylistSchema), createPlaylist);

router.route("/users/:userId/playlists")
    .get(verifyJWT, getUserPlaylists);

router.route("/playlists/:playlistId")
    .patch(verifyJWT, validateBody(updatePlaylistSchema), updatePlaylist);

router.route("/playlists/:playlistId")
    .delete(verifyJWT, deletePlaylist);

export default router;
