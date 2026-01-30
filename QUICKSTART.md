# FitCommunity Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/fitcommunity
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

Start MongoDB (if local):
```bash
# macOS
brew services start mongodb-community

# Or use MongoDB Atlas (cloud) - update MONGODB_URI in .env
```

Start backend:
```bash
npm run dev
```

### Step 2: Mobile App Setup

```bash
cd mobile
npm install
```

Update `mobile/config.js` with your backend URL:
- **iOS Simulator**: `http://localhost:3000/api`
- **Android Emulator**: `http://10.0.2.2:3000/api`
- **Physical Device**: `http://YOUR_COMPUTER_IP:3000/api` (find IP with `ipconfig` or `ifconfig`)

Start mobile app:
```bash
npm start
```

### Step 3: Test the App

1. Open Expo Go on your phone or use a simulator
2. Create an account
3. Try creating a workout from a YouTube link or Instagram caption
4. Explore the library and social features!

## 📱 Key Features to Try

1. **Create Workout from YouTube**: 
   - Go to Create Workout
   - Select YouTube tab
   - Paste a YouTube workout video link

2. **Create Workout from Instagram**:
   - Select Instagram tab
   - Paste workout caption text

3. **Social Feed**:
   - Follow other users
   - See their workouts in the Feed tab

4. **Workout Library**:
   - View all your workouts
   - Mark workouts as completed
   - Save workouts from others

## 🐛 Troubleshooting

**Backend won't start:**
- Check MongoDB is running
- Verify .env file exists and has correct values

**Mobile app can't connect:**
- Verify backend is running on port 3000
- Check API_BASE_URL in mobile/config.js matches your setup
- For physical devices, ensure phone and computer are on same network

**Workout parsing not working:**
- The parser is basic - it works best with structured text
- Format: "Exercise Name: 3x10" or "Exercise Name 3 sets of 10 reps"

## 📝 Next Steps

- Add exercise builder UI for custom workouts
- Enhance workout parsing with better AI
- Add profile picture uploads
- Implement push notifications
- Add workout analytics
