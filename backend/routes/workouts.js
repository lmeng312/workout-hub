const express = require('express');
const Workout = require('../models/Workout');
const auth = require('../middleware/auth');
const { parseWorkoutFromText, parseYouTubeWorkout, parseInstagramWorkout } = require('../utils/workoutParser');

const router = express.Router();

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

    res.json(workouts);
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

    res.json(workouts);
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

    res.json(workout);
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
    const workout = new Workout({
      ...req.body,
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

    Object.assign(workout, req.body);
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
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Remove existing completion if any
    workout.completedBy = workout.completedBy.filter(
      completion => completion.user.toString() !== req.user._id.toString()
    );

    // Add new completion
    workout.completedBy.push({
      user: req.user._id,
      completedAt: new Date()
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
    const workout = await Workout.findById(req.params.id);
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
    const workout = await Workout.findById(req.params.id);
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

module.exports = router;
