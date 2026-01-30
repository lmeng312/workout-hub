# Mobile App Testing Guide

## Quick Start - Test the App

### Prerequisites

1. **Node.js** installed (v14 or higher)
2. **Expo CLI** installed globally:
   ```bash
   npm install -g expo-cli
   ```
   Or use `npx expo` (no global install needed)

3. **Backend running** (see below)

### Step 1: Install Dependencies

```bash
cd mobile
npm install
```

### Step 2: Start Backend Server

In a separate terminal:

```bash
cd backend
npm install  # if not already done
npm run dev
```

The backend should be running on `http://localhost:3000`

### Step 3: Update API Configuration

Edit `mobile/config.js` and update the API URL:

**For iOS Simulator:**
```javascript
export const API_BASE_URL = 'http://localhost:3000/api';
```

**For Android Emulator:**
```javascript
export const API_BASE_URL = 'http://10.0.2.2:3000/api';
```

**For Physical Device:**
```javascript
// Find your computer's IP address:
// macOS: System Preferences → Network
// Windows: ipconfig
// Linux: ifconfig or ip addr

export const API_BASE_URL = 'http://YOUR_IP_ADDRESS:3000/api';
// Example: 'http://192.168.1.100:3000/api'
```

### Step 4: Start the Mobile App

```bash
cd mobile
npm start
# or
npx expo start
```

This will open Expo DevTools in your browser with a QR code.

## Testing Options

### Option 1: Expo Go App (Easiest - Recommended)

1. **Install Expo Go** on your phone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Scan QR Code:**
   - iOS: Open Camera app and scan the QR code
   - Android: Open Expo Go app and scan the QR code

3. **Make sure your phone and computer are on the same WiFi network**

### Option 2: iOS Simulator (Mac only)

1. Install Xcode from App Store
2. Open iOS Simulator: `xcode-select --install` (if needed)
3. In Expo DevTools, press `i` or click "Run on iOS simulator"
4. Wait for simulator to open and app to load

### Option 3: Android Emulator

1. Install Android Studio
2. Set up an Android Virtual Device (AVD)
3. Start the emulator
4. In Expo DevTools, press `a` or click "Run on Android device/emulator"

### Option 4: Web Browser (Limited)

```bash
npm run web
# or
npx expo start --web
```

**Note:** Some features may not work in web (camera, native features). Best for UI testing only.

## Testing the App Features

### 1. Authentication
- Create a new account
- Login with credentials
- Check if token is saved

### 2. Home Screen
- View public workouts
- Pull to refresh
- Tap workout to see details

### 3. Create Workout
- Test YouTube link parsing
- Test Instagram caption parsing
- Test custom workout creation
- Review preview screen

### 4. Library
- View your workouts
- Mark workouts as completed
- Save workouts from others

### 5. Social Feed
- Follow other users (need to create test users)
- See workouts from followed users

### 6. Profile
- View profile stats
- Logout

## Troubleshooting

### "Network request failed"
- Check backend is running on port 3000
- Verify API_BASE_URL in `config.js` matches your setup
- For physical device: ensure phone and computer are on same WiFi
- Check firewall isn't blocking port 3000

### "Cannot connect to Expo"
- Make sure Expo CLI is installed
- Try `npx expo start --clear`
- Check your network connection

### "Module not found"
- Run `npm install` in mobile directory
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### App crashes on startup
- Check backend is running
- Verify API_BASE_URL is correct
- Check console for error messages
- Try clearing cache: `npx expo start --clear`

## Development Tips

### Hot Reloading
- Changes automatically reload in Expo Go
- Shake device (or Cmd+D on simulator) for developer menu

### Debugging
- Open developer menu: Shake device or Cmd+D (iOS) / Cmd+M (Android)
- Enable "Debug Remote JS" to use Chrome DevTools
- Check Metro bundler logs in terminal

### Testing Backend Connection
Test if backend is accessible:
```bash
curl http://localhost:3000/api/workouts
```

Should return JSON (may need auth token).

## Quick Test Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Backend running (`npm run dev` in backend/)
- [ ] API_BASE_URL configured correctly
- [ ] Expo started (`npm start`)
- [ ] App opens in Expo Go/simulator
- [ ] Can create account
- [ ] Can login
- [ ] Can view workouts
- [ ] Can create workout

## Next Steps

Once basic testing works:
1. Test workout parsing with real YouTube/Instagram examples
2. Test social features (follow, feed)
3. Test workout completion tracking
4. Test on different devices/screen sizes
