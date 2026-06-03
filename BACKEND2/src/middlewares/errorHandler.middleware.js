import { ApiError } from "../utils/ApiError.js";

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
    // Normalize to ApiError shape
    let statusCode = 500;
    let message = "Internal Server Error";
    let errors = [];

    if (err instanceof ApiError) {
        statusCode = err.statuscode;
        message = err.message;
        errors = err.errors ?? [];
    } else if (err.name === "ValidationError") {
        // Mongoose validation error
        statusCode = 400;
        message = Object.values(err.errors).map((e) => e.message).join(", ");
    } else if (err.code === 11000) {
        // MongoDB duplicate key
        statusCode = 409;
        const field = Object.keys(err.keyValue ?? {})[0] ?? "field";
        message = `${field} already exists`;
    } else if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    } else if (err.message?.startsWith("CORS:")) {
        statusCode = 403;
        message = err.message;
    } else if (err.message) {
        message = err.message;
    }

    // Never expose stack trace to clients in production
    const body = {
        success: false,
        statusCode,
        message,
        ...(errors.length && { errors }),
        ...(process.env.NODE_ENV !== "production" && err.stack && { stack: err.stack }),
    };

    res.status(statusCode).json(body);
};
