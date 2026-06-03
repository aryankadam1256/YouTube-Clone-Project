import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";

if (process.env.NODE_ENV !== "production") {
    dotenv.config({ path: "./.env" });
}

// Catch async errors that escape route handlers
process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
    process.exit(1);
});

// Catch synchronous errors (programming bugs, not request errors)
process.on("uncaughtException", (err) => {
    console.error("[uncaughtException]", err);
    process.exit(1);
});

connectDB()
    .then(() => {
        const port = process.env.PORT || 8000;
        app.listen(port, () => {
            console.log(`[server] running on port ${port} (${process.env.NODE_ENV || "development"})`);
        });
    })
    .catch((err) => {
        console.error("[startup] MongoDB connection failed:", err);
        process.exit(1);
    });


