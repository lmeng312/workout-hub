# Fix MongoDB Connection Timeout

## The Problem

Error: `operation users.find one() buffered timed out after 10,000 milliseconds`

This means MongoDB is not running or not accessible.

## Solution Options

### Option 1: Start Local MongoDB (If Installed)

**Check if MongoDB is installed:**
```bash
which mongod
# or
brew list mongodb-community
```

**Start MongoDB:**
```bash
# If installed via Homebrew:
brew services start mongodb-community

# Or start manually:
mongod --config /opt/homebrew/etc/mongod.conf
# (path may vary)
```

**Verify it's running:**
```bash
ps aux | grep mongod
# Should show mongod process
```

### Option 2: Install MongoDB (If Not Installed)

**Install via Homebrew:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Option 3: Use MongoDB Atlas (Cloud - Recommended for Easy Setup)

1. **Sign up**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create free cluster**: Free tier available
3. **Get connection string**: 
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
4. **Update backend/.env**:
   ```bash
   cd backend
   # Create .env file if it doesn't exist
   echo "MONGODB_URI=your-atlas-connection-string-here" > .env
   echo "PORT=3000" >> .env
   echo "JWT_SECRET=your-secret-key-here" >> .env
   ```
5. **Restart backend**:
   ```bash
   npm run dev
   ```

## Quick Test

After starting MongoDB, test the connection:

```bash
# Test MongoDB is accessible
mongosh
# or
mongo
```

If it connects, MongoDB is running!

## Current Status

- ✅ Backend server is running
- ❌ MongoDB is NOT running
- ⚠️ Need to start MongoDB or use MongoDB Atlas

## Recommended: MongoDB Atlas

For easiest setup, use MongoDB Atlas (free tier):
- No local installation needed
- Works immediately
- Free for development
- Easy to share/deploy later
