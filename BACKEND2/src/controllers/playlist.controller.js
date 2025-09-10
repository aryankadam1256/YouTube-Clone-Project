import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const playlist = await Playlist.create({
        name:name,
        description:description,
        owner:req.user._id,
    })
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params;

    const userplaylists=await Playlist.find({owner:userId});
    return res.status(200).json(new ApiResponse(200,userplaylists,"User playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const playlist=await Playlist.findById(playlistId);
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;
    const playlist= await Playlist.findByIdAndUpdate(
        playlistId,
        {      
          $addToSet:{videos:videoId} // this is better than push as it avoids duplicates
        },
        { new :true}
    )

    return res.status(200).json(new ApiResponse(200,playlist,"Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;
    // TODO: remove video from playlist
    const playlist= await Playlist.findByIdAndUpdate(
        playlistId,
        {      
          $pull:{videos:videoId} // this is better than push as it avoids duplicates
        },
        { new :true}
    )

    return res.status(200).json(new ApiResponse(200,playlist,"Video deleted from the  playlist successfully"))
    

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    const playlist=await Playlist.findByIdAndDelete(playlistId);
    return res.status(200).json(new ApiResponse(200,playlist,"Playlist deleted successfully"));
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    const {name, description} = req.body;

    const playlist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
          $set:{
            name:name,
            description:description
          }
        },
        {new : true }   
)

    return res.status(200).json(new ApiResponse(200,playlist,"Playlist updated successfully"));

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}