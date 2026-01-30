const express = require('express');
const User = require('../models/User');
const Workout = require('../models/Workout');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username displayName profilePicture')
      .populate('following', 'username displayName profilePicture');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's public workouts
    const workouts = await Workout.find({
      creator: user._id,
      isPublic: true
    }).sort({ createdAt: -1 });

    res.json({
      user,
      workouts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search users
router.get('/search/:query', auth, async (req, res) => {
  try {
    const query = req.params.query;
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { displayName: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.user._id }
    })
    .select('username displayName profilePicture')
    .limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
