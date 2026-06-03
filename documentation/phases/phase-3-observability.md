# Phase 3 — Observability

**Branch:** `new-plans`
**Status:** ✅ Complete
**Files changed:** 4
**Packages added:** `morgan`

---

## Overview

Observability answers the question: *"How do you debug a production incident?"* Before Phase 3, the answer was: you can't — there were no request logs, error formatting was inconsistent across the codebase, and an unhandled promise rejection would crash the process silently. This phase adds structured logging, a single source of truth for error responses, and process-level safety nets.

---

## 3a — Morgan Request Logging

**File changed:** `BACKEND2/src/app.js`

### What was added

```js
import morgan from "morgan";
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
```

Morgan is a request logger middleware. It logs every incoming HTTP request automatically.

**In development** (`dev` format):
```
GET /api/v1/videos 200 42ms - 1.2kb
POST /api/v1/users/login 401 11ms - 89b
```
Colorized by status code (green for 2xx, yellow for 3xx, red for 4xx/5xx), very readable.

**In production** (`combined` format — Apache Combined Log Format):
```
::1 - - [02/Jun/2026:18:45:01 +0000] "GET /api/v1/videos HTTP/1.1" 200 1248 "-" "Mozilla/5.0..."
```
Parseable by log aggregators (Datadog, CloudWatch, Splunk, Loki) without configuration.

Morgan is placed immediately after `helmet` and before all other middleware so every request — including ones rejected early by CORS or rate limiting — is logged.

### Interview talking point

"I use `morgan` with environment-specific formats. In production the combined format writes to stdout, which is collected by the container runtime (Docker logs / Kubernetes) and forwarded to whatever log aggregator the infra team uses. To avoid logging sensitive request bodies, I use the default token set — it only logs method, URL, status, response time, and content-length."

---

## 3b — Global Error Handler Middleware

**Files changed/created:** `src/middlewares/errorHandler.middleware.js`, `src/app.js`, `src/utils/asyncHandler.js`

### What was wrong

Error handling was split across the codebase in two places:
1. `asyncHandler.js` caught errors and sent responses directly with inconsistent status codes
2. Any error thrown from non-async code or middleware that didn't go through `asyncHandler` would become an unhandled rejection

There was no single place that controlled the shape of error responses. Some routes returned `{ success, message, stack }`, others returned whatever format the middleware happened to use.

### What was changed

**`asyncHandler.js` — simplified to just forward errors:**

```js
// BEFORE: caught errors and sent responses directly
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        return await fn(req, res, next);
    } catch (err) {
        res.status(statusCode).json({ success: false, message: err.message, ... });
    }
};

// AFTER: forwards to Express error pipeline
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
```

`next(err)` hands the error to Express's 4-argument error middleware, which is the standard Express pattern. This means every error — from any route, any middleware, any async function — flows through exactly one place.

**`errorHandler.middleware.js` — the single error response formatter:**

Handles five distinct error categories:
```js
if (err instanceof ApiError)          → use err.statuscode + err.message
if (err.name === "ValidationError")   → Mongoose schema error → 400
if (err.code === 11000)               → MongoDB duplicate key → 409 with field name
if (err.name === "CastError")         → Invalid ObjectId → 400
if (err.message?.startsWith("CORS:")) → CORS rejection → 403
else                                  → 500 Internal Server Error
```

Stack traces are included in development, stripped in production:
```js
...(process.env.NODE_ENV !== "production" && err.stack && { stack: err.stack })
```

**`app.js` — 404 handler + error handler mounted after all routes:**

```js
// Must be after all routes — catches unknown paths
app.use((req, res) => {
    res.status(404).json({ success: false, statusCode: 404, message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Must be last — Express identifies error middleware by the 4-arg signature
app.use(errorHandler);
```

### Interview talking point

"The key insight is that Express distinguishes error middleware by arity — it only treats a 4-argument `(err, req, res, next)` function as an error handler. By converting `asyncHandler` to call `next(err)` instead of responding directly, I centralized all error formatting in one place. This makes it trivial to add Sentry later — I just call `Sentry.captureException(err)` at the top of the error handler before sending the response."

---

## 3c — Process-Level Safety Nets

**File changed:** `BACKEND2/src/index.js`

### What was wrong

If a Promise rejected outside of an Express request (e.g., in a background service, a scheduled task, or a top-level await that failed), or if a synchronous bug threw an exception outside of a try/catch, the Node.js process would:
- Print a deprecation warning
- In older Node: continue running in an undefined state
- In Node 15+: crash with exit code 1 but with no logged context about why

### What was added

```js
process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
    process.exit(1);
});

process.on("uncaughtException", (err) => {
    console.error("[uncaughtException]", err);
    process.exit(1);
});
```

Both handlers log the full error before exiting, so the crash reason always appears in logs. `process.exit(1)` is intentional — a process in an unknown state should not continue serving requests. In production with Docker/Kubernetes, the container restarts automatically.

The startup `connectDB().catch()` was also upgraded to call `process.exit(1)` on failure instead of silently continuing.

### Interview talking point

"Calling `process.exit(1)` on `uncaughtException` is intentional. The Node docs explicitly recommend it — once an uncaught exception fires, the process may be in a corrupt state. Better to crash fast and let the container orchestrator restart a clean instance than to limp along serving bad responses. This is the 'let it crash' philosophy from Erlang applied to Node."

---

## Summary of Changes

| File | Change |
|---|---|
| `app.js` | Added `morgan` logging; added 404 handler; mounted `errorHandler` last |
| `utils/asyncHandler.js` | Simplified to `Promise.resolve(fn).catch(next)` — no more inline response sending |
| `middlewares/errorHandler.middleware.js` | Created — single formatter for all error types |
| `index.js` | Added `unhandledRejection` + `uncaughtException` handlers; `process.exit(1)` on DB fail |

**Package added:** `morgan@^1`
