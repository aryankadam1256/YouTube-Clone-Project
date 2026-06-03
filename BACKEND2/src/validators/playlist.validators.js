import { z } from "zod";

export const createPlaylistSchema = z.object({
    name: z.string().trim().min(1, "Playlist name is required").max(100),
    description: z.string().trim().max(500).optional().default(""),
});

export const updatePlaylistSchema = z.object({
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().max(500).optional(),
}).refine((data) => data.name !== undefined || data.description !== undefined, {
    message: "Provide at least one field to update",
});
