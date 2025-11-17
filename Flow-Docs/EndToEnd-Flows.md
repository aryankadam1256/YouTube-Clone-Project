# YouTube Clone: End-to-End Flow Maps

This document explains, in detail, how the app processes requests from the moment a user interacts on the frontend to the backend and data systems, then back. It covers two complete examples:

1. Login/Register -> Home -> Recommended Videos
2. Search -> Suggestions and Result Listing

It maps files and functions in both Frontend and Backend, including Elasticsearch and Embeddings.

---

## Tech Overview (Quick)

- Frontend: React (Vite), React Router, Axios (`src/api/index.js`), Auth Context (`src/context/AuthContext.jsx`).
- Backend: Node.js, Express, MongoDB (Mongoose), Elasticsearch, Cloudinary.
- Embeddings: Hugging Face Inference API via `src/services/embeddings.js`.
- Indexing/Search: `src/services/videoIndexer.js`, `src/controllers/search.controller.js`.
- Recommendations: `src/controllers/recommendation.controller.js`.

---

## Example 1: Login/Register to Home with Recommended Videos

### 1) User opens app and logs in

Frontend
- File: `FRONTEND-2/src/pages/Login.jsx`
  - On submit, calls `authAPI.login(credentials)` from `FRONTEND-2/src/api/index.js`.
  - Stores `accessToken` in localStorage on success (handled by interceptor), saves `user` in AuthContext.
- File: `FRONTEND-2/src/context/AuthContext.jsx`
  - Manages `isAuthenticated`, `user`, and provides `logout`.
  - Axios interceptor adds `Authorization: Bearer <token>` automatically.

Backend
- File: `BACKEND2/src/controllers/user.controller.js`
  - `loginUser(req, res)`:
    - Normalizes username/email.
    - Verifies password, issues `accessToken` and `refreshToken`.
    - Persists refresh cookie; returns `user` + `accessToken`.
- File: `BACKEND2/src/routes/user.routes.js`
  - Route: `POST /api/v1/users/login -> loginUser`.
- File: `BACKEND2/src/app.js`
  - Attaches routes under `/api/v1`.

Notes
- Register uses `authAPI.register`; controller `registerUser` uploads avatar/cover, creates `User`, normalizes email/username.

### 2) Navigate to Home

Frontend
- File: `FRONTEND-2/src/App.jsx`
  - Route `/` renders `Home` inside authenticated `Layout` (Navbar + Sidebar).
- File: `FRONTEND-2/src/pages/Home.jsx`
  - On mount:
    - If authenticated: calls `recommendAPI.home()` to load personalized feed.
    - Else: `videoAPI.getAllVideos()` for generic listing.
  - Renders grid of `VideoCard` components.

Backend (Recommendations)
- File: `BACKEND2/src/controllers/recommendation.controller.js`
  - `getRecommendedVideos(req, res)` flow:
    - Gathers user context: watch history, likes, subscriptions (
      may be used to build a user preference vector).
    - If Elasticsearch available and a `userEmbedding` can be produced:
      1) ES KNN Search on `embedding` to get semantically similar videos.
      2) Lexical search boosted by subscribed channels, tags, views, recency.
      3) Fuse with Reciprocal Rank Fusion (RRF) to score and merge results.
    - Else Fallback (Mongo Aggregation): score by subscribed channels, tag overlap, views, recency.
  - `getRelatedVideos(videoId)` and `getTagRecommendations(tags)` use similar hybrid strategies.
- File: `BACKEND2/src/routes/recommendation.routes.js` (mounted in `app.js`)
  - Route: `GET /api/v1/recommendations -> getRecommendedVideos`.

Data/Indexing Path
- File: `BACKEND2/src/controllers/video.controller.js`
  - On upload (`publishAVideo`): compute embedding via `generateEmbedding` on title+desc+tags; set on `Video` doc; call `indexVideo`.
- File: `BACKEND2/src/services/embeddings.js`
  - `generateEmbedding(text)` uses Hugging Face model (via `HF_API_KEY`), normalizes vector.
- File: `BACKEND2/src/services/videoIndexer.js`
  - `indexVideo(videoId)` fetches video + owner, ensures embedding present, builds ES document, indexes into `VIDEO_INDEX`.

Frontend Rendering
- File: `FRONTEND-2/src/components/VideoCard.jsx`
  - Displays thumbnail, title, channel avatar/username, views, and date.
- File: `FRONTEND-2/src/pages/VideoDetail.jsx`
  - When a user opens a video:
    - `videoAPI.getVideoById(videoId)` fetches data.
    - Like state: `likeAPI.getVideoLikeCount(videoId)` and `likeAPI.toggleVideoLike(videoId)`.
    - Subscribe state: fetch `dashboardAPI.getChannelStats(ownerId)` for count; `channelAPI.getByUsername(username)` for `isSubscribed`.
    - Toggle: `subscriptionAPI.toggle(channelId)` then refresh stats.
    - Comments: rendered via `CommentBox`, calls `commentAPI`.
    - Recommendation event logging: `recommendAPI.logWatch(videoId)` and `recommendAPI.logLike(videoId)` optionally inform the engine.

Summary Flow (Login -> Home -> Recommendations)
- Login.jsx -> `authAPI.login` -> user.controller.loginUser -> returns tokens
- App.jsx -> Home.jsx mounted -> `recommendAPI.home()`
- recommendation.controller.getRecommendedVideos -> [ES KNN + lexical fusion] OR [Mongo fallback]
- Response -> Home.jsx renders list -> VideoCard grid

---

## Example 2: Search for Videos (with Suggestions, Typos, and Synonyms)

### 1) Typing in the Navbar search bar

Frontend
- File: `FRONTEND-2/src/components/Navbar.jsx`
  - Local state: `searchQuery`, `suggestions`, debounce timer.
  - For input length ≥ 2, calls `searchAPI.getSuggestions(q)` after 300ms debounce.
  - Displays dropdown; click suggestion navigates:
    - Video suggestion -> `/video/:id`
    - Channel suggestion -> `/channel/:username`

Backend (Suggestions)
- File: `BACKEND2/src/controllers/search.controller.js`
  - `getSearchSuggestions(req, res)`:
    - Expands query via `expandQuery` (basic aliases like `js` <-> `javascript`, etc.).
    - Mongo queries (case-insensitive regex) against Video.title and User.username using all aliases.
    - Returns top titles and channel names with metadata.
- File: `BACKEND2/src/routes/search.routes.js`
  - Route: `GET /api/v1/search/suggest -> getSearchSuggestions` (auth optional).

### 2) Submitting search (Enter or search button)

Frontend
- File: `FRONTEND-2/src/pages/Search.jsx`
  - Reads `q` from URL (`/search?q=...`).
  - Calls `searchAPI.searchVideos(q, { page, limit, sortBy })`.
  - Renders results with sorting and pagination.

Backend (Full Search)
- File: `BACKEND2/src/controllers/search.controller.js`
  - `searchVideos(req, res)`:
    - User context: optional `userId` for subscribed channel boosts.
    - Hybrid Search (if ES available):
      - Lexical search (`multi_match` on `title^3`, `description`, `tags^2`, `transcript^0.5`) with:
        - `operator: "or"` to improve recall
        - `fuzziness: "AUTO"` to tolerate typos (e.g., `javascit`)
        - `phrase_prefix` should-clause for prefix queries (e.g., `jav`)
        - Subscribed channel boost via terms query on `ownerId`
        - Synonym/alias expansion using `expandQuery(q)` included as an additional should `multi_match`
      - Semantic search: `knnSearch` on dense vector `embedding` using `generateEmbedding(q)` from Hugging Face.
      - Fusion: `reciprocalRankFusion(lexicalHits, semanticHits)` and truncate to page size.
    - Fallback (MongoDB) if ES disabled: `$match` on regex, relevance scoring by title/description match + subscribed boost + views + recency.
  - Response metadata includes engine used, total count, pages, and the query.

Data/Indexing (for searchability)
- File: `BACKEND2/src/models/video.model.js` includes `embedding` and metadata fields. `isPublished` and `publishedAt` filter/boost results.
- File: `BACKEND2/src/services/videoIndexer.js` indexes document to ES with `embedding` and owner fields.

Summary Flow (Search)
- Navbar.jsx (submit) -> `/search?q=...`
- Search.jsx mounted -> `searchAPI.searchVideos`
- search.controller.searchVideos -> ES lexical + fuzzy + prefix + alias + KNN -> fusion -> results
- Response -> Search.jsx renders list

---

## Key Files and Functions (Reference)

Frontend
- `src/api/index.js`
  - `authAPI`, `videoAPI`, `commentAPI`, `likeAPI`, `dashboardAPI`, `recommendAPI`, `searchAPI`, `subscriptionAPI`, `channelAPI`
- `src/context/AuthContext.jsx` — JWT handling, auth state.
- `src/pages/Home.jsx` — loads recommended videos.
- `src/pages/VideoDetail.jsx` — like/subscription/comments UI with live updates.
- `src/components/CommentBox.jsx` — full comments CRUD.
- `src/components/Navbar.jsx` — search suggestions and navigation.
- `src/pages/Search.jsx` — full search page.
- `src/pages/Channel.jsx` — channel profile with subscribe and channel videos.
- `src/components/VideoCard.jsx` — video card.

Backend
- `src/app.js` — Express app, routes mounted under `/api/v1`.
- `src/controllers/user.controller.js` — `registerUser`, `loginUser`, `getUserChannelProfile`.
- `src/controllers/recommendation.controller.js` — `getRecommendedVideos`, `getRelatedVideos`, `getTagRecommendations`.
- `src/controllers/search.controller.js` — `getSearchSuggestions`, `searchVideos` with fuzzy + synonyms + KNN fusion.
- `src/controllers/video.controller.js` — `publishAVideo` with embeddings + ES indexing call.
- `src/services/embeddings.js` — `generateEmbedding(text)` using Hugging Face.
- `src/services/videoIndexer.js` — `indexVideo`, `removeVideo`, `bulkIndexVideos` to Elasticsearch.
- `src/services/esClient.js` — ES client initialization and availability check.
- `src/controllers/comment.controller.js` — get/add/update/delete comments.
- `src/controllers/like.controller.js` — toggle likes, get like count/status.
- `src/controllers/subscription.controller.js` — toggle subscription, get subscribers.
- `src/controllers/dashboard.controller.js` — get channel stats/videos.
- `src/routes/*.routes.js` — API route bindings.

---

## Example Data Payloads (Abbreviated)

- Login response
```json
{
  "statusCode": 200,
  "data": {
    "user": { "_id": "u1", "username": "demo_user1", "avatar": "..." },
    "accessToken": "<jwt>"
  }
}
```

- Recommendations response
```json
{
  "statusCode": 200,
  "data": [
    { "_id": "v1", "title": "JavaScript Crash Course", "ownerId": "c1", "views": 12345 },
    { "_id": "v2", "title": "Node.js Basics", "ownerId": "c2", "views": 9800 }
  ],
  "meta": { "engine": "elasticsearch", "page": 1, "limit": 20 }
}
```

- Search results for `q=javascit`
```json
{
  "statusCode": 200,
  "data": [
    { "_id": "v1", "title": "JavaScript Crash Course" },
    { "_id": "v5", "title": "Advanced JavaScript Patterns" }
  ],
  "meta": { "engine": "elasticsearch", "totalVideos": 342 }
}
```

---

## Operational Notes

- Configure env vars: `MONGODB_URI`, `ELASTICSEARCH_URL` (+ auth), `HF_API_KEY`, `HF_EMBEDDING_MODEL`, Cloudinary creds.
- Ensure ES index mapping has a dense vector field `embedding` matching model dimension.
- If ES is disabled, Mongo fallback still returns sensible results (no vector search).
- For richer synonyms, consider ES synonym token filter at index-time/query-time.

---

## Visual Flow (Text Diagrams)

Login -> Home -> Recommendations
- Login.jsx -> authAPI.login -> user.controller.loginUser -> tokens
- App.jsx -> Home.jsx -> recommendAPI.home
- recommendation.controller.getRecommendedVideos
  -> ES: KNN(embedding) + Lexical(fuzzy+prefix+boosts) -> RRF
  -> Mongo fallback otherwise
- Home.jsx renders VideoCard list

Search Flow
- Navbar.jsx (debounced) -> searchAPI.getSuggestions -> search.controller.getSearchSuggestions (aliases)
- Navbar submit -> /search -> Search.jsx -> searchAPI.searchVideos
- search.controller.searchVideos -> ES Lexical(fuzzy+prefix+aliases) + KNN -> RRF -> results
- Search.jsx renders list

---

Prepared for: Engineering and Product stakeholders.
Font: Markdown (view in IDE or viewer for headings, lists, code blocks).
