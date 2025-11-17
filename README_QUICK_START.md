# 🚀 Quick Start Guide

## ⚡ Fast Setup (5 Minutes)

### 1. Setup Environment

Create `BACKEND2/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/videotube
PORT=8000
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=generate_random_32_char_string
REFRESH_TOKEN_SECRET=generate_random_32_char_string
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Get Cloudinary credentials:** https://cloudinary.com (free account)

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Install & Run

```bash
# Terminal 1 - Backend
cd BACKEND2
npm install
npm run dev

# Terminal 2 - Frontend  
cd FRONTEND-2
npm install
npm run dev

# Terminal 3 - Seed Data (Optional)
cd BACKEND2
node src/scripts/seedData.js
```

### 3. Access Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000

**Demo Login:**
- Username: `demo_user1`
- Password: `password123`

---

## 📹 How to Add Videos

### Option 1: Web UI (Recommended)
1. Login at http://localhost:5173
2. Click "Upload Video" in navbar
3. Fill form and select video file
4. Click "Upload Video"
5. Done! Video appears in home page

### Option 2: MongoDB Direct Insert
```javascript
// Connect to MongoDB
mongosh
use videotube

// Get a user ID first
db.users.findOne({}, {_id: 1})

// Insert video (replace USER_ID)
db.videos.insertOne({
  title: "My Video",
  description: "Video description",
  videoFile: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
  thumbnail: "https://via.placeholder.com/1280x720",
  duration: 60,
  views: 0,
  isPublished: true,
  owner: ObjectId("USER_ID_HERE"),
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## 🔍 Quick MongoDB Queries

```bash
# Connect
mongosh
use videotube

# View all videos
db.videos.find().pretty()

# View all users
db.users.find().pretty()

# Count videos
db.videos.countDocuments()

# Search videos
db.videos.find({ title: /react/i })

# Delete all videos (CAUTION!)
# db.videos.deleteMany({})
```

---

## 🧪 Test API

```bash
# Search suggestions
curl "http://localhost:8000/api/v1/search/suggest?q=test"

# Get videos (need auth token)
curl -X GET http://localhost:8000/api/v1/videos \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📚 Full Documentation

- **Complete Guide:** See `SETUP_AND_USAGE_GUIDE.md`
- **Quick Commands:** See `QUICK_COMMANDS.md`

---

## 🐛 Troubleshooting

**MongoDB not running?**
```bash
# Windows
net start MongoDB

# Mac/Linux
mongod
```

**Port 8000 in use?**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9
```

**CORS Error?**
- Check `CORS_ORIGIN` in `.env` matches frontend URL

---

## ✅ Checklist

- [ ] MongoDB installed and running
- [ ] Cloudinary account created
- [ ] `.env` file created with all variables
- [ ] Dependencies installed (`npm install` in both folders)
- [ ] Backend running (`npm run dev` in BACKEND2)
- [ ] Frontend running (`npm run dev` in FRONTEND-2)
- [ ] Can access http://localhost:5173
- [ ] Can login/register
- [ ] Can upload videos

---

**Need Help?** Check the detailed guides or console error messages!

