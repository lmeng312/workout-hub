# Security Guide - Protecting Your MongoDB URI and Credentials

## ✅ Current Security Status: SECURE

Your MongoDB URI and other sensitive credentials are **properly protected** and not exposed on GitHub!

## How Your Credentials Are Protected

### 1. ✅ Environment Variables (.env file)
Your sensitive data is stored in `backend/.env`:
```bash
MONGODB_URI=your_mongodb_connection_string
PORT=3000
YOUTUBE_API_KEY=your_api_key
```

### 2. ✅ .gitignore Configuration
Your `.gitignore` file properly excludes sensitive files:
```
.env
.env.local
.env.*.local
```

### 3. ✅ Code Uses Environment Variables
Your `backend/server.js` correctly loads credentials:
```javascript
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitcommunity')
```

## Verification Checklist

✅ `.env` file exists in `backend/` directory
✅ `.env` is listed in `.gitignore`
✅ `.env` is NOT committed to git history
✅ Code uses `process.env.MONGODB_URI` instead of hardcoded values

## Best Practices

### 1. Never Commit Sensitive Data
❌ **DON'T DO THIS:**
```javascript
mongoose.connect('mongodb+srv://username:password@cluster.mongodb.net/database')
```

✅ **DO THIS:**
```javascript
mongoose.connect(process.env.MONGODB_URI)
```

### 2. Use .env.example for Documentation
Create a `backend/.env.example` file to show required variables (without actual values):
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
PORT=3000
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 3. Double-Check Before Committing
Always run before committing:
```bash
git status
git diff
```

Look for any files containing:
- MongoDB connection strings
- API keys
- Passwords
- Tokens

## If You Accidentally Committed Credentials

### Step 1: Remove from Latest Commit (if not pushed)
```bash
# Remove the file from git (keep local copy)
git rm --cached backend/.env

# Amend the commit
git commit --amend -m "Your commit message"
```

### Step 2: If Already Pushed to GitHub

**⚠️ IMPORTANT: Rotate your credentials FIRST!**
1. **Immediately change your MongoDB password** in MongoDB Atlas
2. **Generate new API keys** for any exposed services
3. Then clean git history:

```bash
# Install BFG Repo-Cleaner (easier than git filter-branch)
brew install bfg

# Clone a fresh copy
git clone --mirror https://github.com/lmeng312/workout-hub.git

# Remove the file from all history
bfg --delete-files .env workout-hub.git

# Clean up and push
cd workout-hub.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

## Additional Security Measures

### 1. MongoDB Atlas IP Whitelist
- Go to MongoDB Atlas → Network Access
- Restrict IP addresses that can connect
- Don't use `0.0.0.0/0` (allow all) in production

### 2. Use MongoDB Atlas Database Users
- Create specific database users with minimal permissions
- Don't use admin credentials for applications
- Rotate passwords regularly

### 3. Enable 2FA on GitHub
- Go to GitHub Settings → Security
- Enable two-factor authentication
- Use authenticator app (Google Authenticator, Authy)

### 4. Use GitHub Secrets for CI/CD
If using GitHub Actions:
- Go to Repository → Settings → Secrets and variables → Actions
- Add secrets there instead of committing them

### 5. Regular Security Audits
```bash
# Check for accidentally committed secrets
git log -p | grep -i "mongodb"
git log -p | grep -i "password"
git log -p | grep -i "api_key"
```

## Environment Variables Reference

### Backend (.env)
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitcommunity

# Server
PORT=3000

# External APIs
YOUTUBE_API_KEY=your_youtube_api_key
```

### Mobile (config.js)
```javascript
export const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://your-production-api.com/api';
```

## Quick Security Commands

```bash
# Check what's being tracked by git
git ls-files | grep env

# Verify .env is ignored
git check-ignore backend/.env

# See what will be committed (before git add)
git status

# See actual changes (before git commit)
git diff --staged
```

## Emergency Contact

If you believe credentials were exposed:
1. **Immediately** rotate all credentials
2. Check MongoDB Atlas audit logs
3. Review GitHub repository access logs
4. Consider making repository private temporarily

## Resources

- [MongoDB Atlas Security](https://docs.atlas.mongodb.com/security/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP Security Guidelines](https://owasp.org/)

---

**Last Updated:** January 31, 2026
**Status:** ✅ All credentials properly secured
