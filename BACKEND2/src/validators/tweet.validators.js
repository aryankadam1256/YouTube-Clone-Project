import { z } from "zod";

export const createTweetSchema = z.object({
    content: z.string().trim().min(1, "Tweet cannot be empty").max(500),
});

export const updateTweetSchema = z.object({
    content: z.string().trim().min(1, "Tweet cannot be empty").max(500),
});
