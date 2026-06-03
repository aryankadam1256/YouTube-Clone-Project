# Phase 2 — Security Layer

**Branch:** `new-plans`
**Status:** ✅ Complete
**Files changed:** 10
**Packages added:** `helmet`, `express-rate-limit`, `zod`

---

## Overview

Phase 2 adds four independent security layers to the backend. None of these require database changes — they are all middleware-level additions that sit in front of the existing route handlers. Together they address the OWASP API Security Top 10 categories of broken authentication, lack of rate limiting, missing security headers, and insufficient input validation.

---

## 2a — Helmet (Security Headers)

**File changed:** `BACKEND2/src/app.js`

### What was wrong

The Express app had no HTTP security headers configured. By default, Express sends no protection headers whatsoever, leaving browsers without guidance on how to handle cross-site scripting, clickjacking, MIME sniffing, and other common attacks.

### What was added

```js
import helmet from "helmet";
app.use(helmet());
```

One line. `helmet` sets 11 HTTP response headers automatically:

| Header | Protection |
|---|---|
| `Content-Security-Policy` | Restricts sources for scripts, styles, images — blocks XSS injection |
| `X-Frame-Options: SAMEORIGIN` | Prevents clickjacking via `<iframe>` embedding |
| `X-Content-Type-Options: nosniff` | Stops browsers from MIME-sniffing response types |
| `Strict-Transport-Security` | Forces HTTPS on repeat visits (HSTS) |
| `Referrer-Policy` | Controls how much URL info is sent in the Referer header |
| `X-DNS-Prefetch-Control` | Disables DNS prefetching to prevent info leakage |
| `X-Download-Options` | Prevents IE from executing downloads in site context |
| `X-Permitted-Cross-Domain-Policies` | Blocks Flash/PDF cross-domain requests |
| `Cross-Origin-Embedder-Policy` | Controls cross-origin resource embedding |
| `Cross-Origin-Opener-Policy` | Isolates the browsing context |
| `Cross-Origin-Resource-Policy` | Limits which origins can load resources |

### Interview talking point

"I added `helmet` as the first middleware before all routes. It's a zero-config way to satisfy the browser's expectations for a secure origin. The headers are set per-response so they can be individually overridden if specific routes need different policies."

---

## 2b — Rate Limiting

**Files changed/created:** `app.js`, `src/middlewares/rateLimiter.middleware.js`

### What was wrong

There were no request limits anywhere. A bot could hammer `/users/login` with millions of password attempts — a classic brute-force attack — with zero server-side resistance.

### What was added

Two limiters are defined in `rateLimiter.middleware.js`:

```js
// Global — 100 requests per 15 minutes per IP
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,   // sends RateLimit-* headers per RFC 6585
    legacyHeaders: false,
});

// Auth — 10 attempts per 15 minutes per IP (brute-force protection)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
});
```

- `globalLimiter` is applied in `app.js` before all routes — every single endpoint is covered
- `authLimiter` is applied directly in `user.routes.js` on `/register` and `/login` — half the global limit, specifically to make credential stuffing expensive

When a client exceeds the limit they receive:
```
HTTP 429 Too Many Requests
RateLimit-Limit: 10
RateLimit-Remaining: 0
RateLimit-Reset: <timestamp>
```

### Interview talking point

"I used a sliding window counter stored in memory by default. In production with multiple server instances, I'd back it with Redis using the `rate-limit-redis` store so limits are shared across instances — otherwise each pod tracks separately and the limit is effectively multiplied by the number of pods."

---

## 2c — CORS Hardening

**File changed:** `BACKEND2/src/app.js`

### What was wrong

The original CORS config fell back to `"*"` (allow all origins) if `CORS_ORIGIN` env var was not set:

```js
// BEFORE — dangerous default
origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*"
```

If someone deployed this without setting `CORS_ORIGIN`, every browser on the internet could make credentialed cross-origin requests to the API.

### What was fixed

The fallback is now an empty array — meaning `no origins allowed` if the env var is not configured:

```js
// AFTER
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
    : [];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);  // allow Postman, curl, mobile
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
}));
```

Requests with no `Origin` header (Postman, curl, server-to-server) are still allowed because they cannot read the response via a browser's same-origin policy anyway.

### Interview talking point

"CORS is a browser enforcement mechanism — it doesn't protect against server-to-server requests or curl. The real protection is authentication. But `credentials: true` with a wildcard origin is specifically dangerous because it lets any site make authenticated requests on behalf of a logged-in user. That's a CSRF vector, so tightening the origin allowlist is the right call."

---

## 2d — Zod Input Validation

**Files created:**
- `src/middlewares/validate.middleware.js`
- `src/validators/user.validators.js`
- `src/validators/video.validators.js`
- `src/validators/comment.validators.js`
- `src/validators/tweet.validators.js`
- `src/validators/playlist.validators.js`

**Files updated:** `user.routes.js`, `video.routes.js`, `comment.routes.js`, `tweet.routes.js`, `playlist.routes.js`

### What was wrong

Every route that accepted `req.body` passed it directly to the controller with no structural validation. A malicious or malformed request could send:
- Extra fields that get written to the database (mass assignment)
- Fields of the wrong type that cause runtime crashes
- Oversized strings that stress the database
- Missing required fields caught only by MongoDB's schema validation (which returns ugly, internal error messages)

### What was added

**`validate.middleware.js`** — a generic Zod middleware factory:

```js
export const validateBody = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const message = result.error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ");
        return next(new ApiError(400, message));
    }
    req.body = result.data;  // replace with parsed+stripped output
    next();
};
```

The key behaviour: `req.body = result.data` — Zod's output only contains fields defined in the schema. Any extra fields sent by the client are silently stripped before the controller sees them. This prevents mass assignment.

**Schemas cover:**

| Route | Schema | Key rules |
|---|---|---|
| `POST /users/register` | `registerSchema` | username: 3-30 chars, alphanumeric+underscore only; password: 8+ chars; valid email |
| `POST /users/login` | `loginSchema` | requires either username or email (`.refine()`) + password |
| `POST /users/change-password` | `changePasswordSchema` | oldPassword required, newPassword 8+ chars |
| `PATCH /users/update-user` | `updateUserSchema` | valid email, name 2-50 chars |
| `POST /videos/publish` | `publishVideoSchema` | title 1-200, description 1-5000, tags array or comma string |
| `PATCH /videos/:id` | `updateVideoSchema` | all fields optional, at least one required |
| `POST /comments/...` | `addCommentSchema` | 1-2000 chars |
| `PATCH /comments/...` | `updateCommentSchema` | 1-2000 chars |
| `POST /tweets/...` | `createTweetSchema` | 1-500 chars |
| `PATCH /tweets/...` | `updateTweetSchema` | 1-500 chars |
| `POST /playlists/...` | `createPlaylistSchema` | name required, description optional |
| `PATCH /playlists/...` | `updatePlaylistSchema` | at least one of name/description |

### Interview talking point

"I chose Zod over Joi because it's TypeScript-native and the schema doubles as a type definition — if we ever migrate to TypeScript, the validators stay identical. The `safeParse` approach means validation errors never throw; they return a result object, which plays cleanly with our async error handler. And since I reassign `req.body = result.data`, controllers get a known-good, stripped object — they never see fields the schema didn't define."

---

## Summary of All Changes

| File | Type | Change |
|---|---|---|
| `app.js` | Modified | Added `helmet`, hardened CORS, added `globalLimiter` |
| `middlewares/rateLimiter.middleware.js` | Created | `globalLimiter` + `authLimiter` definitions |
| `middlewares/validate.middleware.js` | Created | `validateBody(schema)` factory middleware |
| `validators/user.validators.js` | Created | 4 schemas: register, login, changePassword, updateUser |
| `validators/video.validators.js` | Created | 2 schemas: publishVideo, updateVideo |
| `validators/comment.validators.js` | Created | 2 schemas: addComment, updateComment |
| `validators/tweet.validators.js` | Created | 2 schemas: createTweet, updateTweet |
| `validators/playlist.validators.js` | Created | 2 schemas: createPlaylist, updatePlaylist |
| `routes/user.routes.js` | Modified | Added `authLimiter` on register/login; `validateBody` on 4 routes |
| `routes/video.routes.js` | Modified | Added `validateBody` on publish and update |
| `routes/comment.routes.js` | Modified | Added `validateBody` on add and update |
| `routes/tweet.routes.js` | Modified | Added `validateBody` on create and update |
| `routes/playlist.routes.js` | Modified | Added `validateBody` on create and update |

**Packages added:** `helmet@^8`, `express-rate-limit@^7`, `zod@^3`
