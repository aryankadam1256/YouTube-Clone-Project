import { z } from "zod";

export const addCommentSchema = z.object({
    comment: z.string().trim().min(1, "Comment cannot be empty").max(2000),
});

export const updateCommentSchema = z.object({
    newcomment: z.string().trim().min(1, "Comment cannot be empty").max(2000),
});
