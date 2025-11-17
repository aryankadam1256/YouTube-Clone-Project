# Complete Setup and Usage Guide

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (local or MongoDB Atlas)
3. **Cloudinary Account** (for video storage)
4. **Git** (optional)

---

## 🚀 Step 1: Environment Setup

### Backend Environment Variables

Create a `.env` file in `BACKEND2/` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/video_player_db
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/video_player_db

# Server Port
PORT=8000

# CORS Origin (Frontend URL)
CORS_ORIGIN=http://localhost:5173

# JWT Secrets
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_here_make_it_long_and_random
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_here_make_it_long_and_random
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**To get Cloudinary credentials:**
1. Go to https://cloudinary.com and sign up
2. Go to Dashboard
3. Copy your `Cloud Name`, `API Key`, and `API Secret`

**Generate JWT secrets:**
```bash
# On Linux/Mac:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# On Windows PowerShell:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📦 Step 2: Install Dependencies

### Backend
```bash
cd BACKEND2
npm install
```

### Frontend
```bash
cd FRONTEND-2
npm install
```

---

## 🗄️ Step 3: Setup MongoDB

### Option A: Local MongoDB

1. **Install MongoDB:**
   - Windows: Download from https://www.mongodb.com/try/download/community
   - Mac: `brew install mongodb-community`
   - Linux: `sudo apt-get install mongodb`

2. **Start MongoDB:**
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   mongod
   ```

### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

---

## ▶️ Step 4: Run the Application

### Terminal 1 - Backend Server
```bash
cd BACKEND2
npm run dev
```

You should see:
```
MongoDB Connected .. DB HOST : localhost
server is running on port 8000
```

### Terminal 2 - Frontend Server
```bash
cd FRONTEND-2
npm run dev
```

You should see:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## 🎬 Step 5: Add Videos to Your Database

### Method 1: Through Web UI (Recommended)

1. **Register a User:**
   - Go to http://localhost:5173/register
   - Fill in: username, fullname, email, password
   - Upload avatar and cover image
   - Click Register

2. **Login:**
   - Go to http://localhost:5173/login
   - Enter credentials
   - You'll be redirected to home

3. **Upload Video:**
   - Click "Upload Video" in navbar or go to http://localhost:5173/upload
   - Fill in:
     - **Title**: Video title
     - **Description**: Video description
     - **Video File**: Select a video file (MP4, WebM, etc.)
   - Click "Upload Video"
   - Video will be uploaded to Cloudinary and saved to database

### Method 2: Using MongoDB Queries (Direct Database)

See MongoDB queries section below.

---

## 🔍 MongoDB Queries to Check/Search Data

### Connect to MongoDB

```bash
# Local MongoDB
mongosh

# MongoDB Atlas
mongosh "your_connection_string"
```

### Useful Queries

```javascript
// Switch to your database
use video_player_db

// ========== USER QUERIES ==========

// View all users
db.users.find().pretty()

// Find user by username
db.users.findOne({ username: "your_username" })

// Count total users
db.users.countDocuments()

// Find users with watch history
db.users.find({ watchHistory: { $exists: true, $ne: [] } })

// ========== VIDEO QUERIES ==========

// View all videos
db.videos.find().pretty()

// Count total videos
db.videos.countDocuments()

// Find published videos only
db.videos.find({ isPublished: true })

// Find videos by owner
db.videos.find({ owner: ObjectId("user_id_here") })

// Search videos by title (case-insensitive)
db.videos.find({ title: { $regex: "search_term", $options: "i" } })

// Find videos with most views
db.videos.find().sort({ views: -1 }).limit(10)

// Find recent videos
db.videos.find().sort({ createdAt: -1 }).limit(10)

// Find videos by keyword in description
db.videos.find({ 
  $or: [
    { title: { $regex: "keyword", $options: "i" } },
    { description: { $regex: "keyword", $options: "i" } }
  ]
})

// ========== LIKES QUERIES ==========

// View all likes
db.likes.find().pretty()

// Find videos liked by a user
db.likes.find({ 
  likedBy: ObjectId("user_id_here"),
  video: { $exists: true }
})

// Count likes for a video
db.likes.countDocuments({ video: ObjectId("video_id_here") })

// ========== SUBSCRIPTIONS QUERIES ==========

// View all subscriptions
db.subscriptions.find().pretty()

// Find channels a user subscribes to
db.subscriptions.find({ subscriber: ObjectId("user_id_here") })

// Find subscribers of a channel
db.subscriptions.find({ channel: ObjectId("channel_id_here") })

// ========== AGGREGATION QUERIES ==========

// Get videos with owner details (join)
db.videos.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "ownerDetails"
    }
  },
  { $unwind: "$ownerDetails" },
  { $limit: 10 }
])

// Get user's watch history with video details
db.users.aggregate([
  { $match: { _id: ObjectId("user_id_here") } },
  {
    $lookup: {
      from: "videos",
      localField: "watchHistory",
      foreignField: "_id",
      as: "watchHistoryDetails"
    }
  }
])

// ========== DELETE QUERIES (Use with caution!) ==========

// Delete a video
db.videos.deleteOne({ _id: ObjectId("video_id_here") })

// Delete all videos (DANGER!)
// db.videos.deleteMany({})

// Delete a user
db.users.deleteOne({ _id: ObjectId("user_id_here") })
```

---

## 🧪 API Testing Commands

### Using cURL

#### 1. Register User
```bash
curl -X POST http://localhost:8000/api/v1/users/register \
  -F "username=testuser" \
  -F "fullname=Test User" \
  -F "email=test@example.com" \
  -F "password=test123" \
  -F "avatar=@/path/to/avatar.jpg" \
  -F "coverImage=@/path/to/cover.jpg"
```

#### 2. Login
```bash
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}' \
  -c cookies.txt
```

#### 3. Get All Videos (Requires Auth)
```bash
curl -X GET http://localhost:8000/api/v1/videos \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
```

#### 4. Get Recommendations (Requires Auth)
```bash
curl -X GET "http://localhost:8000/api/v1/recommendations?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
```

#### 5. Search Suggestions
```bash
curl -X GET "http://localhost:8000/api/v1/search/suggest?q=test"
```

#### 6. Search Videos
```bash
curl -X GET "http://localhost:8000/api/v1/search/videos?q=test&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 7. Upload Video (Requires Auth)
```bash
curl -X POST http://localhost:8000/api/v1/videos/publish \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "title=My Video" \
  -F "description=Video description" \
  -F "videoFile=@/path/to/video.mp4"
```

### Using Postman

1. **Import Collection:**
   - Create new collection
   - Add requests for each endpoint
   - Set base URL: `http://localhost:8000/api/v1`

2. **Authentication:**
   - For protected routes, add header:
     - Key: `Authorization`
     - Value: `Bearer YOUR_ACCESS_TOKEN`

3. **File Upload:**
   - Use `form-data` body type
   - Add fields as `File` type for uploads

---

## 📝 Sample Data Seeding Script

Create `BACKEND2/src/scripts/seedData.js`:

```javascript
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import Video from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import bcrypt from "bcrypt";

dotenv.config({ path: "./.env" });

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data (optional)
    // await User.deleteMany({});
    // await Video.deleteMany({});
    // await Subscription.deleteMany({});

    // Create sample users
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const users = await User.insertMany([
      {
        username: "john_doe",
        email: "john@example.com",
        fullname: "John Doe",
        password: hashedPassword,
        avatar: "https://via.placeholder.com/150",
        coverImage: "https://via.placeholder.com/800x200"
      },
      {
        username: "jane_smith",
        email: "jane@example.com",
        fullname: "Jane Smith",
        password: hashedPassword,
        avatar: "https://via.placeholder.com/150",
        coverImage: "https://via.placeholder.com/800x200"
      }
    ]);

    console.log("Created users:", users.length);

    // Create sample videos (Note: You'll need actual Cloudinary URLs)
    // Replace these with real video URLs from Cloudinary
    const videos = await Video.insertMany([
      {
        title: "Introduction to React",
        description: "Learn the basics of React framework",
        videoFile: "https://res.cloudinary.com/your-cloud/video/upload/v1234567/sample.mp4",
        thumbnail: "https://res.cloudinary.com/your-cloud/image/upload/v1234567/thumb.jpg",
        duration: 600, // 10 minutes in seconds
        views: 1500,
        isPublished: true,
        owner: users[0]._id
      },
      {
        title: "Node.js Tutorial",
        description: "Complete guide to Node.js backend development",
        videoFile: "https://res.cloudinary.com/your-cloud/video/upload/v1234567/nodejs.mp4",
        thumbnail: "https://res.cloudinary.com/your-cloud/image/upload/v1234567/nodejs-thumb.jpg",
        duration: 1200, // 20 minutes
        views: 2500,
        isPublished: true,
        owner: users[1]._id
      }
    ]);

    console.log("Created videos:", videos.length);

    // Create subscriptions
    const subscriptions = await Subscription.insertMany([
      {
        subscriber: users[0]._id,
        channel: users[1]._id
      }
    ]);

    console.log("Created subscriptions:", subscriptions.length);

    console.log("✅ Seed data created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
```

**Run seed script:**
```bash
cd BACKEND2
node src/scripts/seedData.js
```

---

## 🔧 Troubleshooting

### Backend Issues

1. **MongoDB Connection Error:**
   ```bash
   # Check if MongoDB is running
   mongosh
   # If connection fails, start MongoDB service
   ```

2. **Port Already in Use:**
   ```bash
   # Windows
   netstat -ano | findstr :8000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:8000 | xargs kill -9
   ```

3. **Cloudinary Upload Fails:**
   - Check `.env` file has correct Cloudinary credentials
   - Verify Cloudinary account is active
   - Check file size limits

### Frontend Issues

1. **CORS Error:**
   - Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL
   - Default: `http://localhost:5173`

2. **API Connection Failed:**
   - Check backend is running on port 8000
   - Verify API base URL in `FRONTEND-2/src/api/index.js`

---

## 📊 Database Structure

### Collections:

1. **users**
   - `username`, `email`, `fullname`, `password`, `avatar`, `coverImage`
   - `watchHistory[]` - Array of video IDs
   - `refreshToken`

2. **videos**
   - `title`, `description`, `videoFile` (Cloudinary URL)
   - `thumbnail`, `duration`, `views`
   - `isPublished`, `owner` (User ID)

3. **likes**
   - `video`, `comment`, `tweet`, `likedBy` (User ID)

4. **subscriptions**
   - `subscriber` (User ID), `channel` (User ID)

5. **comments**
   - `content`, `video`, `owner` (User ID)

---

## 🎯 Quick Start Checklist

- [ ] Install Node.js and MongoDB
- [ ] Create Cloudinary account
- [ ] Setup `.env` file in BACKEND2
- [ ] Install dependencies (backend & frontend)
- [ ] Start MongoDB
- [ ] Run backend server (`npm run dev` in BACKEND2)
- [ ] Run frontend server (`npm run dev` in FRONTEND-2)
- [ ] Register a user
- [ ] Upload a video
- [ ] Test recommendations
- [ ] Test search functionality

---

## 📚 Additional Resources

- **MongoDB Documentation:** https://docs.mongodb.com/
- **Cloudinary Documentation:** https://cloudinary.com/documentation
- **Express.js Guide:** https://expressjs.com/
- **React Router:** https://reactrouter.com/

---

**Need Help?** Check the console logs for error messages and verify all environment variables are set correctly.

