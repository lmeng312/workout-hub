# Solution for EMFILE Error

## The Problem

Even though your file descriptor limit is high (1,048,575), Metro bundler is still using Node.js's default file watcher, which is inefficient and can hit limits.

## The Solution: Install Watchman

**Watchman** is Facebook's file watching service, specifically designed for React Native. It's the recommended solution.

### Install Watchman

```bash
brew install watchman
```

This will:
- Install an efficient file watching service
- Replace Node.js's default watcher
- Solve the EMFILE error permanently

### After Installing Watchman

1. **Close your current terminal** (if npm start is running)
2. **Install Watchman:**
   ```bash
   brew install watchman
   ```
3. **Start the app again:**
   ```bash
   cd mobile
   npm start
   ```

## Why This Works

- Watchman is optimized for watching large directory trees
- It's the official file watcher for React Native
- It handles file watching much more efficiently than Node.js's built-in watcher
- Once installed, Metro will automatically use it

## Alternative: Use Polling (Temporary Fix)

If you can't install Watchman right now, you can use polling mode:

```bash
cd mobile
npx expo start --no-dev --minify
```

Or set an environment variable:
```bash
export EXPO_NO_METRO_LAZY=1
npm start
```

But **Watchman is the proper solution**.

## Verify Watchman is Working

After installing, you can verify:

```bash
watchman version
# Should show version number
```

Then start the app - it should work without EMFILE errors!
