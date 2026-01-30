# Workout Parser Documentation

## Overview

The improved workout parser can extract structured workout data from:
- YouTube video links (title + description)
- Instagram post captions
- Plain text workout descriptions

## Features

### 1. Pattern Recognition

The parser recognizes multiple exercise formats:

#### Rep-based Exercises
- `"Squats x 15"` → 1 set, 15 reps
- `"Push-ups: 3x10"` → 3 sets, 10 reps each
- `"Lunges (10 per side)"` → 1 set, 10 reps per side
- `"3 sets of 10 reps"` → 3 sets, 10 reps
- `"10 reps x 3 sets"` → 3 sets, 10 reps

#### Time-based Exercises
- `"Plank - 45 sec"` → 1 set, 45 seconds
- `"Hold for 30 seconds"` → 1 set, 30 seconds
- `"0:45 - Plank"` → 1 set, 45 seconds

#### Mixed Formats
- `"Exercise Name: 3x10"` → 3 sets, 10 reps
- `"Exercise Name - 30 sec"` → 1 set, 30 seconds
- `"Exercise Name (10 per side)"` → 1 set, 10 reps per side

### 2. Smart Auto-Tagging

Automatically extracts tags based on keywords:

#### Workout Types
- `hiit`, `high intensity` → tag: "hiit"
- `cardio`, `cardiovascular` → tag: "cardio"
- `strength`, `weight training` → tag: "strength"
- `yoga`, `yogi` → tag: "yoga"
- `stretching`, `flexibility` → tag: "stretching"
- `mobility` → tag: "mobility"

#### Body Parts
- `full body`, `total body` → tag: "full body"
- `upper body`, `arms`, `chest` → tag: "upper body"
- `lower body`, `legs` → tag: "lower body"
- `core`, `abs` → tag: "core"
- `hips`, `hip mobility` → tag: "hips"

#### Equipment
- `no equipment`, `bodyweight` → tag: "no equipment"
- `dumbbell`, `dumbbells` → tag: "dumbbells"
- `kettlebell` → tag: "kettlebells"
- `resistance band` → tag: "resistance bands"

#### Hashtags
- Extracts hashtags from text: `#hipmobility` → tag: "hipmobility"

### 3. Metadata Extraction

- **Duration**: Extracts from title (e.g., "30 MIN", "20 minute")
- **Equipment**: Detects equipment needed
- **Difficulty**: Determines beginner/intermediate/advanced
- **Description**: Extracts first paragraph as description

### 4. YouTube Integration

- Fetches video title via oEmbed API
- Attempts to fetch video description (scraping)
- Falls back to user-provided caption text

### 5. Instagram Integration

- Parses Instagram post captions
- Handles numbered lists, emoji bullets, hashtags
- Extracts exercises from various caption formats

## API Endpoints

### Preview Workout (New)

```http
POST /api/workouts/parse/preview
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "optional caption text",
  "sourceType": "youtube" | "instagram" | "custom",
  "url": "https://youtube.com/watch?v=..."
}
```

**Response:**
```json
{
  "success": true,
  "workout": {
    "title": "30 MIN FULL BODY WORKOUT",
    "description": "...",
    "exercises": [...],
    "tags": ["strength", "full body"],
    "estimatedDuration": 30,
    "equipment": "none",
    "difficulty": "intermediate"
  },
  "exerciseCount": 8,
  "message": "Found 8 exercises. Review and edit if needed before saving."
}
```

### Create Workout from Parse

```http
POST /api/workouts/parse
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "optional caption text",
  "sourceType": "youtube" | "instagram" | "custom",
  "url": "https://youtube.com/watch?v=...",
  "workoutData": { /* optional: edited workout data from preview */ }
}
```

## Testing

Run the test script with real workout examples:

```bash
npm run test:parser
```

This will test 5 real workout URLs and show parsed results.

## Example Output

```json
{
  "url": "https://www.youtube.com/watch?v=4gX0SWUiV9k",
  "parsed": {
    "title": "30 MIN FULL BODY WORKOUT at Home (No Equipment)",
    "duration": 30,
    "exercises": [
      {
        "name": "Jumping Jacks",
        "sets": 1,
        "reps": 0,
        "duration": 45
      },
      {
        "name": "Squats",
        "sets": 3,
        "reps": 15,
        "duration": 0
      }
    ],
    "tags": ["strength", "full body", "no equipment"],
    "equipment": "none",
    "difficulty": "intermediate"
  }
}
```

## Limitations

1. **YouTube Description**: Scraping may not work reliably. Consider using YouTube Data API v3 with API key for production.

2. **Instagram**: Requires caption text to be provided. Instagram API access is restricted.

3. **Complex Formats**: Very unstructured text may not parse perfectly. Users can edit in preview screen.

4. **Language**: Currently optimized for English text.

## Future Improvements

- [ ] GPT-4 API fallback for complex parsing
- [ ] YouTube Data API v3 integration (requires API key)
- [ ] Instagram Basic Display API integration
- [ ] Multi-language support
- [ ] Machine learning from user corrections
