/**
 * Exercise Image Lookup Utility
 * 
 * This utility provides exercise images from a curated database.
 * It uses a simple mapping system to match exercise names to image URLs.
 * 
 * Images are sourced from free exercise databases and icon libraries.
 */

// Common exercise mappings to image URLs
// Using placeholder service for now - can be replaced with actual exercise image API
const exerciseImageMap = {
  // Chest exercises
  'push up': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/push-up/images/0.jpg',
  'pushup': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/push-up/images/0.jpg',
  'push-up': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/push-up/images/0.jpg',
  'bench press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell-bench-press/images/0.jpg',
  'chest press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell-bench-press/images/0.jpg',
  'dumbbell press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell-bench-press/images/0.jpg',
  'chest fly': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell-fly/images/0.jpg',
  'dumbbell fly': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell-fly/images/0.jpg',
  
  // Back exercises
  'pull up': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/pull-up/images/0.jpg',
  'pullup': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/pull-up/images/0.jpg',
  'pull-up': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/pull-up/images/0.jpg',
  'chin up': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/chin-up/images/0.jpg',
  'chinup': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/chin-up/images/0.jpg',
  'deadlift': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell-deadlift/images/0.jpg',
  'barbell row': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell-bent-over-row/images/0.jpg',
  'bent over row': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell-bent-over-row/images/0.jpg',
  'dumbbell row': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell-row/images/0.jpg',
  'lat pulldown': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/cable-lat-pulldown/images/0.jpg',
  
  // Leg exercises
  'squat': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell-squat/images/0.jpg',
  'back squat': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell-squat/images/0.jpg',
  'front squat': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell-front-squat/images/0.jpg',
  'goblet squat': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell-goblet-squat/images/0.jpg',
  'lunge': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell-lunge/images/0.jpg',
  'leg press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/leg-press/images/0.jpg',
  'leg curl': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/leg-curl/images/0.jpg',
  'leg extension': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/leg-extension/images/0.jpg',
  'calf raise': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/calf-raise/images/0.jpg',
  
  // Shoulder exercises
  'shoulder press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell-shoulder-press/images/0.jpg',
  'overhead press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell-overhead-press/images/0.jpg',
  'military press': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/barbell-overhead-press/images/0.jpg',
  'lateral raise': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell-lateral-raise/images/0.jpg',
  'front raise': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell-front-raise/images/0.jpg',
  'rear delt fly': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell-rear-delt-fly/images/0.jpg',
  
  // Arm exercises
  'bicep curl': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell-bicep-curl/images/0.jpg',
  'biceps curl': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell-bicep-curl/images/0.jpg',
  'hammer curl': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell-hammer-curl/images/0.jpg',
  'tricep extension': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell-tricep-extension/images/0.jpg',
  'triceps extension': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/dumbbell-tricep-extension/images/0.jpg',
  'tricep dip': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/tricep-dip/images/0.jpg',
  'triceps dip': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/tricep-dip/images/0.jpg',
  
  // Core exercises
  'plank': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/plank/images/0.jpg',
  'crunch': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/crunch/images/0.jpg',
  'sit up': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/sit-up/images/0.jpg',
  'situp': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/sit-up/images/0.jpg',
  'russian twist': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/russian-twist/images/0.jpg',
  'leg raise': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/leg-raise/images/0.jpg',
  'mountain climber': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/mountain-climber/images/0.jpg',
  
  // Cardio
  'burpee': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/burpee/images/0.jpg',
  'jumping jack': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/jumping-jack/images/0.jpg',
  'high knees': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/high-knees/images/0.jpg',
  'jump rope': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/jump-rope/images/0.jpg',
  'box jump': 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/box-jump/images/0.jpg',
};

/**
 * Looks up an exercise image based on the exercise name
 * @param {string} exerciseName - The name of the exercise
 * @returns {string|null} - URL to the exercise image or null if not found
 */
function lookupExerciseImage(exerciseName) {
  if (!exerciseName) return null;
  
  // Normalize the exercise name
  const normalized = exerciseName.toLowerCase().trim();
  
  // Direct match
  if (exerciseImageMap[normalized]) {
    return exerciseImageMap[normalized];
  }
  
  // Partial match - check if any key is contained in the exercise name
  for (const [key, url] of Object.entries(exerciseImageMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return url;
    }
  }
  
  return null;
}

/**
 * Enriches an exercise object with an image URL if available
 * @param {Object} exercise - Exercise object with at least a 'name' field
 * @returns {Object} - Exercise object with image field added
 */
function enrichExerciseWithImage(exercise) {
  if (!exercise || !exercise.name) return exercise;
  
  // Don't override user-uploaded images
  if (exercise.imageSource === 'user' && exercise.image) {
    return exercise;
  }
  
  const imageUrl = lookupExerciseImage(exercise.name);
  
  return {
    ...exercise,
    image: imageUrl || exercise.image || '',
    imageSource: imageUrl ? 'auto' : (exercise.imageSource || 'none')
  };
}

/**
 * Enriches multiple exercises with images
 * @param {Array} exercises - Array of exercise objects
 * @returns {Array} - Array of exercises with images added
 */
function enrichExercisesWithImages(exercises) {
  if (!Array.isArray(exercises)) return exercises;
  return exercises.map(enrichExerciseWithImage);
}

module.exports = {
  lookupExerciseImage,
  enrichExerciseWithImage,
  enrichExercisesWithImages,
  exerciseImageMap
};
