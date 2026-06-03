# Phase 5 — API Documentation (Swagger / OpenAPI)

**Branch:** `new-plans`
**Status:** ✅ Complete
**Files changed:** 12
**Packages added:** `swagger-ui-express`, `swagger-jsdoc`

---

## Overview

Phase 5 adds a live, interactive API explorer to the backend. Every endpoint across all 11 route groups is documented with request parameters, body schemas, auth requirements, and response descriptions. The documentation is served directly by the API server at `/api/docs` so it always reflects the actual running code — it cannot drift out of sync.

---

## What Was Added

### `src/config/swagger.js`

The OpenAPI 3.0 spec definition file. Contains:

- **Info block:** title, version, description
- **Servers:** local dev URL (`http://localhost:8000/api/v1`)
- **Security schemes:** both `bearerAuth` (Authorization header) and `cookieAuth` (httpOnly cookie) — the API supports both
- **Reusable schemas:** `ApiResponse`, `ApiError`, `User`, `Video`, `Comment`, `Playlist` — referenced across endpoint definitions via `$ref`

The `apis` field points to all route files:
```js
apis: ["./src/routes/*.js"]
```
`swagger-jsdoc` scans these files for JSDoc `@swagger` blocks at build time and merges them into the spec.

### Route file annotations

All 11 route files received `@swagger` JSDoc comments on every endpoint:

| Route file | Endpoints documented |
|---|---|
| `user.routes.js` | register, login, logout, refresh-token, change-password, current-user, update-user, avatar, cover-image, channel profile, history |
| `video.routes.js` | list, trending, publish, toggle-publish, get, update, delete |
| `comment.routes.js` | list, add, update, delete |
| `recommendation.routes.js` | home feed, related, tag-based |
| `search.routes.js` | suggest (autocomplete), search |
| `like.routes.js` | toggle video/comment/tweet like, get count, get liked videos |
| `subscription.routes.js` | toggle, get subscribers, get subscribed channels |
| `dashboard.routes.js` | channel stats, channel videos |
| `events.routes.js` | log watch, log like |
| `tweet.routes.js` | create, list, update, delete |
| `playlist.routes.js` | create, get, update, delete, add/remove video |

**Total: 35 documented paths**

### `app.js` additions

Two new routes mounted before the 404 handler:

```js
// Interactive Swagger UI
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Raw OpenAPI JSON for Postman import / code generators
app.get("/api/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});
```

- `GET /api/docs` → Full interactive Swagger UI (try any endpoint live)
- `GET /api/docs.json` → Raw OpenAPI 3.0 JSON (importable into Postman, Insomnia, or any OpenAPI-compatible tool)

---

## How to Use It

1. Start the backend: `cd BACKEND2 && npm run dev`
2. Open `http://localhost:8000/api/docs`
3. Click any endpoint to expand it
4. Click "Try it out" → fill parameters → "Execute"
5. See the real response from the running server

For authenticated endpoints: click "Authorize" at the top right, paste your JWT access token.

---

## Interview Talking Point

"The Swagger spec is generated from JSDoc comments co-located with the route definitions rather than a separate YAML file. This means the docs update automatically when routes change — there's no separate documentation maintenance step. The raw JSON at `/api/docs.json` can be imported into Postman in one click, which I use for manual testing. If I were adding TypeScript, the Zod schemas from Phase 2 would generate OpenAPI schemas automatically via `zod-to-openapi`, eliminating the JSDoc comments entirely."

---

## Summary of Changes

| File | Change |
|---|---|
| `src/config/swagger.js` | Created — OpenAPI spec config with shared schemas |
| `src/app.js` | Mount `/api/docs` (Swagger UI) and `/api/docs.json` |
| `src/routes/user.routes.js` | 10 endpoint annotations |
| `src/routes/video.routes.js` | 7 endpoint annotations |
| `src/routes/comment.routes.js` | 4 endpoint annotations |
| `src/routes/recommendation.routes.js` | 3 endpoint annotations |
| `src/routes/search.routes.js` | 2 endpoint annotations |
| `src/routes/like.routes.js` | 3 grouped annotations |
| `src/routes/subscription.routes.js` | 3 grouped annotations |
| `src/routes/dashboard.routes.js` | 2 grouped annotations |
| `src/routes/events.routes.js` | 2 endpoint annotations |
| `src/routes/tweet.routes.js` | 4 endpoint annotations (added in same pass) |
| `src/routes/playlist.routes.js` | 6 endpoint annotations (added in same pass) |

**Packages added:** `swagger-ui-express`, `swagger-jsdoc`
