import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { globalLimiter } from "./middlewares/rateLimiter.middleware.js";

const app = express();

// Security headers (XSS, clickjacking, MIME sniffing, HSTS, etc.)
app.use(helmet());

// CORS — only allow explicitly listed origins; never fall back to wildcard
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
    : [];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
}));

// Global rate limit — 100 req / 15 min per IP across all routes
app.use(globalLimiter);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.use(cookieParser());





// router import
import userRouter from "./routes/user.routes.js";
import commentRouter from "./routes/comment.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import recommendationRouter from "./routes/recommendation.routes.js";
import searchRouter from "./routes/search.routes.js";
import eventsRouter from "./routes/events.routes.js";
// routes declaration
app.use("/api/v1/users", userRouter);

app.use("/api/v1/comments", commentRouter);

app.use("/api/v1/subscriptions", subscriptionRouter);

app.use("/api/v1/likes", likeRouter);

app.use("/api/v1/playlists", playlistRouter);

app.use("/api/v1/videos", videoRouter);

app.use("/api/v1/tweets", tweetRouter);

app.use("/api/v1/dashboards", dashboardRouter);

app.use("/api/v1/recommendations", recommendationRouter);

app.use("/api/v1/search", searchRouter);

app.use("/api/v1/events", eventsRouter);

//http://localhost:8000/api/v1/users/register





export { app };
