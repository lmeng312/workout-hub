# Testing on Physical Device - Step by Step

## ✅ Configuration Complete

Your API URL has been configured for physical device testing:
- **Your IP Address**: `192.168.6.40`
- **API URL**: `http://192.168.6.40:3000/api`

## Step-by-Step Testing Process

### 1. Start Backend Server

Open a terminal and start your backend:

```bash
cd backend
npm install  # if not already done
npm run dev
```

**Verify it's running:**
- You should see: `Server running on port 3000`
- Test in browser: `http://localhost:3000/api/workouts` (should show JSON or auth error)

### 2. Verify Backend is Accessible from Network

Test that your backend is reachable from your phone:

**On your phone's browser:**
1. Make sure your phone is on the **same WiFi network** as your computer
2. Open browser on phone
3. Navigate to: `http://192.168.6.40:3000/api/workouts`
4. You should see JSON response (or authentication error - that's fine, it means it's working!)

**If you get "connection refused" or can't connect:**
- Check firewall settings (may need to allow port 3000)
- Verify phone and computer are on same WiFi network
- Try restarting backend server

### 3. Install Expo Go App

**On your phone:**
- **iOS**: Download [Expo Go](https://apps.apple.com/app/expo-go/id982107779) from App Store
- **Android**: Download [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) from Google Play

### 4. Start Mobile App

Open a **new terminal** (keep backend running in the first one):

```bash
cd mobile
npm install  # if not already done
npm start
```

This will:
- Start Metro bundler
- Open Expo DevTools in your browser
- Show a QR code

### 5. Connect Your Phone

**Option A: Scan QR Code (Easiest)**
1. Open **Expo Go** app on your phone
2. Tap "Scan QR Code"
3. Scan the QR code from terminal/browser
4. App will load on your phone!

**Option B: Manual Connection**
1. Open Expo Go app
2. Tap "Enter URL manually"
3. Enter the URL shown in terminal (usually starts with `exp://`)

### 6. Test the App

Once the app loads on your phone:

1. **Create Account:**
   - Enter username, email, password
   - Tap "Sign Up"
   - Should automatically log you in

2. **Verify Connection:**
   - If you see workouts or can create an account, API is connected! ✅
   - If you see "Network request failed", see troubleshooting below

3. **Test Features:**
   - Create workout from YouTube link
   - View workout library
   - Test social feed

## Troubleshooting

### "Network request failed" Error

**Checklist:**
1. ✅ Backend running? Check terminal shows "Server running on port 3000"
2. ✅ Same WiFi? Phone and computer must be on same network
3. ✅ IP correct? Verify your IP hasn't changed: `ipconfig getifaddr en0`
4. ✅ Firewall? macOS may block connections - check System Preferences → Security & Privacy → Firewall
5. ✅ Test in browser: Try `http://192.168.6.40:3000/api/workouts` on phone browser

### "Cannot connect to Expo"

- Make sure Expo Go app is installed
- Try scanning QR code again
- Check phone and computer are on same WiFi
- Try `npx expo start --clear` to clear cache

### Backend not accessible from phone

**macOS Firewall Fix:**
1. System Preferences → Security & Privacy → Firewall
2. Click "Firewall Options"
3. Make sure Node.js is allowed, or temporarily disable firewall for testing

**Or allow port 3000:**
```bash
# Allow incoming connections on port 3000
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/node
```

### IP Address Changed

If your IP address changes (common with WiFi), update `mobile/config.js`:

```bash
# Find new IP
ipconfig getifaddr en0

# Update config.js with new IP
```

## Quick Verification

**Test 1: Backend accessible?**
```bash
# On your phone browser
http://192.168.6.40:3000/api/workouts
```

**Test 2: App connects?**
- Open app on phone
- Try to create account
- If successful, API is connected! ✅

## Current Configuration

- **Your IP**: `192.168.6.40`
- **API URL**: `http://192.168.6.40:3000/api`
- **Config File**: `mobile/config.js`

## Tips

1. **Keep terminals open**: Backend in one, mobile app in another
2. **Same WiFi**: Critical for physical device testing
3. **Hot reload**: Changes auto-reload in Expo Go (shake device for menu)
4. **Debug**: Shake device → "Debug Remote JS" for Chrome DevTools

## Next Steps

Once connected:
1. Test creating workouts
2. Test YouTube/Instagram parsing
3. Test social features
4. Test on different devices

Happy testing! 🚀
