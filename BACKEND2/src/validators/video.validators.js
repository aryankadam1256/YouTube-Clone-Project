import { z } from "zod";

const tagsField = z
    .union([
        z.array(z.string().trim().max(50)),
        z.string().transform((s) => s.split(",").map((t) => t.trim()).filter(Boolean)),
    ])
    .optional()
    .default([]);

export const publishVideoSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(200),
    description: z.string().trim().min(1, "Description is required").max(5000),
    tags: tagsField,
    language: z.string().trim().max(10).optional().default("en"),
    publishedAt: z.string().datetime({ offset: true }).optional(),
    thumbnailUrl: z.string().url("Invalid thumbnail URL").optional(),
});

export const updateVideoSchema = z.object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).max(5000).optional(),
    thumbnail: z.string().url("Invalid thumbnail URL").optional(),
    tags: tagsField,
    language: z.string().trim().max(10).optional(),
    isPublished: z.boolean().optional(),
    publishedAt: z.string().datetime({ offset: true }).optional(),
    transcript: z.string().max(100000).optional(),
    transcriptUrl: z.string().url("Invalid transcript URL").optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
});
