# Fix "Port Already in Use" Error

## The Problem

Error: `EADDRINUSE: address already in use :::3000`

This means another process is already using port 3000 (probably an old backend server instance).

## Quick Fix

### Option 1: Kill the Process (Recommended)

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Then restart backend
cd backend
npm run dev
```

### Option 2: Use a Different Port

Edit `backend/.env`:
```
PORT=3001
```

Then restart:
```bash
npm run dev
```

**Note**: If you change the port, also update `mobile/config.js`:
```javascript
const DEV_API_URL = 'http://192.168.6.40:3001/api';
```

## Verify Port is Free

```bash
# Check what's using port 3000
lsof -i :3000

# Should show nothing (or the process you just killed)
```

## Restart Backend

After killing the old process:

```bash
cd backend
npm run dev
```

You should see:
```
MongoDB connected
Server running on port 3000
```

## Prevention

Always stop the server properly with `Ctrl+C` before starting a new one, or use `npm run dev` which uses nodemon and will auto-restart on file changes.
