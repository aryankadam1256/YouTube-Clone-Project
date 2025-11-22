# Quick Commands Reference

## 🚀 Start Application

### Backend (Terminal 1)
```bash
cd BACKEND2
npm run dev
```

### Frontend (Terminal 2)
```bash
cd FRONTEND-2
npm run dev
```

---

## 📦 Install Dependencies

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

## 🗄️ MongoDB Commands

### Start MongoDB (Local)
```bash
# Windows
net start MongoDB

# Mac/Linux
mongod
# OR
brew services start mongodb-community
```

### Connect to MongoDB
```bash
mongosh
# OR for specific database
mongosh video_player_db
```

### Quick MongoDB Queries

```javascript
// View all videos
db.videos.find().pretty()

// View all users
db.users.find().pretty()

// Count videos
db.videos.countDocuments()

// Find video by title
db.videos.find({ title: /react/i })

// Delete all videos (CAUTION!)
// db.videos.deleteMany({})

// Delete all users (CAUTION!)
// db.users.deleteMany({})
```

---

## 🌱 Seed Sample Data

```bash
cd BACKEND2
node src/scripts/seedData.js
```

**Demo Credentials:**
- Username: `demo_user1` or `demo_user2`
- Password: `password123`

---

## 🧪 Test API Endpoints

### 1. Register User
```bash
curl -X POST http://localhost:8000/api/v1/users/register \
  -F "username=testuser" \
  -F "fullname=Test User" \
  -F "email=test@example.com" \
  -F "password=test123" \
  -F "avatar=@avatar.jpg" \
  -F "coverImage=@cover.jpg"
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

### 3. Get Videos (Replace YOUR_TOKEN)
```bash
curl -X GET http://localhost:8000/api/v1/videos \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Get Recommendations
```bash
curl -X GET "http://localhost:8000/api/v1/recommendations?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Search Suggestions
```bash
curl -X GET "http://localhost:8000/api/v1/search/suggest?q=react"
```

### 6. Search Videos
```bash
curl -X GET "http://localhost:8000/api/v1/search/videos?q=react&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. Upload Video
```bash
curl -X POST http://localhost:8000/api/v1/videos/publish \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=My Video" \
  -F "description=Description here" \
  -F "videoFile=@video.mp4"
```

---

## 🔍 Check Application Status

### Check if Backend is Running
```bash
curl http://localhost:8000/api/v1/users/current-user
```

### Check if Frontend is Running
Open browser: http://localhost:5173

### Check MongoDB Connection
```bash
mongosh
show dbs
use video_player_db
show collections
```

---

## 🧹 Clean/Reset Database

### Delete All Videos
```javascript
// In mongosh
use video_player_db
db.videos.deleteMany({})
```

### Delete All Users (except yourself)
```javascript
db.users.deleteMany({ username: { $ne: "your_username" } })
```

### Reset Everything (CAUTION!)
```javascript
db.videos.deleteMany({})
db.users.deleteMany({})
db.likes.deleteMany({})
db.subscriptions.deleteMany({})
db.comments.deleteMany({})
```

---

## 📝 Environment Variables Checklist

Create `.env` in `BACKEND2/`:

```env
MONGODB_URI=mongodb://localhost:27017/video_player_db
PORT=8000
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your_secret_here
REFRESH_TOKEN_SECRET=your_secret_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🎬 Add Videos - Step by Step

### Method 1: Through Web UI (Easiest)

1. **Start both servers** (backend + frontend)
2. **Register/Login** at http://localhost:5173
3. **Click "Upload Video"** in navbar
4. **Fill form:**
   - Title: "My First Video"
   - Description: "Video description"
   - Video File: Select your .mp4 file
5. **Click "Upload Video"**
6. **Wait for upload** (video goes to Cloudinary)
7. **Done!** Video appears in home page

### Method 2: Using cURL

```bash
# First, login and get token
TOKEN=$(curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# Then upload video
curl -X POST http://localhost:8000/api/v1/videos/publish \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=My Video" \
  -F "description=Description" \
  -F "videoFile=@/path/to/video.mp4"
```

### Method 3: Direct MongoDB Insert (No Cloudinary)

```javascript
// In mongosh
use video_player_db

db.videos.insertOne({
  title: "Test Video",
  description: "Test description",
  videoFile: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
  thumbnail: "https://via.placeholder.com/1280x720",
  duration: 60,
  views: 0,
  isPublished: true,
  owner: ObjectId("USER_ID_HERE"), // Get from db.users.findOne()
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## 🐛 Common Issues & Fixes

### Port 8000 Already in Use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9
```

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongosh

# If not, start it
net start MongoDB  # Windows
brew services start mongodb-community  # Mac
sudo systemctl start mongod  # Linux
```

### Cloudinary Upload Fails
- Check `.env` has correct Cloudinary credentials
- Verify file size (Cloudinary free tier: 10MB max)
- Check file format (MP4, WebM, etc.)

### CORS Error
- Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL
- Default: `http://localhost:5173`

---

## 📊 Useful MongoDB Aggregations

### Get Videos with Owner Info
```javascript
db.videos.aggregate([
  { $match: { isPublished: true } },
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
```

### Get User's Watch History
```javascript
db.users.aggregate([
  { $match: { username: "demo_user1" } },
  {
    $lookup: {
      from: "videos",
      localField: "watchHistory",
      foreignField: "_id",
      as: "watchHistoryDetails"
    }
  }
])
```

### Get Most Popular Videos
```javascript
db.videos.find()
  .sort({ views: -1 })
  .limit(10)
  .pretty()
```

---

## 🎯 Quick Test Flow

1. **Start MongoDB:** `mongod` or `net start MongoDB`
2. **Seed data:** `cd BACKEND2 && node src/scripts/seedData.js`
3. **Start backend:** `cd BACKEND2 && npm run dev`
4. **Start frontend:** `cd FRONTEND-2 && npm run dev`
5. **Open browser:** http://localhost:5173
6. **Login:** demo_user1 / password123
7. **Upload video:** Click "Upload Video"
8. **View recommendations:** Check home page
9. **Test search:** Type in search bar

---

**Need more help?** Check `SETUP_AND_USAGE_GUIDE.md` for detailed instructions.

