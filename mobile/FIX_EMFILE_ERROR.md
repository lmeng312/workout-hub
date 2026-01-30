# Fix "EMFILE: too many open files" Error

## Quick Fix (Temporary - Current Terminal Session)

Run this in your terminal **before** starting the app:

```bash
ulimit -n 10240
```

Then start the app:
```bash
npm start
```

## Permanent Fix

Add this to your `~/.zshrc` file (or `~/.bash_profile` if using bash):

```bash
# Increase file watcher limit for development
ulimit -n 10240
```

**To add it:**
```bash
echo "ulimit -n 10240" >> ~/.zshrc
source ~/.zshrc
```

## What This Does

macOS has a default limit of 256 open file descriptors. Metro bundler (React Native's build tool) needs to watch many files, which can exceed this limit. Increasing it to 10240 solves the issue.

## Alternative: Use Watchman (Recommended for React Native)

Install Watchman, which is more efficient for file watching:

```bash
# Install via Homebrew
brew install watchman
```

Watchman is Facebook's file watching service and is the recommended solution for React Native development.

## Quick Script

I've created a script to fix this automatically:

```bash
cd mobile
bash fix-file-watcher.sh
npm start
```

## Verify Fix

After increasing the limit, check it worked:

```bash
ulimit -n
# Should show 10240 (or higher)
```
