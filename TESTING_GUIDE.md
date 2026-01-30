# Testing Guide - Workout Parser

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Run Test Script

```bash
npm run test:parser
```

This will test all 5 real workout examples you provided.

## Test Cases Included

1. **YouTube Example 1**: Strength Workout (30 MIN FULL BODY)
2. **YouTube Example 2**: Yoga/Stretch (20 Min Full Body Stretch)
3. **Instagram Example 1**: Hip Mobility Flow
4. **Instagram Example 2**: Running Strength (3 Mile Run + Circuit)
5. **Instagram Example 3**: Hip Mobility (Different Format)

## Expected Results

The test script will show:
- ✅ Parsed title
- ⏱️ Duration extracted
- 💪 Number of exercises found
- 🏷️ Auto-detected tags
- 🎯 Equipment needed
- 📊 Difficulty level
- 📝 Full exercise list with sets/reps/duration

## Sample Output

```
📋 Test: YouTube Example 1: Strength Workout
URL: https://www.youtube.com/watch?v=4gX0SWUiV9k
--------------------------------------------------------------------------------
✅ Title: 30 MIN FULL BODY WORKOUT at Home (No Equipment)
⏱️  Duration: 30 minutes
💪 Exercises Found: 8
🏷️  Tags: strength, full body, no equipment
🎯 Equipment: none
📊 Difficulty: intermediate

📝 Exercises:
   1. Jumping Jacks - 45 seconds
   2. Squats - 3 sets x 15 reps
   3. Push-ups - 3 sets x 10 reps
   ...
```

## Testing with Real URLs

### YouTube URLs

The parser will:
1. Fetch video title via oEmbed API
2. Attempt to fetch description (may not work without API key)
3. Parse from title + any provided caption text

**Note**: For best results with YouTube, paste the video description in the caption field.

### Instagram URLs

The parser will:
1. Extract post ID from URL
2. Parse from provided caption text
3. Handle various caption formats

**Note**: Instagram requires you to paste the caption text manually (Instagram API access is restricted).

## Manual Testing via API

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

### 2. Test Preview Endpoint

```bash
curl -X POST http://localhost:3000/api/workouts/parse/preview \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "text": "30 MIN FULL BODY WORKOUT\n\n1. Squats x 15\n2. Push-ups x 10\n3. Plank - 45 sec",
    "sourceType": "youtube",
    "url": "https://www.youtube.com/watch?v=4gX0SWUiV9k"
  }'
```

### 3. Test Instagram Parsing

```bash
curl -X POST http://localhost:3000/api/workouts/parse/preview \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "text": "Hip Mobility Flow 💪\n\n1. Hip Circles - 10 each direction\n2. Leg Swings - 15 per side\n3. Hip Flexor Stretch - 30 sec per side\n\n#hipmobility #flexibility",
    "sourceType": "instagram",
    "url": "https://www.instagram.com/p/DT3MKs-ETrC/"
  }'
```

## Mobile App Testing

1. Start mobile app: `cd mobile && npm start`
2. Navigate to "Create Workout"
3. Select YouTube or Instagram tab
4. Paste URL or caption text
5. Tap "Create Workout"
6. Review preview screen
7. Edit if needed
8. Save workout

## Troubleshooting

### Parser finds 0 exercises
- Check if text format matches supported patterns
- Try adding explicit format: "Exercise Name: 3x10"
- Use preview screen to manually add exercises

### YouTube description not fetched
- This is expected - scraping may not work
- Paste video description manually in caption field
- Consider using YouTube Data API v3 (requires API key)

### Tags not detected
- Check if keywords match supported patterns
- Add hashtags for better tag detection
- Tags can be manually edited in preview screen

## Comparing Results

The test script outputs JSON that you can compare with expected results:

```json
{
  "name": "YouTube Example 1: Strength Workout",
  "url": "https://www.youtube.com/watch?v=4gX0SWUiV9k",
  "success": true,
  "parsed": {
    "title": "30 MIN FULL BODY WORKOUT at Home",
    "duration": 30,
    "exerciseCount": 8,
    "exercises": [...],
    "tags": ["strength", "full body", "no equipment"],
    "equipment": "none",
    "difficulty": "intermediate"
  }
}
```

Compare this with your expected results to verify parser accuracy.
