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

const router = Router();

// Add a video to a playlist
router.route("/playlists/:playlistId/add-video/:videoId")
    .patch(verifyJWT, addVideoToPlaylist);  // PATCH is suitable for updating an existing playlist

// Remove a video from a playlist
router.route("/playlists/:playlistId/remove-video/:videoId")
    .patch(verifyJWT, removeVideoFromPlaylist);

// Get a single playlist by ID
router.route("/playlists/:playlistId")
    .get(verifyJWT, getPlaylistById);

// Create a new playlist
router.route("/playlists")
    .post(verifyJWT, createPlaylist);

// Get all playlists of a user
router.route("/users/:userId/playlists")
    .get(verifyJWT, getUserPlaylists);

// Update playlist details
router.route("/playlists/:playlistId")
    .patch(verifyJWT, updatePlaylist);

// Delete a playlist
router.route("/playlists/:playlistId")
    .delete(verifyJWT, deletePlaylist);

export default router;
