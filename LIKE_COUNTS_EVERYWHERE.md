# Like Counts Across All Screens

## Overview

Like counts are now visible across all screens in the app - Feed, Library, Home (Discover), and Workout Detail screens. This provides consistent social feedback throughout the entire user experience.

## Implementation

### Where Like Counts Appear

#### 1. **Feed Screen**
- Shows in action bar with heart icon
- Displays number next to heart when there are likes
- Heart fills red when user has liked the workout
- Updates instantly when liking/unliking

#### 2. **Home Screen (Discover)**
- Shows in metadata row with red heart icon
- Format: ❤️ [number]
- Only appears when workout has 1+ likes
- Color: Red (#ef4444) for emphasis

#### 3. **Library Screen**
- Shows in metadata row with red heart icon
- Appears alongside exercise count and creator info
- Format: ❤️ [number]
- Only displays when there are likes

#### 4. **Workout Detail Screen**
- New "Activity" stats section
- Shows likes, completions, and saves in a grid
- Displays:
  - ❤️ **Likes** - Number of users who liked
  - ✓ **Completed** - Number of completions
  - 🔖 **Saved** - Number of users who saved
- Only appears if workout has activity

## Backend Changes

### Updated Endpoints

All workout list endpoints now include `likedBy` array:

```javascript
// GET /workouts (Home/Discover)
// GET /workouts/library (Library)
// Response includes:
{
  ...workout,
  likedBy: [userId1, userId2, ...],
  isFavorited: true/false
}
```

### Feed Endpoint
Already included `likedBy` in feed response:
```javascript
// GET /social/feed
{
  workout: {
    ...workoutData,
    likedBy: [userId1, userId2, ...],
    isFavorited: true/false
  }
}
```

## Frontend Changes

### HomeScreen.js
- Added like count display in metadata row
- Shows red heart icon + count
- Styled text in red with bold weight
- Only renders when `likedBy` array has items

### LibraryScreen.js
- Added like count display in metadata row
- Positioned between exercise count and creator
- Red heart icon + count
- Conditional rendering based on likes

### WorkoutDetailScreen.js
- Added new "Activity" stats section
- Grid layout with 3 stats: Likes, Completed, Saved
- Shows icons, numbers, and labels
- Section only appears if workout has activity
- Positioned after tags, before action buttons

### FeedScreen.js
- Already implemented with redesign
- Like count in action bar
- Interactive like button

## Visual Design

### Color Scheme
- **Like Icon**: Red (`#ef4444`)
- **Like Count**: Red (`#ef4444`) with bold weight
- **Favorite (Star)**: Orange (`#f59e0b`) - different from likes
- **Completed**: Green (`#22c55e`)
- **Saved**: Green (`#22c55e`)

### Typography
- **Count Numbers**: 12px (metadata), 20px (detail stats)
- **Weight**: 600 (semi-bold)
- **Labels**: 12px, gray, medium weight

## Terminology Clarification

The app now has three distinct social features:

1. **Like** ❤️ (Red)
   - Social engagement
   - Anyone can like any public workout
   - Shown as count everywhere
   - Primary social metric

2. **Favorite** ⭐ (Orange/Yellow)
   - Personal bookmark/preference
   - Marks workouts you especially love
   - Private to you
   - Shows as "Favorited" badge

3. **Save** 🔖 (Green)
   - Adds workout to your library
   - Practical organizational tool
   - Allows quick access later
   - Shows as "Saved" badge

## User Experience Flow

### Seeing Like Counts

1. **Browse Feed**
   - See likes on all workouts
   - Quick visual indicator of popularity
   - Like button right there to engage

2. **Discover Workouts (Home)**
   - Browse all public workouts
   - Like counts help identify popular workouts
   - Find trending content

3. **View Library**
   - See how your workouts are performing
   - Track engagement on workouts you've saved
   - Gauge workout popularity

4. **Workout Details**
   - Complete activity breakdown
   - See likes, completions, and saves
   - Understand workout's full impact

### Liking Workouts

1. **From Feed**: Tap heart in action bar
2. **From Detail**: Use Favorite button (different action)
3. **Quick Like**: Available right from feed cards
4. **See Results**: Count updates immediately

## Data Flow

```
User likes workout in Feed
  ↓
POST /workouts/:id/like
  ↓
Update workout.likedBy array
  ↓
Return updated count
  ↓
Update UI (optimistic)
  ↓
Like count appears across all screens
```

## Testing

### Verify Like Counts Display

1. **Create Test Workout**
   - Make it public
   - Have another user like it

2. **Check Feed**
   - ✓ Like count appears in action bar
   - ✓ Heart fills when liked
   - ✓ Count increments

3. **Check Home Screen**
   - ✓ Like count appears in metadata
   - ✓ Red heart icon visible
   - ✓ Proper formatting

4. **Check Library**
   - ✓ Like count shows for your workouts
   - ✓ Positioned correctly
   - ✓ Updates on refresh

5. **Check Detail Screen**
   - ✓ Activity stats section appears
   - ✓ Shows likes, completions, saves
   - ✓ Grid layout proper
   - ✓ Only appears with activity

### Edge Cases

- ✓ Zero likes: No like indicator shown (except feed action bar)
- ✓ One like: Shows "1" not "1 likes"
- ✓ Private workouts: Likes still count
- ✓ Your own workouts: Can see like counts

## Performance Considerations

- Like counts included in workout queries (no extra query)
- Minimal performance impact
- Array length calculated on client side
- Backend sends full `likedBy` array

## Future Enhancements

### Potential Features
1. **Like List**: See who liked a workout
2. **Like Notifications**: Alert when someone likes your workout
3. **Trending**: Sort by most liked workouts
4. **Time-based**: Most liked this week/month
5. **Like Analytics**: Track likes over time
6. **Comment Integration**: Combine with future comments

## Migration Notes

- No migration needed for existing workouts
- `likedBy` defaults to empty array
- Counts start at 0 automatically
- Backwards compatible

## Related Files

**Backend:**
- `/backend/models/Workout.js` - likedBy field in schema
- `/backend/routes/workouts.js` - Updated GET endpoints to include likedBy
- `/backend/routes/social.js` - Feed endpoint with likes

**Frontend:**
- `/mobile/screens/FeedScreen.js` - Like button with count
- `/mobile/screens/HomeScreen.js` - Like count in metadata
- `/mobile/screens/LibraryScreen.js` - Like count in metadata
- `/mobile/screens/WorkoutDetailScreen.js` - Activity stats section

## Summary

Like counts are now consistently displayed across the entire app, providing valuable social proof and engagement metrics. Users can see how popular workouts are before trying them, and creators can see how their workouts are performing. The implementation maintains clean UI design while providing this important social feedback.
