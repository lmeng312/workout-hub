# YouTube Parser Fix - Structured Workouts

## What Was Fixed

✅ **Section-aware parsing**: Detects workout sections with timing (e.g., "▸ Warm Up 30 sec on")
✅ **Section timing inheritance**: Exercises inherit timing from their section header
✅ **Better metadata filtering**: Skips "Time:", "Equipment:", "Muscles Worked:" lines
✅ **Improved equipment detection**: Recognizes "2 x 5kg dumbbells" format
✅ **Rest period tracking**: Captures "30 sec on, 10 sec off" patterns

## Example: YouTube Video Parsing

**Video**: https://www.youtube.com/watch?v=4gX0SWUiV9k

**Before**: Only captured title, missed all exercises

**After**: Correctly parses:
- 46 exercises
- Section timing (30s, 50s, 20s work periods)
- Rest periods (10s off)
- Equipment: dumbbells
- Duration: 40 minutes
- Tags: full body, cardio, strength, dumbbells

## How It Works

### 1. Section Detection
```
▸ Warm Up 30 sec on          → All exercises get 30s duration
▸ Cardio 30 sec on, 10 sec off → All exercises get 30s work, 10s rest
▸ Tabata Finisher 20 sec on, 10 sec off → 20s work, 10s rest
```

### 2. Exercise Parsing
```
Lunge + Overhead Reach       → Exercise with section timing
Romanian Deadlift + Lunge    → Exercise with section timing
Squat + Twist Jump           → Exercise with section timing
```

### 3. Metadata Extraction
```
▸ Time: 40 Min               → estimatedDuration: 40
▸ Equipment: 2 x Dumbbells   → equipment: "dumbbells"
▸ Muscles Worked: Full Body  → tags: ["full body"]
```

## Testing

Try parsing this YouTube video again in your app:
```
https://www.youtube.com/watch?v=4gX0SWUiV9k
```

You should now see:
- All 46 exercises properly extracted
- Correct timing for each section
- Rest periods between exercises
- Equipment and duration metadata

## Backend Restart Required

The backend has been automatically restarted with the updated parser.

If you need to restart manually:
```bash
cd backend
npm run dev
```

## Try It Now

1. Open your mobile app
2. Go to Create (+) tab
3. Paste: `https://www.youtube.com/watch?v=4gX0SWUiV9k`
4. Tap "Parse Workout"
5. You should see all exercises with proper timing!
