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

// Get feed (workouts from followed users + their completions + own activities)
router.get('/feed', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    console.log(`📱 Feed request from user: ${user.username} (${user._id})`);
    console.log(`👥 Following ${user.following.length} users`);
    
    // Include both followed users AND the current user
    const feedUserIds = [...user.following, req.user._id];
    
    // Get workouts created by followed users AND current user
    const createdWorkouts = await Workout.find({
      $or: [
        { creator: { $in: user.following }, isPublic: true }, // Friends' public workouts
        { creator: req.user._id } // All of current user's workouts (public or private)
      ]
    })
    .populate('creator', 'username displayName profilePicture')
    .sort({ createdAt: -1 })
    .limit(25)
    .lean();
    
    console.log(`📝 Found ${createdWorkouts.length} created workouts`);

    // Get workouts completed by followed users AND current user
    const completedWorkouts = await Workout.find({
      $or: [
        { 'completedBy.user': { $in: user.following }, isPublic: true }, // Friends' public completions
        { 'completedBy.user': req.user._id } // All of current user's completions
      ]
    })
    .populate('creator', 'username displayName profilePicture')
    .populate('completedBy.user', 'username displayName profilePicture')
    .sort({ 'completedBy.completedAt': -1 })
    .limit(25)
    .lean();
    
    console.log(`✅ Found ${completedWorkouts.length} completed workouts`);
    
    // Count user's own completions
    let userCompletionCount = 0;
    completedWorkouts.forEach(w => {
      w.completedBy.forEach(c => {
        if (c.user._id.toString() === req.user._id.toString()) {
          userCompletionCount++;
        }
      });
    });
    console.log(`👤 User has ${userCompletionCount} completions in results`);

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
        // Include completions from followed users AND current user
        if (feedUserIds.some(id => id.toString() === completion.user._id.toString())) {
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
    
    console.log(`🎯 Total activities: ${createdActivities.length + completedActivities.length} (${createdActivities.length} created + ${completedActivities.length} completed)`);

    // Add isSaved and likedBy field to all activities
    const userIdStr = req.user._id.toString();
    const activitiesWithMetadata = [...createdActivities, ...completedActivities]
      .map(activity => ({
        ...activity,
        workout: {
          ...activity.workout,
          isSaved: (activity.workout.savedBy || []).some(id => id.toString() === userIdStr),
          likedBy: activity.workout.likedBy || []
        }
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50);

    res.json(activitiesWithMetadata);
  } catch (error) {
    console.error('❌ Feed error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
