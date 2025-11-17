# Video Search & Recommendation Data Flow

## 1. Ingestion & Storage
- **Upload** → `POST /api/v1/videos/publish`
  - Multer saves temp file → Cloudinary upload → metadata captured (`duration`, `thumbnail` fallback).
  - `Video` document saved in MongoDB with `tags`, `language`, `publishedAt`, optional `transcript`.
  - Text embedding requested from Hugging Face (if `HF_API_KEY` set); stored in MongoDB and passed to Elasticsearch indexer.
  - `indexVideo()` upserts document into Elasticsearch (`videos` index) with owner metadata, tags, transcript, embedding.

- **Seed script** → `src/scripts/seedData.js`
  - Generates rich sample catalogue (software, ML, LLM topics) with tags + transcripts.
  - Optionally performs bulk indexing into Elasticsearch (no-op if ES env vars missing).

## 2. Serving APIs
### Search (`/api/v1/search/videos`)
1. API computes personalization context (subscriptions).
2. If Elasticsearch available:
   - Lexical query (BM25) via `multi_match`.
   - Semantic query (kNN) using `generateEmbedding(q)` (if embeddings enabled).
   - Reciprocal Rank Fusion merges lexical + semantic results.
3. MongoDB fallback: regex match + heuristic scoring.
4. Results returned with pagination + engine metadata.

### Recommendations (`/api/v1/recommendations`)
1. Gather user signals: watch history, likes, subscriptions.
2. Average available video embeddings; if none, embed concatenated watch titles.
3. Elasticsearch kNN search filtered by `isPublished` and excluding watched IDs.
4. Optional lexical boost for subscribed channels & top tags.
5. Mongo fallback: score by subscriptions, shared tags, views, recency.
6. Related (`/recommendations/:id/related`): video embedding kNN, fallback to tag match.
7. Tag discovery (`/recommendations/tags`): ES terms query or Mongo fallback.

### Event Logging (`/api/v1/events`)
- `POST /events/watch` (auth): adds to `User.watchHistory`, bumps `views` if watch progress ≥ 50%, triggers `indexVideo`.
- `POST /events/like` (auth): records interest (used for future models).

## 3. Frontend-2 Flow
- **Navbar**
  - Query suggestions via `/search/suggest` with debounce.
  - Submits to `/search?q=...`.
- **Home**
  - Authenticated → `/recommendations` personalized feed.
  - Guest → `/videos` sorted by views (trending).
- **Search page**
  - Calls `/search/videos`.
- **Video detail**
  - Loads `/videos/:id`.
  - Auth user logs watch (`/events/watch`).
  - Sidebar fetches `/recommendations/:id/related`.

## 4. Extensibility Hooks
- Background jobs (`src/services/videoIndexer.js`) can power backfills & reindex.
- `embedding` + `transcriptUrl` fields support richer ML pipelines (ASR/LLM summaries).
- Elasticsearch index configurable via environment variables (`ELASTICSEARCH_URL`, `ELASTICSEARCH_VIDEO_INDEX`).

## 5. Required Environment Variables
```
ELASTICSEARCH_URL=
ELASTICSEARCH_USERNAME=
ELASTICSEARCH_PASSWORD=
ELASTICSEARCH_VIDEO_INDEX=videos
HF_API_KEY=
HF_EMBEDDING_MODEL=https://api-inference.huggingface.co/pipeline/feature-extraction/intfloat/e5-small-v2
```
> All features degrade gracefully when ES or embeddings are unavailable.

