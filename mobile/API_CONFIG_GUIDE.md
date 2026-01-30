# API Configuration Guide

## Quick Reference

The API URL is configured in `mobile/config.js`. Update it based on how you're testing:

### Option 1: iOS Simulator (Mac)
```javascript
const DEV_API_URL = 'http://localhost:3000/api';
```

### Option 2: Android Emulator
```javascript
const DEV_API_URL = 'http://10.0.2.2:3000/api';
```

### Option 3: Physical Device (Phone/Tablet)
```javascript
// Replace YOUR_IP with your computer's IP address
const DEV_API_URL = 'http://YOUR_IP:3000/api';
// Example: 'http://192.168.1.100:3000/api'
```

## Finding Your Computer's IP Address

### macOS
1. **System Preferences Method:**
   - System Preferences → Network
   - Select Wi-Fi (or Ethernet)
   - Look for "IP Address" (e.g., 192.168.1.100)

2. **Terminal Method:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   Or:
   ```bash
   ipconfig getifaddr en0  # For Wi-Fi
   ipconfig getifaddr en1  # For Ethernet
   ```

### Windows
1. **Command Prompt:**
   ```cmd
   ipconfig
   ```
   Look for "IPv4 Address" under your active network adapter

2. **Settings Method:**
   - Settings → Network & Internet → Wi-Fi/Ethernet
   - Click on your network → Properties
   - Find "IPv4 address"

### Linux
```bash
ifconfig
# or
ip addr show
# or
hostname -I
```

## Step-by-Step Configuration

### 1. Determine Your Testing Method

**Are you testing on:**
- ✅ iOS Simulator → Use `localhost`
- ✅ Android Emulator → Use `10.0.2.2`
- ✅ Physical Device → Use your computer's IP

### 2. Update config.js

Open `mobile/config.js` and update the `DEV_API_URL`:

```javascript
// Example for physical device:
const DEV_API_URL = 'http://192.168.1.100:3000/api';
```

### 3. Verify Backend is Running

Make sure your backend is running:
```bash
cd backend
npm run dev
```

You should see: `Server running on port 3000`

### 4. Test Connection

Test if the API is accessible:

**From terminal:**
```bash
# For localhost
curl http://localhost:3000/api/workouts

# For your IP (replace with your IP)
curl http://YOUR_IP:3000/api/workouts
```

**From your phone browser:**
- Open browser on your phone
- Navigate to: `http://YOUR_IP:3000/api/workouts`
- Should see JSON response (or authentication error, which means it's working!)

## Common Issues

### "Network request failed" Error

**Checklist:**
1. ✅ Backend is running? (`npm run dev` in backend/)
2. ✅ Correct API URL in `config.js`?
3. ✅ Phone and computer on same WiFi network? (for physical device)
4. ✅ Firewall not blocking port 3000?
5. ✅ Backend accessible? Test with `curl` or browser

### "Connection refused"

- Backend not running → Start it with `npm run dev`
- Wrong port → Check backend is on port 3000
- Wrong IP address → Verify your computer's IP

### Works on Simulator but not Phone

- Simulator uses `localhost` (same machine)
- Phone needs your computer's IP address
- Make sure phone and computer are on same WiFi

## Dynamic Configuration (Advanced)

If you want to switch between environments easily, you can use environment variables:

```javascript
// In config.js
const getApiUrl = () => {
  if (__DEV__) {
    // Check if running on device vs simulator
    if (Platform.OS === 'ios') {
      // iOS Simulator can use localhost
      return 'http://localhost:3000/api';
    } else if (Platform.OS === 'android') {
      // Android Emulator uses 10.0.2.2
      return 'http://10.0.2.2:3000/api';
    } else {
      // Physical device - you'll need to set this manually
      return 'http://YOUR_IP:3000/api';
    }
  }
  return 'https://your-production-api.com/api';
};

export const API_BASE_URL = getApiUrl();
```

## Production Configuration

When you deploy to production:

1. Deploy your backend to a hosting service (Heroku, AWS, etc.)
2. Update `PROD_API_URL` in `config.js`:
   ```javascript
   const PROD_API_URL = 'https://api.yourdomain.com/api';
   ```

## Quick Test

After configuring, test the connection:

1. Start backend: `cd backend && npm run dev`
2. Start mobile app: `cd mobile && npm start`
3. Try to create an account
4. If you see "Network request failed", check your API URL configuration

## Recommended Setup

For easiest testing:
1. **Start with iOS Simulator** (if on Mac) → Use `localhost`
2. **Or use Expo Go on phone** → Use your computer's IP
3. **Keep backend running** in a separate terminal
