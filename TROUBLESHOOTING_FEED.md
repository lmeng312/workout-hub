# Troubleshooting Feed Not Showing Completed Workouts

## Steps to Debug

### 1. Check Backend Logs

After completing a workout, check your backend terminal logs. You should see something like:

```
📱 Feed request from user: test (507f1f77bcf86cd799439011)
👥 Following 0 users
📝 Found 1 created workouts
✅ Found 1 completed workouts
👤 User has 1 completions in results
🎯 Total activities: 2 (1 created + 1 completed)
```

If you don't see these logs, the feed endpoint isn't being called.

### 2. Verify Workout Completion

When you complete a workout, check:

**In Backend Terminal:**
- Look for the POST request to `/workouts/:id/complete`
- Should return 200 OK

**What to check:**
1. Complete a workout through the app
2. Look at backend logs
3. Refresh the feed screen

### 3. Common Issues & Solutions

#### Issue: No Logs When Refreshing Feed
**Solution:** Backend server might not be running
```bash
cd backend
npm start
```

#### Issue: Workout completes but doesn't show in feed
**Possible causes:**
1. **Not refreshing feed** - Pull down to refresh after completing
2. **Wrong user** - Make sure you're logged in as the same user
3. **Completion not saved** - Check if `completedBy` array is updated

#### Issue: Empty feed even with completions
**Check:**
1. Are you following any users? (not required now, but check)
2. Do you have any workouts? Try creating one
3. Complete a workout and pull to refresh

### 4. Manual Verification

Check if completion was saved:

**Option A: Check in MongoDB Atlas**
1. Go to your MongoDB Atlas dashboard
2. Browse Collections → workout_app → workouts
3. Find your workout
4. Check `completedBy` array - should have your user ID

**Option B: Use the API directly**
```bash
# Get workout details (replace IDs)
curl http://localhost:3000/workouts/WORKOUT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Look for `completedBy` array in response.

### 5. Force Feed Refresh

In the app:
1. Go to Feed screen
2. Pull down to refresh
3. Wait for loading to complete

### 6. Test Sequence

Try this complete sequence:

1. **Create a workout** (if you don't have one)
   - Go to Library
   - Tap + button
   - Create simple workout with 1 exercise
   - Save

2. **Complete the workout**
   - Open the workout
   - Tap "Start Workout"
   - Mark exercises complete
   - Tap "Finish Workout"

3. **Check feed**
   - Go to Feed tab
   - Pull down to refresh
   - Should see your completion

### 7. Check Backend Server

Make sure backend is running properly:

```bash
# In backend directory
cd /Users/lili/Desktop/Projects/workout_app/backend

# Check if server is running
lsof -i :3000

# If not, start it
npm start
```

### 8. Check Mobile App API Connection

In `mobile/config.js`, verify:
```javascript
export const API_BASE_URL = 'http://YOUR_IP:3000';
```

Make sure it points to your backend server.

### 9. Enable More Debug Info

The feed endpoint now logs:
- Who requested the feed
- How many workouts found
- How many completed workouts
- How many are user's own completions
- Total activities

Watch backend terminal when you:
1. Complete a workout
2. Refresh the feed

### 10. Quick Test

Open three terminal windows:

**Terminal 1: Backend**
```bash
cd backend
npm start
# Watch for feed requests
```

**Terminal 2: Mobile App**
```bash
cd mobile
npm start
```

**Terminal 3: Check what's happening**
```bash
# After completing workout, check backend logs
# Should see completion POST request
# Then when refreshing feed, should see feed GET request with logs
```

## Expected Behavior

When working correctly:
1. Complete workout → Backend logs show POST /workouts/:id/complete
2. Refresh feed → Backend logs show GET /social/feed with activity counts
3. Feed displays completion card with your name and workout

## Still Not Working?

If following all steps and still not working, check backend terminal output and share what you see after:
1. Completing a workout
2. Refreshing the feed

The new logging will help identify exactly where the issue is!
