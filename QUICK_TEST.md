# Quick Test Guide - Get the App Running in 5 Minutes

## Step-by-Step Setup

### 1. Install Mobile Dependencies (2 min)

```bash
cd mobile
npm install
```

### 2. Start Backend (1 min)

Open a **new terminal window**:

```bash
cd backend
npm install  # if not done yet
npm run dev
```

Keep this terminal open. Backend should show: `Server running on port 3000`

### 3. Configure API URL (30 sec)

Edit `mobile/config.js`:

**For testing on your phone:**
1. Find your computer's IP address:
   - Mac: System Preferences → Network → Wi-Fi → Advanced → TCP/IP
   - Or run: `ifconfig | grep "inet " | grep -v 127.0.0.1`
2. Update `config.js`:
   ```javascript
   export const API_BASE_URL = 'http://YOUR_IP:3000/api';
   // Example: 'http://192.168.1.100:3000/api'
   ```

**For iOS Simulator:**
```javascript
export const API_BASE_URL = 'http://localhost:3000/api';
```

**For Android Emulator:**
```javascript
export const API_BASE_URL = 'http://10.0.2.2:3000/api';
```

### 4. Start Mobile App (1 min)

In the mobile directory:

```bash
npm start
# or
npx expo start
```

### 5. Open on Your Device (30 sec)

**Option A: Expo Go App (Easiest)**
1. Install "Expo Go" from App Store/Google Play
2. Scan the QR code shown in terminal/browser
3. App loads on your phone!

**Option B: iOS Simulator (Mac only)**
- Press `i` in the Expo terminal
- Simulator opens automatically

**Option C: Android Emulator**
- Press `a` in the Expo terminal
- Emulator must be running first

## What You Should See

1. **Green gradient login screen** with "FitCommunity" title
2. **Sign up/Login form**
3. After login: **Bottom tab navigation** with Home, Feed, Library, Profile

## Test the App

1. **Create Account:**
   - Enter username, email, password
   - Tap "Sign Up"
   - Should automatically log you in

2. **Explore:**
   - Home tab: See public workouts
   - Library tab: Your saved workouts
   - Create Workout: Test YouTube/Instagram parsing
   - Profile: View your stats

## Common Issues

**"Network request failed"**
- ✅ Backend running? Check `http://localhost:3000`
- ✅ API_BASE_URL correct?
- ✅ Phone and computer on same WiFi?

**"Cannot connect to Expo"**
- ✅ Install Expo Go app
- ✅ Scan QR code with Expo Go (not camera)
- ✅ Same WiFi network?

**App shows blank screen**
- ✅ Check backend is running
- ✅ Check API_BASE_URL
- ✅ Shake device → "Reload" in developer menu

## Need Help?

See `mobile/TESTING_GUIDE.md` for detailed troubleshooting.
