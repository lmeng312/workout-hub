# Source Link Feature ✅

> **📢 ENHANCED**: This feature has been upgraded! See [SOURCE_PREVIEW_FEATURE.md](SOURCE_PREVIEW_FEATURE.md) for the new rich preview functionality with thumbnails and metadata.

## What Was Added

Added a reference link button to workout detail screens for workouts parsed from YouTube or Instagram.

## Features

### 1. Visual Display
- Shows YouTube logo (red) for YouTube workouts
- Shows Instagram logo (pink) for Instagram workouts
- Clean, tappable button design
- External link icon indicator

### 2. Functionality
- Tap to open original video/post in browser or app
- Uses React Native's `Linking` API
- Error handling if link can't be opened
- Only shows for YouTube/Instagram sources (not custom workouts)

### 3. Location
Appears in the workout header, right after the description:
- Below creator info
- Below description (if present)
- Above the exercises list

### 4. How It Works

**Backend** (already implemented):
- Workout model stores `source.type` and `source.url`
- Parser automatically saves the URL when parsing YouTube/Instagram

**Frontend** (just added):
- Detects if workout has a source URL
- Displays appropriate icon based on source type
- Opens link when tapped

## Example Display

```
[Workout Title]
Created by: @fitnessgirl

[Description text...]

┌─────────────────────────────────┐
│ 🔴 View on YouTube         ↗️   │
└─────────────────────────────────┘

[Exercises list...]
```

## Test It

1. **Reload mobile app** (shake → Reload)
2. **Open a parsed workout** from your library
3. **Look for the source link** below the description
4. **Tap it** to open the original YouTube video

## Use Cases

- Reference the original video while doing the workout
- Watch exercise form demonstrations
- Check creator's other content
- Share the original source with friends
- Verify workout details

## Future Enhancements

Could add:
- Thumbnail preview from YouTube
- Video embed (play inline)
- Creator attribution link
- Similar workouts from same source
