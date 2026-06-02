# Phase 1 — Critical Bug Fixes

**Branch:** `new-plans`
**Status:** ✅ Complete
**Files changed:** 3
**Commit:** `8e82c28`

---

## Overview

Before adding any new features or security layers, four real runtime bugs were identified through a full code audit. These bugs ranged from a serious authorization hole (anyone could delete anyone's video) to a `ReferenceError` that would crash a live endpoint, to silent failures caused by a missing `new` keyword. All four were fixed before any other work began.

---

## Bug 1 — Missing Ownership Check on `updateVideo` and `deleteVideo`

**File:** `BACKEND2/src/controllers/video.controller.js`
**Severity:** Critical (Authorization Bypass)

### What was wrong

Both `updateVideo` (PATCH `/api/v1/videos/:id`) and `deleteVideo` (DELETE `/api/v1/videos/:id`) accepted any valid `videoId` from any authenticated user and immediately performed the operation — no check that the requesting user actually owned the video.

```js
// BEFORE — deleteVideo
const video = await Video.findByIdAndDelete(videoId);  // deleted whoever's video
```

Any logged-in user could send `DELETE /api/v1/videos/<someone_else's_id>` and permanently remove content they did not create.

### What was fixed

Both handlers now fetch the video first, compare `video.owner` against `req.user._id`, and throw a `403 Forbidden` if they don't match. Only then does the actual update or delete proceed.

```js
// AFTER
const video = await Video.findById(videoId);
if (!video) throw new ApiError(404, "Video not found");
if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this video");
}
await Video.findByIdAndDelete(videoId);
```

### Why this matters in an interview

This is a textbook **Broken Object-Level Authorization (BOLA)** vulnerability — OWASP API Security Top 10 #1. Interviewers who do security-aware reviews will check this immediately. The fix demonstrates you understand that authentication (who are you?) and authorization (are you allowed to do this?) are separate concerns.

---

## Bug 2 — `getEsClient` Called But Never Imported

**File:** `BACKEND2/src/controllers/recommendation.controller.js`
**Severity:** High (Runtime `ReferenceError`)

### What was wrong

Three places in the recommendation controller called `getEsClient()` as if it were a globally available function, but it was never imported. In JavaScript ESM modules there is no implicit global — calling an undefined identifier throws a `ReferenceError` at runtime.

```js
// BEFORE — no import at the top, but called inside functions
const es = getEsClient();   // ReferenceError: getEsClient is not defined
```

The function `getEsClient` exists and is correctly implemented in `src/services/esClient.js`. It was simply never imported.

Additionally, two of the three `const es = getEsClient()` declarations were in functions (`getRecommendedVideos` and `getTagRecommendations`) that never actually used the `es` variable — the results were discarded. And in `getRelatedVideos`, the code called `es.search(...)` without checking whether `es` was `null` first (which it would be if `ELASTICSEARCH_URL` is not set).

### What was fixed

1. Added the missing import at the top of the file:
   ```js
   import { getEsClient } from "../services/esClient.js";
   ```

2. Removed the two unused `const es = getEsClient()` declarations from `getRecommendedVideos` and `getTagRecommendations`.

3. Added a null guard in `getRelatedVideos` before calling `es.search()`:
   ```js
   // BEFORE
   if (!relatedHits.length && video.tags?.length) {
       const { hits } = await es.search({ ... });
   }

   // AFTER
   if (es && !relatedHits.length && video.tags?.length) {
       const { hits } = await es.search({ ... });
   }
   ```
   This means: if Elasticsearch is not configured (no `ELASTICSEARCH_URL` env var), the code skips the ES query and falls through to the MongoDB tag-based fallback cleanly instead of crashing.

### Why this matters in an interview

Shows understanding of ESM module scoping (no globals), defensive null checking for optional infrastructure dependencies, and the pattern of graceful degradation — the app still works without Elasticsearch, it just uses a simpler fallback.

---

## Bug 3 — `throw ApiError(...)` Missing `new` Keyword

**File:** `BACKEND2/src/controllers/user.controller.js`
**Severity:** Medium (Silent Failure)

### What was wrong

Five locations in `user.controller.js` used `throw ApiError(400, "message")` — calling `ApiError` as a plain function rather than as a constructor.

```js
// BEFORE
throw ApiError(400, "username or email is missing");
```

`ApiError` is a class extending `Error`. When called without `new`, it returns `undefined` (or in some implementations, an unexpected value). The `throw` statement then throws `undefined`, which is caught by `asyncHandler` and results in an unhandled internal error with no meaningful message — the request just hangs or returns a generic 500 instead of the intended 400.

### What was fixed

All five occurrences replaced with `throw new ApiError(...)`:

```js
// AFTER
throw new ApiError(400, "username or email is missing");
```

Affected functions: `updateUserDetails`, `updateAvatar` (two places), `updatecoverImage` (two places).

### Why this matters in an interview

A classic JavaScript class constructor pitfall. Demonstrates attention to subtle language semantics and the importance of code review — this kind of bug doesn't show up as a syntax error but fails silently at runtime.

---

## Bug 4 — `console.log` of User Credentials in `registerUser`

**File:** `BACKEND2/src/controllers/user.controller.js`
**Severity:** Medium (PII / Data Leak)

### What was wrong

The `registerUser` handler contained a debug statement left over from development:

```js
const { username, fullname, email, password } = req.body;
console.log("username: ", username);  // logs user input on every signup
```

In production, this would write the submitted username to stdout on every registration attempt. If logs are aggregated (CloudWatch, Datadog, Logtail), usernames — and in the worst case, if the line were slightly different, passwords — would be stored in plain text in log systems. This is a GDPR/compliance issue.

### What was fixed

The line was deleted. No replacement needed — the variable is used correctly in the lines that follow.

### Why this matters in an interview

Logging PII is a common real-world incident. Knowing to audit for debug statements before shipping, and understanding why it's dangerous even when it "just" logs a username, shows production awareness.

---

## Summary of Changes

| File | Change |
|---|---|
| `video.controller.js` | Ownership guard added to `updateVideo` and `deleteVideo` |
| `recommendation.controller.js` | `getEsClient` imported; unused declarations removed; null guard added on `es.search` |
| `user.controller.js` | 5× `throw ApiError` → `throw new ApiError`; removed `console.log` |

**Lines added:** +22
**Lines removed:** -16
