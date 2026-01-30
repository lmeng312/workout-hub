const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Extract duration from text (e.g., "30 MIN", "20 minute", "45min")
 */
function extractDuration(text) {
  const durationPatterns = [
    /(\d+)\s*(?:min|minute|minutes|mins?)\b/i,
    /(\d+)\s*(?:hr|hour|hours|h)\b/i,
    /(\d+):(\d+)/, // "30:00" format
  ];

  for (const pattern of durationPatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[2]) {
        // "30:00" format
        return parseInt(match[1]) * 60 + parseInt(match[2]);
      }
      return parseInt(match[1]);
    }
  }
  return null;
}

/**
 * Parse time duration (e.g., "30 sec", "0:45", "45s", "1 minute")
 */
function parseTimeDuration(text) {
  const timePatterns = [
    /(\d+)\s*(?:sec|second|seconds|s)\b/i,
    /(\d+):(\d+)/, // "0:45" format
    /(\d+)\s*(?:min|minute|minutes|mins?)\b/i,
  ];

  for (const pattern of timePatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[2]) {
        // "0:45" format
        return parseInt(match[1]) * 60 + parseInt(match[2]);
      }
      const value = parseInt(match[1]);
      if (text.toLowerCase().includes('min')) {
        return value * 60;
      }
      return value;
    }
  }
  return null;
}

/**
 * Parse sets and reps from text
 */
function parseSetsAndReps(text) {
  // Patterns: "3x10", "3 sets of 10", "10 reps x 3 sets", "10-12 reps", "3 x 10"
  const patterns = [
    /(\d+)\s*(?:x|×|sets?)\s*(\d+)/i, // "3x10" or "3 sets 10"
    /(\d+)\s*(?:sets?|rounds?)\s*(?:of|×|x)\s*(\d+)/i, // "3 sets of 10"
    /(\d+)\s*(?:reps?)\s*(?:x|×)\s*(\d+)\s*(?:sets?)/i, // "10 reps x 3 sets"
    /(\d+)-(\d+)\s*(?:reps?)/i, // "10-12 reps"
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const sets = parseInt(match[1]);
      const reps = parseInt(match[2]) || parseInt(match[1]); // For "10-12 reps", use first number
      return { sets, reps };
    }
  }

  // Single number might be reps
  const singleRepMatch = text.match(/(\d+)\s*(?:reps?|times?)\b/i);
  if (singleRepMatch) {
    return { sets: 1, reps: parseInt(singleRepMatch[1]) };
  }

  return null;
}

/**
 * Parse rest period from text
 */
function parseRestPeriod(text) {
  const restPatterns = [
    /rest\s*:?\s*(\d+)\s*(?:sec|second|seconds|s)\b/i,
    /(\d+)\s*(?:sec|second|seconds|s)\s*rest/i,
    /rest\s*:?\s*(\d+)\s*(?:min|minute|minutes)\b/i,
  ];

  for (const pattern of restPatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1]);
      if (text.toLowerCase().includes('min')) {
        return value * 60;
      }
      return value;
    }
  }
  return 60; // Default 60 seconds
}

/**
 * Extract exercise name from line, cleaning up common prefixes
 */
function extractExerciseName(line) {
  // Remove common prefixes: "1. ", "• ", "💪 ", "- ", etc.
  let cleaned = line
    .replace(/^[\d\.\)\-\•\*💪🔥⚡✅]\s*/, '') // Remove numbered/bullet prefixes
    .replace(/^#\w+\s*/, '') // Remove hashtags at start
    .trim();

  // Remove sets/reps/time info from end
  cleaned = cleaned
    .replace(/\s*[\(\[].*?[\)\]]\s*$/, '') // Remove parentheses/brackets at end
    .replace(/\s*[-–]\s*\d+.*$/, '') // Remove " - 30 sec" type suffixes
    .replace(/\s*\d+\s*(?:x|×)\s*\d+.*$/i, '') // Remove "3x10" type suffixes
    .trim();

  return cleaned || line.trim();
}

/**
 * Smart auto-tagging based on keywords
 */
function extractTags(text) {
  const tags = [];
  const textLower = text.toLowerCase();

  // Workout type tags
  const typeKeywords = {
    'hiit': ['hiit', 'high intensity', 'high-intensity'],
    'cardio': ['cardio', 'cardiovascular', 'aerobic'],
    'strength': ['strength', 'weight training', 'resistance'],
    'yoga': ['yoga', 'yogi'],
    'pilates': ['pilates'],
    'stretching': ['stretch', 'stretching', 'flexibility', 'flexible'],
    'mobility': ['mobility', 'mobilization'],
    'calisthenics': ['calisthenics', 'bodyweight'],
  };

  for (const [tag, keywords] of Object.entries(typeKeywords)) {
    if (keywords.some(keyword => textLower.includes(keyword))) {
      tags.push(tag);
    }
  }

  // Body part tags
  const bodyPartKeywords = {
    'full body': ['full body', 'full-body', 'total body', 'whole body'],
    'upper body': ['upper body', 'upper-body', 'upper'],
    'lower body': ['lower body', 'lower-body', 'legs', 'lower'],
    'core': ['core', 'abs', 'abdominal', 'abdominals'],
    'arms': ['arms', 'biceps', 'triceps', 'shoulders'],
    'chest': ['chest', 'pectoral', 'pecs'],
    'back': ['back', 'lats', 'latissimus'],
    'legs': ['legs', 'quads', 'quadriceps', 'hamstrings', 'glutes', 'calves'],
    'hips': ['hip', 'hips', 'hip mobility'],
  };

  for (const [tag, keywords] of Object.entries(bodyPartKeywords)) {
    if (keywords.some(keyword => textLower.includes(keyword))) {
      tags.push(tag);
    }
  }

  // Equipment tags
  const equipmentKeywords = {
    'no equipment': ['no equipment', 'no-equipment', 'bodyweight', 'body weight', 'no weights', 'no weights needed'],
    'dumbbells': ['dumbbell', 'dumbbells', 'db'],
    'weights': ['weights', 'weight training', 'free weights'],
    'resistance bands': ['resistance band', 'resistance bands', 'band'],
    'kettlebells': ['kettlebell', 'kettlebells', 'kb'],
  };

  for (const [tag, keywords] of Object.entries(equipmentKeywords)) {
    if (keywords.some(keyword => textLower.includes(keyword))) {
      tags.push(tag);
    }
  }

  // Difficulty tags
  const difficultyKeywords = {
    'beginner': ['beginner', 'easy', 'basic', 'intro'],
    'advanced': ['advanced', 'expert', 'hard', 'challenging', 'intense'],
  };

  for (const [tag, keywords] of Object.entries(difficultyKeywords)) {
    if (keywords.some(keyword => textLower.includes(keyword))) {
      tags.push(tag);
      break; // Only one difficulty level
    }
  }

  // Extract hashtags
  const hashtagMatches = text.match(/#(\w+)/g);
  if (hashtagMatches) {
    hashtagMatches.forEach(hashtag => {
      const tag = hashtag.slice(1).toLowerCase().replace(/([A-Z])/g, ' $1').trim();
      if (tag.length > 2 && tag.length < 30) {
        tags.push(tag);
      }
    });
  }

  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Extract equipment needed from text
 */
function extractEquipment(text) {
  const textLower = text.toLowerCase();
  
  if (textLower.includes('no equipment') || textLower.includes('bodyweight') || textLower.includes('no weights')) {
    return 'none';
  }
  if (textLower.includes('dumbbell')) return 'dumbbells';
  if (textLower.includes('kettlebell')) return 'kettlebells';
  if (textLower.includes('resistance band')) return 'resistance bands';
  if (textLower.includes('barbell')) return 'barbell';
  if (textLower.includes('weight')) return 'weights';
  
  return 'none';
}

/**
 * Determine difficulty level
 */
function determineDifficulty(text) {
  const textLower = text.toLowerCase();
  
  if (textLower.match(/\b(beginner|easy|basic|intro|starting)\b/)) {
    return 'beginner';
  }
  if (textLower.match(/\b(advanced|expert|hard|challenging|intense|pro)\b/)) {
    return 'advanced';
  }
  return 'intermediate';
}

/**
 * Parse workout from text with improved pattern recognition
 */
function parseWorkoutFromText(text, sourceType = 'custom') {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const workout = {
    title: '',
    description: '',
    exercises: [],
    tags: [],
    difficulty: 'intermediate',
    estimatedDuration: null,
    equipment: 'none'
  };

  // Extract title (first line with "workout" or first short line)
  const titleLine = lines.find(line => 
    line.toLowerCase().includes('workout') || 
    (line.length < 80 && line.length > 5 && !line.match(/^\d/))
  );
  workout.title = titleLine || 'Custom Workout';

  // Extract duration from title
  const duration = extractDuration(workout.title);
  if (duration) {
    workout.estimatedDuration = duration;
  }

  // Extract tags and metadata
  workout.tags = extractTags(text);
  workout.equipment = extractEquipment(text);
  workout.difficulty = determineDifficulty(text);

  // Parse exercises
  let exerciseOrder = 0;
  let currentExercise = null;
  let inExerciseList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();

    // Skip common non-exercise lines
    if (lineLower.match(/^(workout|routine|program|exercise|exercises|circuit|round|rounds|set|sets|rest|break|pause)/i) && 
        line.length < 30 && !lineLower.includes(':')) {
      continue;
    }

    // Detect exercise list start (numbered lists, bullet points, etc.)
    if (line.match(/^[\d\.\)\-\•\*💪🔥⚡✅]/) || line.match(/^[A-Z][a-z]+(?:\s+[a-z]+)*\s*[-–:]/)) {
      inExerciseList = true;
    }

    // Try to parse exercise with sets/reps/time
    const setsReps = parseSetsAndReps(line);
    const timeDuration = parseTimeDuration(line);
    const exerciseName = extractExerciseName(line);

    // Pattern 1: "Exercise Name: 3x10" or "Exercise Name - 30 sec"
    const colonDashMatch = line.match(/^([^:–-]+?)\s*[:–-]\s*(.+)$/);
    if (colonDashMatch) {
      const [, namePart, detailsPart] = colonDashMatch;
      const name = extractExerciseName(namePart);
      
      if (name.length > 2 && name.length < 50) {
        const details = detailsPart.trim();
        const setsRepsFromDetails = parseSetsAndReps(details);
        const timeFromDetails = parseTimeDuration(details);
        const rest = parseRestPeriod(details);

        if (setsRepsFromDetails || timeFromDetails) {
          const sets = setsRepsFromDetails?.sets || 1;
          const reps = setsRepsFromDetails?.reps || 0;
          const duration = timeFromDetails || 0;

          const exerciseSets = [];
          for (let j = 0; j < sets; j++) {
            exerciseSets.push({
              reps: reps,
              weight: 0,
              duration: duration,
              rest: rest
            });
          }

          workout.exercises.push({
            name: name,
            sets: exerciseSets,
            notes: '',
            order: exerciseOrder++
          });
          continue;
        }
      }
    }

    // Pattern 2: "Exercise Name (10 per side)" or "Exercise Name (3x10)"
    const parenMatch = line.match(/^(.+?)\s*\((.+?)\)/);
    if (parenMatch) {
      const [, namePart, detailsPart] = parenMatch;
      const name = extractExerciseName(namePart);
      const setsRepsFromParen = parseSetsAndReps(detailsPart);

      if (name.length > 2 && name.length < 50 && setsRepsFromParen) {
        const { sets, reps } = setsRepsFromParen;
        const exerciseSets = [];
        for (let j = 0; j < sets; j++) {
          exerciseSets.push({
            reps: reps,
            weight: 0,
            duration: 0,
            rest: 60
          });
        }

        workout.exercises.push({
          name: name,
          sets: exerciseSets,
          notes: detailsPart,
          order: exerciseOrder++
        });
        continue;
      }
    }

    // Pattern 3: Timestamp format "0:00 - Exercise Name"
    const timestampMatch = line.match(/^\d+:\d+\s*[-–]\s*(.+)$/);
    if (timestampMatch) {
      const name = extractExerciseName(timestampMatch[1]);
      if (name.length > 2 && name.length < 50) {
        workout.exercises.push({
          name: name,
          sets: [{
            reps: 0,
            weight: 0,
            duration: 0,
            rest: 60
          }],
          notes: '',
          order: exerciseOrder++
        });
        continue;
      }
    }

    // Pattern 4: Simple exercise name with sets/reps on same line
    if (setsReps && exerciseName.length > 2 && exerciseName.length < 50) {
      const { sets, reps } = setsReps;
      const exerciseSets = [];
      for (let j = 0; j < sets; j++) {
        exerciseSets.push({
          reps: reps,
          weight: 0,
          duration: 0,
          rest: 60
        });
      }

      workout.exercises.push({
        name: exerciseName,
        sets: exerciseSets,
        notes: '',
        order: exerciseOrder++
      });
      continue;
    }

    // Pattern 5: Time-based exercise "Exercise Name - 30 sec"
    if (timeDuration && exerciseName.length > 2 && exerciseName.length < 50) {
      workout.exercises.push({
        name: exerciseName,
        sets: [{
          reps: 0,
          weight: 0,
          duration: timeDuration,
          rest: 60
        }],
        notes: '',
        order: exerciseOrder++
      });
      continue;
    }

    // Pattern 6: Simple exercise name (no sets/reps, might be on next line)
    if (inExerciseList && exerciseName.length > 2 && exerciseName.length < 50 && 
        !exerciseName.match(/^\d+$/) && !setsReps && !timeDuration) {
      // Check if next line has sets/reps
      if (i + 1 < lines.length) {
        const nextLineSetsReps = parseSetsAndReps(lines[i + 1]);
        const nextLineTime = parseTimeDuration(lines[i + 1]);
        
        if (nextLineSetsReps || nextLineTime) {
          currentExercise = {
            name: exerciseName,
            sets: [],
            notes: '',
            order: exerciseOrder++
          };
          continue;
        }
      }

      // Just exercise name, create default
      workout.exercises.push({
        name: exerciseName,
        sets: [{
          reps: 10,
          weight: 0,
          duration: 0,
          rest: 60
        }],
        notes: '',
        order: exerciseOrder++
      });
    }

    // If we have a current exercise and this line has sets/reps, add them
    if (currentExercise) {
      const nextSetsReps = parseSetsAndReps(line);
      const nextTime = parseTimeDuration(line);
      
      if (nextSetsReps) {
        const { sets, reps } = nextSetsReps;
        for (let j = 0; j < sets; j++) {
          currentExercise.sets.push({
            reps: reps,
            weight: 0,
            duration: 0,
            rest: 60
          });
        }
        workout.exercises.push(currentExercise);
        currentExercise = null;
      } else if (nextTime) {
        currentExercise.sets.push({
          reps: 0,
          weight: 0,
          duration: nextTime,
          rest: 60
        });
        workout.exercises.push(currentExercise);
        currentExercise = null;
      }
    }
  }

  // Add any remaining current exercise
  if (currentExercise && currentExercise.sets.length > 0) {
    workout.exercises.push(currentExercise);
  }

  // If no exercises found, try keyword extraction
  if (workout.exercises.length === 0) {
    const exerciseKeywords = [
      'squat', 'push-up', 'pushup', 'pull-up', 'pullup', 'deadlift', 'bench press', 
      'curl', 'press', 'row', 'lunge', 'plank', 'burpee', 'jumping jack', 'mountain climber',
      'crunch', 'sit-up', 'situp', 'leg raise', 'hip thrust', 'glute bridge', 'bird dog',
      'downward dog', 'warrior', 'child pose', 'cobra', 'pigeon pose'
    ];
    
    exerciseKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        workout.exercises.push({
          name: keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          sets: [{
            reps: 10,
            weight: 0,
            duration: 0,
            rest: 60
          }],
          notes: '',
          order: workout.exercises.length
        });
      }
    });
  }

  // Extract description (first paragraph after title)
  const descriptionStart = lines.findIndex(line => 
    line.length > 50 && !line.match(/^[\d\.\)\-\•\*💪🔥⚡✅]/)
  );
  if (descriptionStart > 0) {
    workout.description = lines.slice(descriptionStart, descriptionStart + 3).join(' ').substring(0, 500);
  }

  return workout;
}

/**
 * Fetch YouTube video description
 * Note: YouTube Data API v3 requires API key. This uses a fallback scraping method.
 */
async function fetchYouTubeDescription(videoId) {
  try {
    // Method 1: Try to scrape description (may not work due to YouTube's dynamic loading)
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await axios.get(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const description = $('#description').text() || $('#watch-description-text').text();
    
    if (description && description.length > 20) {
      return description;
    }
  } catch (error) {
    console.log('Could not fetch YouTube description via scraping:', error.message);
  }

  // Method 2: Return empty string (user can paste description manually)
  return '';
}

/**
 * Parse workout from YouTube URL
 */
async function parseYouTubeWorkout(url, captionText = '') {
  try {
    // Extract video ID from URL
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (!videoIdMatch) {
      throw new Error('Invalid YouTube URL');
    }

    const videoId = videoIdMatch[1];
    
    // Get title from oEmbed
    let title = 'YouTube Workout';
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const oembedResponse = await axios.get(oembedUrl);
      title = oembedResponse.data.title;
    } catch (error) {
      console.log('Could not fetch YouTube title:', error.message);
    }

    // Try to fetch description
    let description = '';
    try {
      description = await fetchYouTubeDescription(videoId);
    } catch (error) {
      console.log('Could not fetch YouTube description:', error.message);
    }

    // Combine all text sources
    const combinedText = `${title}\n${description}\n${captionText}`;
    
    // Parse the workout
    const workout = parseWorkoutFromText(combinedText, 'youtube');
    workout.title = title;
    workout.source = {
      type: 'youtube',
      url: url,
      originalText: combinedText
    };

    // Extract duration from title if not already set
    if (!workout.estimatedDuration) {
      const duration = extractDuration(title);
      if (duration) {
        workout.estimatedDuration = duration;
      }
    }

    return workout;
  } catch (error) {
    // Fallback: parse just the caption text
    const workout = parseWorkoutFromText(captionText, 'youtube');
    workout.title = workout.title || 'YouTube Workout';
    workout.source = {
      type: 'youtube',
      url: url,
      originalText: captionText
    };
    return workout;
  }
}

/**
 * Parse workout from Instagram URL or caption
 * Note: Instagram requires authentication for API access. This parses from provided caption text.
 */
async function parseInstagramWorkout(url, captionText = '') {
  try {
    // Extract post ID if URL provided
    const postIdMatch = url?.match(/\/p\/([^\/\?]+)/);
    
    // Parse the caption text
    const workout = parseWorkoutFromText(captionText, 'instagram');
    
    // If no title extracted, use default
    if (!workout.title || workout.title === 'Custom Workout') {
      workout.title = 'Instagram Workout';
    }

    workout.source = {
      type: 'instagram',
      url: url || '',
      originalText: captionText
    };

    return workout;
  } catch (error) {
    // Fallback: basic parsing
    const workout = parseWorkoutFromText(captionText, 'instagram');
    workout.title = workout.title || 'Instagram Workout';
    workout.source = {
      type: 'instagram',
      url: url || '',
      originalText: captionText
    };
    return workout;
  }
}

module.exports = {
  parseWorkoutFromText,
  parseYouTubeWorkout,
  parseInstagramWorkout,
  extractTags,
  extractDuration
};
