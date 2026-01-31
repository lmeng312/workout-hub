# Exercise Images Feature

## Overview

The workout app now automatically displays exercise images to help guide users through their workouts. This feature combines automatic image lookup with support for user-uploaded custom images.

## Features

### 1. Automatic Image Lookup
- When exercises are created, the system automatically looks up matching images from a curated database
- Supports 50+ common exercises including:
  - **Chest**: Push-ups, Bench Press, Chest Fly
  - **Back**: Pull-ups, Deadlifts, Rows
  - **Legs**: Squats, Lunges, Leg Press
  - **Shoulders**: Shoulder Press, Lateral Raises
  - **Arms**: Bicep Curls, Tricep Extensions
  - **Core**: Planks, Crunches, Russian Twists
  - **Cardio**: Burpees, Jumping Jacks, High Knees

### 2. Smart Matching
- Case-insensitive matching
- Handles variations (e.g., "push up", "pushup", "push-up")
- Partial matching for compound exercise names

### 3. User Upload Support (Future Enhancement)
- Schema supports custom user-uploaded images
- `imageSource` field tracks whether image is auto-generated or user-uploaded
- User-uploaded images are never overridden by automatic lookup

## Database Schema Changes

### Exercise Schema Updates

```javascript
{
  name: String,
  sets: [...],
  notes: String,
  order: Number,
  
  // NEW FIELDS
  image: String,              // URL to exercise image/GIF
  imageSource: String,        // 'auto', 'user', or 'none'
  targetMuscles: [String],    // e.g., ['chest', 'triceps']
  equipment: String           // e.g., 'barbell', 'dumbbell', 'bodyweight'
}
```

## Backend Implementation

### New Utility: `exerciseImageLookup.js`

Located at: `/backend/utils/exerciseImageLookup.js`

**Key Functions:**
- `lookupExerciseImage(exerciseName)` - Returns image URL for an exercise
- `enrichExerciseWithImage(exercise)` - Adds image to a single exercise
- `enrichExercisesWithImages(exercises)` - Adds images to multiple exercises

**Usage Example:**
```javascript
const { enrichExercisesWithImages } = require('../utils/exerciseImageLookup');

const exercises = [
  { name: 'Push Up', sets: [...] },
  { name: 'Squat', sets: [...] }
];

const enrichedExercises = enrichExercisesWithImages(exercises);
// Now each exercise has an image URL if available
```

### Updated Routes

The following routes now automatically enrich exercises with images:
- `POST /workouts` - Create workout
- `PUT /workouts/:id` - Update workout
- `POST /workouts/parse` - Parse workout from text/URL

## Frontend Display

### 1. Workout Detail Screen
- Shows 60x60px exercise thumbnails next to exercise names
- Images display in a rounded container
- Gracefully handles missing images

### 2. Workout Session Screen
- **Current Exercise**: Large 200px height image for the active exercise
- **Exercise List**: 50x50px thumbnails in the scrollable list
- Images help users quickly identify exercises during workouts

### 3. Image Display Features
- Automatic aspect ratio handling
- Loading states with gray background
- Rounded corners for modern UI
- Responsive sizing

## Image Sources

Currently using the free-exercise-db repository on GitHub:
- Repository: `yuhonas/free-exercise-db`
- Format: High-quality JPG images
- License: Free to use
- Coverage: 100+ exercises

**Example URL:**
```
https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/push-up/images/0.jpg
```

## Future Enhancements

### 1. User Image Upload
```javascript
// Add to CreateWorkoutScreen/EditWorkoutScreen
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });
  
  if (!result.canceled) {
    // Upload to cloud storage (AWS S3, Cloudinary, etc.)
    // Update exercise with image URL and imageSource: 'user'
  }
};
```

### 2. Exercise Database API Integration
Consider integrating with:
- **ExerciseDB API** (RapidAPI) - 1300+ exercises with images and GIFs
- **WGER Workout Manager API** - Open source exercise database
- **Nutritionix Exercise API** - Exercise data with images

### 3. GIF Support
- Animated GIFs showing proper form
- Toggle between static image and animated GIF
- Bandwidth-conscious loading

### 4. Video Demonstrations
- Link to YouTube form videos
- Embedded video player in exercise detail
- Community-contributed form tips

## Adding New Exercises to the Lookup

To add new exercises to the automatic lookup system:

1. Open `/backend/utils/exerciseImageLookup.js`
2. Add to the `exerciseImageMap` object:

```javascript
const exerciseImageMap = {
  // ... existing exercises
  'your exercise name': 'https://url-to-image.jpg',
  'alternative name': 'https://url-to-image.jpg',
};
```

3. Use lowercase for consistency
4. Add multiple variations for better matching

## Testing

### Test Automatic Lookup
1. Create a new workout
2. Add exercises with common names (e.g., "Push Up", "Squat")
3. Save the workout
4. View workout details - images should appear

### Test Missing Images
1. Add an exercise with an uncommon name
2. System should gracefully handle missing images
3. No errors should occur

### Test During Workout
1. Start a workout session
2. Verify large image appears for current exercise
3. Verify thumbnails appear in exercise list
4. Check image quality and loading performance

## Performance Considerations

- Images are loaded on-demand (not preloaded)
- Using external CDN (GitHub) for fast delivery
- Images are cached by the browser/React Native
- Fallback to no-image state if loading fails

## Accessibility

- Images are decorative, not required for functionality
- Exercise names are always visible
- Screen readers can skip images
- High contrast between text and background

## Troubleshooting

### Images Not Showing
1. Check network connectivity
2. Verify image URLs are accessible
3. Check console for loading errors
4. Ensure exercise names match lookup map

### Performance Issues
1. Consider image compression
2. Implement lazy loading
3. Add image caching layer
4. Use thumbnail sizes appropriately

## Related Files

**Backend:**
- `/backend/models/Workout.js` - Exercise schema
- `/backend/utils/exerciseImageLookup.js` - Image lookup utility
- `/backend/routes/workouts.js` - Workout routes with image enrichment

**Frontend:**
- `/mobile/screens/WorkoutDetailScreen.js` - Exercise images in detail view
- `/mobile/screens/WorkoutSessionScreen.js` - Exercise images during workout
- `/mobile/screens/CreateWorkoutScreen.js` - (Future) Image upload
- `/mobile/screens/EditWorkoutScreen.js` - (Future) Image editing

## Summary

This feature significantly improves the user experience by providing visual guidance for exercises. The automatic lookup system makes it seamless for users, while the architecture supports future enhancements like user uploads and video demonstrations.
