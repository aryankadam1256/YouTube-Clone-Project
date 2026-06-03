import { z } from "zod";

export const registerSchema = z.object({
    fullname: z.string().trim().min(2, "Full name must be at least 2 characters").max(50),
    username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(30)
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z.string().trim().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100),
});

export const loginSchema = z.object({
    username: z.string().trim().optional(),
    email: z.string().trim().email("Invalid email").optional(),
    password: z.string().min(1, "Password is required"),
}).refine((data) => data.username || data.email, {
    message: "Either username or email is required",
});

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters").max(100),
});

export const updateUserSchema = z.object({
    newfullname: z.string().trim().min(2).max(50),
    newemail: z.string().trim().email("Invalid email address"),
});
