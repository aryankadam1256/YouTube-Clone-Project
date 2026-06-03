import rateLimit from "express-rate-limit";

// Applied globally in app.js — 100 requests per 15 minutes per IP
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 429, message: "Too many requests, please try again later." },
});

// Applied only on /login and /register — 10 attempts per 15 minutes per IP
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 429, message: "Too many login attempts, please try again in 15 minutes." },
});
