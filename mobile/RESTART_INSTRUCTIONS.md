# How to Restart the App Properly

## Current Issue

The server is still showing old errors because it's using cached data. You need to:

1. **Stop the current server** (if it's running)
   - Press `Ctrl+C` in the terminal where `npm start` is running

2. **Clear all caches**:
   ```bash
   cd mobile
   rm -rf .expo node_modules/.cache
   ```

3. **Restart the server**:
   ```bash
   npx expo start --clear
   ```

## What Should Happen

After restarting, you should see:
- ✅ No SDK version mismatch errors
- ✅ No babel-preset-expo errors  
- ✅ No metro-react-native-babel-transformer errors
- ✅ QR code ready to scan
- ⚠️ Asset warning (icon.png) - this is OK, app will still work

## If You Still See Errors

Try a complete clean restart:

```bash
cd mobile

# Stop server (Ctrl+C if running)

# Clean everything
rm -rf node_modules package-lock.json .expo node_modules/.cache

# Reinstall
npm install

# Start fresh
npx expo start --clear
```

## Testing the Connection

Once the server starts without errors:
1. Look for the QR code in terminal
2. Open Expo Go on your phone
3. Scan the QR code
4. App should load!

The `exp://192.168.6.40:8081` is the connection URL - that's normal and correct.
