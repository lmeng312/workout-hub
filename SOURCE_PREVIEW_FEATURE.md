# Source Preview Feature ✅

## Overview

Enhanced the original source link feature to include rich visual previews of YouTube videos and Instagram posts when viewing workouts imported from external sources.

## What Was Added

### 1. **Backend Enhancements**

#### Updated Workout Model
Added `source.preview` object to store metadata:
- `thumbnail`: URL to video/post thumbnail image
- `sourceTitle`: Original title from YouTube/Instagram
- `sourceCreator`: Channel name or creator username
- `sourceDuration`: Video duration in seconds (for YouTube)

#### Enhanced Parser
- Updated `fetchYouTubeMetadata()` to fetch video metadata from YouTube Data API v3
- Extracts thumbnail URLs (high quality preferred)
- Gets channel name and video title
- Parses ISO 8601 duration format to seconds
- Falls back to default thumbnail URLs if API unavailable
- Added preview metadata to Instagram parser (placeholder for future API integration)

### 2. **Frontend Components**

#### New SourcePreview Component
Created reusable component with two variants:

**Full Variant** (for detail screens):
- Large thumbnail preview (120x90)
- Video duration badge overlay
- Source title and creator name
- Platform icon and "View on [Platform]" link
- Tappable to open original URL

**Badge Variant** (for card lists):
- Compact badge display
- Platform icon and name
- Small external link indicator
- Fits inline with workout titles

### 3. **UI Integration**

#### WorkoutDetailScreen
- Replaced simple link button with full preview
- Shows thumbnail and rich metadata
- More prominent visual indicator of external source
- Better user experience for finding original content

#### FeedScreen
- Added badge variant next to workout titles
- Shows which workouts are from YouTube/Instagram
- Compact design doesn't clutter the feed
- Quick access to original source

#### LibraryScreen
- Badge variant in workout cards
- Helps identify imported vs custom workouts
- Works alongside "Saved" badge
- Organized badge layout

## Features

### Visual Elements
- **YouTube**: Red branding, logo, video thumbnails
- **Instagram**: Pink/purple branding, logo, placeholder for posts
- **Duration Badge**: Black overlay showing video length (e.g., "15:30" or "45m")
- **Thumbnail Fallback**: Uses YouTube's standard thumbnail URLs if API unavailable

### User Interactions
- Tap any preview or badge to open original URL
- Opens in default browser or native app
- Error handling for invalid/unavailable links
- Visual feedback with platform-specific colors

### Smart Metadata Display
- Shows creator name when available
- Displays source title (may differ from workout title)
- Duration indicator helps users know video length
- Platform icons for quick recognition

## Example Displays

### Full Preview (WorkoutDetailScreen)
```
┌─────────────────────────────────────────┐
│ 🔴 ORIGINAL SOURCE               ↗️     │
├─────────────────────────────────────────┤
│  ┌────────┐  30 MIN FULL BODY HIIT     │
│  │[thumb] │  Fitness Girl              │
│  │  15:30 │  🔴 View on YouTube        │
│  └────────┘                             │
└─────────────────────────────────────────┘
```

### Badge (FeedScreen / LibraryScreen)
```
Workout Title                    🔴 YouTube ↗️
```

## Technical Details

### Backend API Structure
```javascript
source: {
  type: 'youtube',
  url: 'https://youtube.com/watch?v=...',
  originalText: '...',
  preview: {
    thumbnail: 'https://i.ytimg.com/vi/.../hqdefault.jpg',
    sourceTitle: '30 MIN FULL BODY HIIT',
    sourceCreator: 'Fitness Girl',
    sourceDuration: 1830  // seconds
  }
}
```

### Thumbnail URLs
- **YouTube**: 
  - API provides multiple resolutions (high, medium, default)
  - Fallback: `https://img.youtube.com/vi/{videoId}/hqdefault.jpg`
- **Instagram**: 
  - Requires authentication for thumbnail access
  - Currently shows placeholder icon

### Duration Format
- Parses ISO 8601 (PT1H2M10S → 3730 seconds)
- Displays as MM:SS for < 60 mins
- Displays as H:MM:SS for >= 60 mins
- Shows as "45m" when no seconds component

## Benefits

1. **Better Discovery**: Users can preview the original content before opening
2. **Visual Appeal**: Thumbnails make the app more engaging
3. **Context**: Shows creator and title for attribution
4. **Quick Recognition**: Easy to identify YouTube vs Instagram vs custom workouts
5. **Time Awareness**: Duration helps users plan viewing time
6. **Professional Look**: Matches expectations from modern fitness apps

## Future Enhancements

Potential improvements:
- Instagram thumbnail fetching (requires API authentication)
- Video player embed (play inline without leaving app)
- More platforms (TikTok, Vimeo, etc.)
- Cached thumbnails for offline viewing
- View count and engagement metrics
- Related videos from same creator
- Workout preview video clips

## Testing

To test the feature:

1. **Create a workout from YouTube**:
   - Go to CreateWorkout screen
   - Paste a YouTube URL
   - Parser will fetch metadata automatically

2. **View in Library**:
   - See YouTube badge next to workout title
   - Badge shows red YouTube icon

3. **Open Workout Details**:
   - See full preview with thumbnail
   - Tap to open original video
   - View creator name and duration

4. **Check Feed**:
   - Shared workouts show source badges
   - Easy to identify imported workouts

## Dependencies

- **YouTube Data API v3**: For fetching metadata (requires API key)
- **Expo Linking**: For opening URLs in browser/app
- **React Native Image**: For displaying thumbnails
- **Ionicons**: For platform icons

## Configuration

Ensure `YOUTUBE_API_KEY` is set in backend `.env` file for full functionality. The feature gracefully degrades if API is unavailable:
- Uses fallback thumbnail URLs
- Shows title from oEmbed
- Still allows opening original URL

## Compatibility

- Works with existing workouts (preview data optional)
- Backward compatible (doesn't break old workouts without preview)
- Handles missing metadata gracefully
- Falls back to simple link if needed

---

✅ **Feature Complete**: All screens updated with source preview functionality
