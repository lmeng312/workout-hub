# Alternative Fix Without Homebrew

If you can't or don't want to install Homebrew, here are alternative solutions:

## Option 1: Use Polling Mode (Temporary Workaround)

Metro can use polling instead of file watching. Create a `metro.config.js`:

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Use polling instead of file watching
config.watchFolders = [];
config.watcher = {
  usePolling: true,
  interval: 1000,
};

module.exports = config;
```

Then start:
```bash
npm start
```

**Note:** This is slower but should work without Watchman.

## Option 2: Reduce File Watching Scope

Create `.watchmanconfig` in the mobile directory:

```json
{
  "ignore_dirs": [
    "node_modules",
    ".git",
    ".expo",
    "dist",
    "build"
  ]
}
```

And add to `metro.config.js`:

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ignore more directories
config.watchFolders = [__dirname];
config.resolver = {
  ...config.resolver,
  blockList: [
    /node_modules\/.*\/node_modules\/react-native\/.*/,
  ],
};

module.exports = config;
```

## Option 3: Use Web Version (No File Watching)

Test the app in web browser instead:

```bash
npm run web
```

This avoids the file watching issue entirely, though some features may not work.

## Recommended: Install Homebrew + Watchman

The best long-term solution is still to install Homebrew and Watchman. See `INSTALL_HOMEBREW.md` for instructions.
