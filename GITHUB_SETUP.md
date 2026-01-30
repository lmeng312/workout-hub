# GitHub Setup Guide

Your FitCommunity project is now a Git repository! Here's how to connect it to GitHub.

## Option 1: Create New Repository on GitHub (Recommended)

### Step 1: Create Repository on GitHub
1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Repository name: `fitcommunity` (or your preferred name)
4. Description: "Social fitness mobile app - save workouts from YouTube/Instagram"
5. Choose **Private** or **Public**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

### Step 2: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Run these in your terminal:

```bash
cd /Users/lili/Desktop/Projects/workout_app

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/fitcommunity.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Option 2: Use Existing Repository

If you already have a GitHub repository:

```bash
cd /Users/lili/Desktop/Projects/workout_app

# Add your existing repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

## Verify Connection

Check that the remote is set correctly:

```bash
git remote -v
```

You should see:
```
origin  https://github.com/YOUR_USERNAME/fitcommunity.git (fetch)
origin  https://github.com/YOUR_USERNAME/fitcommunity.git (push)
```

## Future Commits

After making changes, commit and push:

```bash
# Stage changes
git add .

# Commit with message
git commit -m "Your commit message"

# Push to GitHub
git push
```

## Current Status

✅ Git repository initialized
✅ Initial commit created (37 files, 4853+ lines)
✅ .gitignore configured
✅ Ready to push to GitHub

## Repository Contents

- **Backend**: Node.js/Express API with MongoDB
- **Mobile**: React Native Expo app
- **Documentation**: README, testing guides, parser docs
- **Scripts**: Test parser script
- **Total**: 37 files committed

## Next Steps

1. Create repository on GitHub (if you haven't already)
2. Connect local repo to GitHub (commands above)
3. Push your code
4. Share your repository! 🎉
