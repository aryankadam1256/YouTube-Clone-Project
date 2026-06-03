# VidFlow

A full-stack video streaming platform built as a production-grade portfolio project, demonstrating SDE and ML engineering skills.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser (React + Vite)                                         │
│  React 19 · Tailwind v4 · React Router v7 · Axios              │
└─────────────────┬───────────────────────────────────────────────┘
                  │ HTTP (REST)
┌─────────────────▼───────────────────────────────────────────────┐
│  API Server (Node.js + Express 5)                               │
│  helmet · rate-limit · zod · JWT · Morgan                       │
│  11 route groups — users, videos, comments, likes,              │
│  subscriptions, playlists, tweets, dashboard,                   │
│  recommendations, search, events (SSE)                          │
└──────┬──────────┬──────────┬───────────────┬────────────────────┘
       │          │          │               │
┌──────▼──┐  ┌───▼────┐  ┌──▼──────────┐  ┌▼─────────────────────┐
│ MongoDB │  │ Cloud- │  │ Pinecone    │  │ Elasticsearch 8      │
│(Mongoose│  │ inary  │  │ (vector DB) │  │ (full-text search    │
│ + aggr) │  │(video/ │  │ 384-dim     │  │  + autocomplete)     │
│         │  │ media) │  │ cosine sim) │  │                      │
└─────────┘  └────────┘  └─────────────┘  └──────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  HuggingFace API    │
                    │  all-MiniLM-L6-v2  │
                    │  (text embeddings) │
                    └─────────────────────┘
```

---

## ML Pipeline

```
Upload video
    │
    ▼
Cloudinary (store video + generate thumbnail)
    │
    ▼
Generate embedding: title + description + tags → HuggingFace API → 384-dim vector
    │
    ├── Store embedding in MongoDB (video.embedding field)
    │
    └── Upsert vector into Pinecone index
              │
              ▼
    On homepage load → average user's watch history embeddings
              │
              ▼
    Pinecone ANN query → ranked video IDs → fetch full docs from MongoDB
              │
              ▼
    Personalized recommendations returned
```

---

## Quick Start (Local)

### Prerequisites
- Node.js 18+
- Docker + Docker Compose
- A Cloudinary account (free tier)
- A HuggingFace account (free tier)
- A Pinecone account (free tier, 1 index)

### 1 — Start infrastructure

```bash
cd BACKEND2
docker compose up -d   # starts MongoDB (:27017) + Elasticsearch (:9200)
```

### 2 — Configure backend

```bash
cp .env.example .env
# Edit .env and fill in your keys
```

### 3 — Install and run backend

```bash
cd BACKEND2
npm install
npm run dev            # nodemon, hot reload, port 8000
```

### 4 — Configure and run frontend

```bash
cd FRONTEND-2
cp .env.example .env   # set VITE_BACKEND_URL=http://localhost:8000
npm install
npm run dev            # Vite dev server, port 5173
```

### 5 — Seed data (optional)

```bash
cd BACKEND2
node src/scripts/seedData.js             # seed sample videos and users
node src/scripts/generateEmbeddings.js  # generate + sync embeddings to Pinecone
```

Open `http://localhost:5173`

---

## API Reference

Base URL: `http://localhost:8000/api/v1`

| Resource | Prefix | Auth required |
|---|---|---|
| Users | `/users` | Mixed |
| Videos | `/videos` | Mixed |
| Comments | `/comments` | Yes |
| Likes | `/likes` | Yes |
| Subscriptions | `/subscriptions` | Yes |
| Playlists | `/playlists` | Yes |
| Tweets | `/tweets` | Yes |
| Dashboard | `/dashboards` | Yes |
| Recommendations | `/recommendations` | Mixed |
| Search | `/search` | No |
| Events (SSE) | `/events` | Yes |

Key endpoints:

```
POST   /users/register              Register (multipart — avatar required)
POST   /users/login                 Login → sets httpOnly JWT cookies
POST   /users/logout                Clear tokens
GET    /users/current-user          Get logged-in user profile
GET    /users/c/:username           Public channel profile

GET    /videos                      List videos (paginated, filterable)
GET    /videos/trending             Trending videos (time-range filter)
POST   /videos/publish              Upload video (multipart)
GET    /videos/:id                  Get single video
PATCH  /videos/:id                  Update video metadata (owner only)
DELETE /videos/:id                  Delete video (owner only)

GET    /recommendations             Personalized home feed (Pinecone or fallback)
GET    /recommendations/:id/related Related videos for a video page

GET    /search/videos?q=            Full-text search via Elasticsearch
GET    /search/suggest?q=           Autocomplete suggestions

POST   /comments/add-comment/:videoId   Add comment
PATCH  /comments/update-comment/:id     Update own comment
DELETE /comments/delete-comment/:id     Delete own comment
```

---

## Security

| Layer | Implementation |
|---|---|
| Auth | JWT access token (1d) + refresh token (10d), httpOnly cookies |
| Headers | `helmet` — CSP, HSTS, X-Frame-Options, X-Content-Type-Options, etc. |
| Rate limiting | Global: 100 req/15min · Auth endpoints: 10 req/15min |
| Input validation | `zod` schemas on all POST/PATCH body fields, unknown fields stripped |
| Authorization | Ownership check on all mutating video operations (403 if not owner) |
| CORS | Explicit origin allowlist, no wildcard fallback |

---

## Project Structure

```
YouTube-Clone-Project/
├── BACKEND2/                  Express API server
│   ├── src/
│   │   ├── controllers/       Route handlers (11 resources)
│   │   ├── models/            Mongoose schemas
│   │   ├── routes/            Express routers
│   │   ├── middlewares/       auth, multer, validate, rateLimiter, errorHandler
│   │   ├── validators/        Zod schemas per resource
│   │   ├── services/          esClient, pineconeClient, embeddings, videoIndexer
│   │   ├── utils/             ApiError, ApiResponse, asyncHandler, cloudinary
│   │   ├── db/                MongoDB connection
│   │   └── scripts/           seed, embed, sync, debug scripts
│   ├── docker-compose.yml     MongoDB + Elasticsearch
│   └── .env.example           All env vars documented
│
├── FRONTEND-2/                React SPA
│   ├── src/
│   │   ├── pages/             Home, VideoDetail, Upload, Dashboard,
│   │   │                      Login, Register, Profile, Search, Channel, Trending
│   │   ├── components/        VideoCard, VideoPlayer, CommentBox, layout, backgrounds
│   │   ├── context/           AuthContext
│   │   └── api/               Axios client + all API calls
│   └── vite.config.js
│
└── documentation/
    └── phases/                Per-phase implementation writeups
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS v4, React Router v7 |
| Backend | Node.js (ESM), Express 5 |
| Database | MongoDB + Mongoose |
| Media | Cloudinary |
| Search | Elasticsearch 8 |
| Vectors | Pinecone |
| Embeddings | HuggingFace Inference API (all-MiniLM-L6-v2, 384-dim) |
| Auth | JWT + bcrypt + httpOnly cookies |
| Validation | Zod |
| Security | helmet, express-rate-limit |
| Logging | Morgan |
| Infra | Docker Compose |
