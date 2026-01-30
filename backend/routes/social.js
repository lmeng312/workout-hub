const express = require('express');
const User = require('../models/User');
const Workout = require('../models/Workout');
const auth = require('../middleware/auth');

const router = express.Router();

// Follow user
router.post('/follow/:userId', auth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user._id);

    if (userToFollow._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Add to following
    if (!currentUser.following.includes(userToFollow._id)) {
      currentUser.following.push(userToFollow._id);
      await currentUser.save();
    }

    // Add to followers
    if (!userToFollow.followers.includes(currentUser._id)) {
      userToFollow.followers.push(currentUser._id);
      await userToFollow.save();
    }

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unfollow user
router.post('/unfollow/:userId', auth, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.userId);
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user._id);

    // Remove from following
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userToUnfollow._id.toString()
    );
    await currentUser.save();

    // Remove from followers
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUser._id.toString()
    );
    await userToUnfollow.save();

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get feed (workouts from followed users + their completions)
router.get('/feed', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get workouts created by followed users
    const createdWorkouts = await Workout.find({
      creator: { $in: user.following },
      isPublic: true
    })
    .populate('creator', 'username displayName profilePicture')
    .sort({ createdAt: -1 })
    .limit(25)
    .lean();

    // Get workouts completed by followed users
    const completedWorkouts = await Workout.find({
      'completedBy.user': { $in: user.following },
      isPublic: true
    })
    .populate('creator', 'username displayName profilePicture')
    .populate('completedBy.user', 'username displayName profilePicture')
    .sort({ 'completedBy.completedAt': -1 })
    .limit(25)
    .lean();

    // Format activities
    const createdActivities = createdWorkouts.map(workout => ({
      type: 'created',
      workout: workout,
      user: workout.creator,
      timestamp: workout.createdAt,
      _id: `created_${workout._id}`
    }));

    const completedActivities = [];
    completedWorkouts.forEach(workout => {
      workout.completedBy.forEach(completion => {
        if (user.following.some(id => id.toString() === completion.user._id.toString())) {
          completedActivities.push({
            type: 'completed',
            workout: workout,
            user: completion.user,
            timestamp: completion.completedAt,
            _id: `completed_${workout._id}_${completion.user._id}`
          });
        }
      });
    });

    // Combine and sort by timestamp
    const allActivities = [...createdActivities, ...completedActivities]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50);

    res.json(allActivities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
