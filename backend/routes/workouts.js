const express = require('express');
const Workout = require('../models/Workout');
const auth = require('../middleware/auth');
const { parseWorkoutFromText, parseYouTubeWorkout, parseInstagramWorkout } = require('../utils/workoutParser');
const { enrichExercisesWithImages } = require('../utils/exerciseImageLookup');

const router = express.Router();

// Helper: add isSaved and likedBy metadata to workout objects
function addWorkoutMetadata(workouts, userId) {
  const userIdStr = userId.toString();
  return workouts.map(workout => {
    const w = workout.toObject ? workout.toObject() : workout;
    return {
      ...w,
      isSaved: (w.savedBy || []).some(id => id.toString() === userIdStr),
      likedBy: w.likedBy || [],
    };
  });
}

// Helper: find workout by id only if user has visibility (public, creator, or savedBy)
async function findVisibleWorkout(workoutId, userId) {
  return Workout.findOne({
    _id: workoutId,
    $or: [
      { isPublic: true },
      { creator: userId },
      { savedBy: userId }
    ]
  });
}

// Get all workouts (public + user's own)
router.get('/', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({
      $or: [
        { isPublic: true },
        { creator: req.user._id }
      ]
    })
    .populate('creator', 'username displayName profilePicture')
    .sort({ createdAt: -1 });

    res.json(addWorkoutMetadata(workouts, req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's workout library
router.get('/library', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({
      $or: [
        { creator: req.user._id },
        { savedBy: req.user._id }
      ]
    })
    .populate('creator', 'username displayName profilePicture')
    .sort({ createdAt: -1 });

    res.json(addWorkoutMetadata(workouts, req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get count of workouts completed by the current user (must be before GET /:id)
router.get('/stats/completed', auth, async (req, res) => {
  try {
    const count = await Workout.countDocuments({
      'completedBy.user': req.user._id,
    });
    res.json({ completedCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single workout
router.get('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      $or: [
        { isPublic: true },
        { creator: req.user._id },
        { savedBy: req.user._id }
      ]
    }).populate('creator', 'username displayName profilePicture');

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json(addWorkoutMetadata([workout], req.user._id)[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Preview workout parsing (doesn't save)
router.post('/parse/preview', auth, async (req, res) => {
  try {
    const { text, sourceType, url } = req.body;

    let parsedWorkout;
    if (sourceType === 'youtube' && url) {
      parsedWorkout = await parseYouTubeWorkout(url, text || '');
    } else if (sourceType === 'instagram' && url) {
      parsedWorkout = await parseInstagramWorkout(url, text || '');
    } else {
      parsedWorkout = parseWorkoutFromText(text || '', sourceType || 'custom');
    }

    res.json({
      success: true,
      workout: parsedWorkout,
      exerciseCount: parsedWorkout.exercises.length,
      message: `Found ${parsedWorkout.exercises.length} exercises. Review and edit if needed before saving.`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message,
      workout: null
    });
  }
});

// Create workout from text (YouTube/Instagram)
router.post('/parse', auth, async (req, res) => {
  try {
    const { text, sourceType, url, workoutData } = req.body;

    // If workoutData is provided, use it (user edited the preview)
    let parsedWorkout;
    if (workoutData) {
      parsedWorkout = workoutData;
    } else {
      // Otherwise, parse from text/URL
      if (sourceType === 'youtube' && url) {
        parsedWorkout = await parseYouTubeWorkout(url, text || '');
      } else if (sourceType === 'instagram' && url) {
        parsedWorkout = await parseInstagramWorkout(url, text || '');
      } else {
        parsedWorkout = parseWorkoutFromText(text || '', sourceType || 'custom');
      }
    }

    // Enrich exercises with images
    if (parsedWorkout.exercises && parsedWorkout.exercises.length > 0) {
      parsedWorkout.exercises = enrichExercisesWithImages(parsedWorkout.exercises);
    }

    const workout = new Workout({
      ...parsedWorkout,
      creator: req.user._id,
      source: {
        type: sourceType || 'custom',
        url: url || '',
        originalText: text || ''
      }
    });

    await workout.save();
    await workout.populate('creator', 'username displayName profilePicture');

    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create custom workout
router.post('/', auth, async (req, res) => {
  try {
    // Enrich exercises with images if not already provided
    const workoutData = { ...req.body };
    if (workoutData.exercises && workoutData.exercises.length > 0) {
      workoutData.exercises = enrichExercisesWithImages(workoutData.exercises);
    }

    const workout = new Workout({
      ...workoutData,
      creator: req.user._id
    });

    await workout.save();
    await workout.populate('creator', 'username displayName profilePicture');

    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update workout
router.put('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      creator: req.user._id
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Enrich exercises with images if not already provided
    const updateData = { ...req.body };
    if (updateData.exercises && updateData.exercises.length > 0) {
      updateData.exercises = enrichExercisesWithImages(updateData.exercises);
    }

    Object.assign(workout, updateData);
    await workout.save();
    await workout.populate('creator', 'username displayName profilePicture');

    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete workout
router.delete('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      creator: req.user._id
    });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    await workout.deleteOne();
    res.json({ message: 'Workout deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark workout as completed
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const workout = await findVisibleWorkout(req.params.id, req.user._id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Remove existing completion if any
    workout.completedBy = workout.completedBy.filter(
      completion => completion.user.toString() !== req.user._id.toString()
    );

    // Add new completion (durationSeconds = actual time in seconds from WorkoutSessionScreen)
    const durationSeconds = req.body.durationSeconds != null ? Math.round(Number(req.body.durationSeconds)) : 0;
    workout.completedBy.push({
      user: req.user._id,
      completedAt: new Date(),
      durationSeconds: durationSeconds >= 0 ? durationSeconds : 0
    });

    await workout.save();
    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save workout to library
router.post('/:id/save', auth, async (req, res) => {
  try {
    const workout = await findVisibleWorkout(req.params.id, req.user._id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    if (!workout.savedBy.includes(req.user._id)) {
      workout.savedBy.push(req.user._id);
      await workout.save();
    }

    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unsave workout
router.post('/:id/unsave', auth, async (req, res) => {
  try {
    const workout = await findVisibleWorkout(req.params.id, req.user._id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    workout.savedBy = workout.savedBy.filter(
      userId => userId.toString() !== req.user._id.toString()
    );
    await workout.save();

    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Refresh exercise images for a workout (useful for existing workouts)
router.post('/:id/refresh-images', auth, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Only allow creator to refresh images
    if (workout.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this workout' });
    }

    // Enrich exercises with images
    if (workout.exercises && workout.exercises.length > 0) {
      workout.exercises = enrichExercisesWithImages(workout.exercises);
      await workout.save();
    }

    res.json({ 
      message: 'Images refreshed successfully',
      workout: workout
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like workout
router.post('/:id/like', auth, async (req, res) => {
  try {
    const workout = await findVisibleWorkout(req.params.id, req.user._id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    if (!workout.likedBy.includes(req.user._id)) {
      workout.likedBy.push(req.user._id);
      await workout.save();
    }

    res.json({ message: 'Workout liked', likesCount: workout.likedBy.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unlike workout
router.post('/:id/unlike', auth, async (req, res) => {
  try {
    const workout = await findVisibleWorkout(req.params.id, req.user._id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    workout.likedBy = workout.likedBy.filter(
      userId => userId.toString() !== req.user._id.toString()
    );
    await workout.save();

    res.json({ message: 'Workout unliked', likesCount: workout.likedBy.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Duplicate workout
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalWorkout = await findVisibleWorkout(req.params.id, req.user._id);
    if (!originalWorkout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Create a new workout with the same data but new creator
    const duplicatedWorkout = new Workout({
      title: `${originalWorkout.title} (Copy)`,
      description: originalWorkout.description,
      exercises: originalWorkout.exercises,
      tags: originalWorkout.tags,
      estimatedDuration: originalWorkout.estimatedDuration,
      difficulty: originalWorkout.difficulty,
      creator: req.user._id,
      isPublic: false, // Make copies private by default
      source: {
        type: 'custom',
        url: '',
        originalText: `Duplicated from workout by ${originalWorkout.creator}`
      }
    });

    await duplicatedWorkout.save();
    await duplicatedWorkout.populate('creator', 'username displayName profilePicture');

    const workoutWithMetadata = addWorkoutMetadata([duplicatedWorkout], req.user._id)[0];
    res.status(201).json({
      message: 'Workout duplicated successfully',
      workout: workoutWithMetadata
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
