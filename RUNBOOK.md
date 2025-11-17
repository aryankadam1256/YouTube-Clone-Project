# Project Runbook (Windows PowerShell)

This project has two apps:
- Backend: BACKEND2 (Node/Express + MongoDB + Elasticsearch + Cloudinary)
- Frontend: FRONTEND-2 (Vite + React)

## One-time prerequisites
- Node.js LTS installed
- Docker Desktop running (for Elasticsearch)
- MongoDB Atlas connection string set in BACKEND2/.env (already present)
- Cloudinary credentials set in BACKEND2/.env (already present)

## Environment notes
- Frontend dev server may choose a port other than 5173 (e.g., 5177). Update BACKEND2/.env `CORS_ORIGIN` to match the actual frontend origin.
- Cookies over HTTP localhost: set cookies with `secure: false` in dev if needed.

## Start Elasticsearch (Docker)
# Use one line (PowerShell):
docker run -d --name elasticsearch -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" elasticsearch:8.15.0

# Check it's up
curl.exe http://localhost:9200

# If already exists but stopped, start it
# docker start elasticsearch

## Backend (BACKEND2)
# Install deps (first time or after pulling)
# From repo root, run:
# npm i --prefix BACKEND2

# Ensure CORS origin matches actual frontend port
# Edit BACKEND2/.env -> CORS_ORIGIN=http://localhost:<frontend-port>

# Seed database (optional on first setup or when you want fresh demo content)
# This creates demo users and sample videos and indexes them into Elasticsearch.
node BACKEND2/src/scripts/seedData.js

# Start backend
npm run dev --prefix BACKEND2
# Server at http://localhost:8000

## Frontend (FRONTEND-2)
# Install deps (first time or after pulling)
# npm i --prefix FRONTEND-2

# Start frontend
npm run dev --prefix FRONTEND-2
# Note the port shown (e.g., http://localhost:5177). If it is not 5173, update BACKEND2/.env CORS_ORIGIN accordingly and restart backend.

## Demo credentials
- Username: demo_user1, demo_user2, demo_user3
- Password: password123

## Common maintenance
# Stop and remove Elasticsearch container (if you need a clean restart)
docker rm -f elasticsearch

# Recreate Elasticsearch and re-seed if you want fresh search indexes
# (Only needed if you wiped ES data or changed index mappings)
docker run -d --name elasticsearch -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" elasticsearch:8.15.0
node BACKEND2/src/scripts/seedData.js

## Troubleshooting
- Frontend cannot call API (CORS errors): ensure BACKEND2/.env CORS_ORIGIN matches the actual frontend origin (port).
- Registration/upload 500: verify Cloudinary creds; ensure avatar file is attached; check backend logs.
- Video click fails to load: check Network tab for GET /api/v1/videos/:id response and message; ensure you are logged in if the video is unpublished.
- Channel search empty: type at least 2 characters; demo channels are demo_user1, demo_user2, demo_user3.
