# Mobile App Troubleshooting

## Common Issues and Solutions

### Issue 1: "expo: command not found"

**Solution:** Use `npx expo` instead of `expo`

The scripts in `package.json` have been updated to use `npx expo`. You can now run:

```bash
npm start
# This will automatically use npx expo start
```

Or manually:
```bash
npx expo start
```

### Issue 2: "Invalid tag name" Error

**Solution:** Clean install

If you get npm errors about invalid tag names:

```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
```

### Issue 3: "Network request failed"

**Check:**
1. Backend is running: `cd backend && npm run dev`
2. API URL is correct in `mobile/config.js`
3. Phone and computer on same WiFi (for physical device)
4. Test backend in phone browser: `http://YOUR_IP:3000/api/workouts`

### Issue 4: Dependencies Not Installing

**Try:**
```bash
# Clear npm cache
npm cache clean --force

# Remove and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 5: Metro Bundler Issues

**Clear cache:**
```bash
npx expo start --clear
```

### Issue 6: Port Already in Use

If port 8081 is already in use:

```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Or use different port
npx expo start --port 8082
```

## Quick Fixes

### Fresh Start
```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
npm start
```

### Update Expo
```bash
npx expo install --fix
```

### Check Installation
```bash
# Verify expo is available
npx expo --version

# Should show version number
```

## Still Having Issues?

1. Check Node.js version: `node --version` (should be v14+)
2. Check npm version: `npm --version`
3. Try updating npm: `npm install -g npm@latest`
4. Check Expo documentation: https://docs.expo.dev/
