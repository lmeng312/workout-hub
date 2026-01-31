# Adding Exercise Images to Existing Workouts

## Problem
Workouts created before the exercise images feature was added won't have images automatically. This is what you're seeing with your "Push-up" workout.

## Solutions

### Option 1: Run Migration Script (Recommended for All Workouts)

This will update ALL existing workouts in your database with exercise images.

1. **Make sure your backend is running** or MongoDB is accessible

2. **Run the migration script:**
   ```bash
   cd backend
   node scripts/migrateExerciseImages.js
   ```

3. **Refresh your app** - images should now appear!

The script will:
- Find all workouts without images
- Look up matching images for each exercise
- Save the updated workouts
- Show you a summary of what was updated

### Option 2: Refresh Images via API (Per Workout)

For a single workout, you can refresh its images using the new API endpoint:

**From the app (after implementing button):**
- Edit the workout and save it again
- Or add a "Refresh Images" button

**Using curl/Postman:**
```bash
curl -X POST http://your-api-url/workouts/WORKOUT_ID/refresh-images \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Option 3: Edit and Re-save the Workout

Simply:
1. Click the edit button on your workout
2. Click save without making changes
3. The workout will be re-saved with images

## Why This Happens

- Your "Push-up" workout was created before we added the image feature
- The backend only adds images when workouts are created or updated
- Existing workouts in the database don't get automatically updated

## Verifying It Works

After running the migration, check:
1. Open the workout detail screen
2. You should see a small image next to "Push-up"
3. Start the workout - you should see a large image for the current exercise

## Testing with a New Workout

Create a new workout with exercises like:
- Push up
- Squat
- Plank
- Burpee

You should immediately see images appear!

## Troubleshooting

### Images Still Not Showing After Migration

1. **Check the console output** - did the migration succeed?
2. **Verify exercise names** - they need to match our lookup (e.g., "Push-up" or "Push up")
3. **Check network** - can your device access GitHub URLs?
4. **Try creating a new workout** - do images appear for new workouts?

### Migration Script Errors

If you see connection errors:
```bash
# Make sure MongoDB is running
# Check your MONGODB_URI in backend/.env
```

### Backend Not Running

If you get "connection refused":
```bash
cd backend
npm start
```

## Next Steps

1. Run the migration script to update existing workouts
2. Test with your "Push-up" workout
3. Create a new workout to verify images work for new workouts
4. Optionally: add a "Refresh Images" button in the UI
