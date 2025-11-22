# 🚀 Complete Project Setup & Run Guide

This guide ensures you can run this project on **any device** completely error-free. It handles the database, search engine, and all environment configurations.

## 📋 Prerequisites
Before you begin, ensure you have the following installed:
1.  **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2.  **Docker Desktop** (Required for Database & Search) - [Download](https://www.docker.com/products/docker-desktop/)
    *   *Make sure Docker Desktop is running before starting.*

---

## 🛠️ Step 1: Install Dependencies
Open your terminal in the project root `VIDEO_MEDIA_PLAYER_APP` and run:

```bash
# Install Backend Dependencies
cd BACKEND2
npm install

# Install Frontend Dependencies
cd ../FRONTEND-2
npm install
```

---

## ⚙️ Step 2: Configure Environment
Create a file named `.env` inside the `BACKEND2` folder.
**Copy and paste this EXACT content:**

```env
# Database Configuration (Uses local Docker instance)
MONGODB_URI=mongodb://localhost:27017/videotube
PORT=8000
CORS_ORIGIN=http://localhost:5173

# Security Secrets (You can change these if you want, but these work for dev)
ACCESS_TOKEN_SECRET=b3cc96a9d52d356d7af79b5a1180064d36c3d2215c3ba2068bbd14f0dd5c3205
REFRESH_TOKEN_SECRET=0c6c12ca199dcdd2f4abce3e6812a84789cfd90c8e720a3533ed98e67c63dc98
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary (Media Storage) - KEEP THESE AS IS for the demo to work
CLOUDINARY_CLOUD_NAME=dnvsbfl0p
CLOUDINARY_API_KEY=125847891667347
CLOUDINARY_API_SECRET=UMadfAF2g2-7vWYpuEDoD5-3L7c

# Search Engine (Elasticsearch)
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_VIDEO_INDEX=videos
ELASTICSEARCH_TLS_SKIP_VERIFY=true

# AI/ML Keys
HF_API_KEY=your_huggingface_api_key_here
```

---

## 🏗️ Step 3: Start Infrastructure (The "Magic" Step)
This command starts MongoDB (Database) and Elasticsearch (Search Engine) automatically.

1.  Open a terminal in `BACKEND2`.
2.  Run:
    ```bash
    docker-compose up -d
    ```
3.  Wait about 30 seconds for them to start up fully.

---

## 🌱 Step 4: Seed Data (Important!)
If this is a **new device**, the database will be empty. You need to fill it with users and videos so the website isn't blank.

In the `BACKEND2` terminal, run:
```bash
npm run seed
# OR if that script isn't defined in package.json:
node src/scripts/seedData.js
```
*You should see "✅ Seed data setup complete!"*

---

## 🚀 Step 5: Launch the App
You need **two separate terminals** running at the same time.

**Terminal 1 (Backend):**
```bash
cd BACKEND2
npm run dev
```
*Wait until you see "server is running on port 8000"*

**Terminal 2 (Frontend):**
```bash
cd FRONTEND-2
npm run dev
```

---

## ✅ Verification
1.  Open your browser to `http://localhost:5173`.
2.  **Login** with:
    *   Username: `demo_user1`
    *   Password: `password123`
3.  **Test Search**: Type "react" in the search bar. You should see results.

---

## 🐛 Troubleshooting / What was fixed?

### 1. "MongoDB Connection Error"
*   **Issue:** The app was trying to connect to a remote MongoDB Atlas cluster that might have been down, IP-restricted, or slow.
*   **Fix:** Switched to a **Local Docker MongoDB**. It's faster and works offline.

### 2. "Search/Elasticsearch Errors"
*   **Issue:** The search feature relies on Elasticsearch, which wasn't running on your machine.
*   **Fix:** Added `elasticsearch` to `docker-compose.yml` so it starts automatically with the database.

### 3. "Blank Page / No Videos"
*   **Issue:** A fresh install has no data.
*   **Fix:** Ran the `seedData.js` script to populate the database with 20+ sample videos and users.

### 4. "Environment Variables Missing"
*   **Issue:** The `.env` file was missing critical keys for Elasticsearch and Cloudinary.
*   **Fix:** Created a complete `.env` file with all necessary configurations.
