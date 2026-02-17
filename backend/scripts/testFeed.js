// Test script to verify feed endpoint
// Run: node scripts/testFeed.js

const mongoose = require('mongoose');
const User = require('../models/User');
const Workout = require('../models/Workout');

require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set. Add it to backend/.env');
  process.exit(1);
}

async function testFeed() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    // Get a user (you'll need to replace with actual user ID)
    const users = await User.find().limit(1);
    if (users.length === 0) {
      console.log('❌ No users found');
      process.exit(1);
    }
    
    const user = users[0];
    console.log(`Testing feed for user: ${user.username} (${user._id})`);
    console.log(`Following: ${user.following.length} users\n`);

    // Test 1: Check workouts created by user
    const userWorkouts = await Workout.find({ creator: user._id });
    console.log(`User's workouts: ${userWorkouts.length}`);
    userWorkouts.forEach(w => {
      console.log(`  - "${w.title}" (public: ${w.isPublic})`);
    });

    // Test 2: Check completed workouts
    const completedWorkouts = await Workout.find({
      'completedBy.user': user._id
    });
    console.log(`\nWorkouts completed by user: ${completedWorkouts.length}`);
    completedWorkouts.forEach(w => {
      const userCompletion = w.completedBy.find(c => c.user.toString() === user._id.toString());
      console.log(`  - "${w.title}" completed at ${userCompletion.completedAt}`);
    });

    // Test 3: Run feed query
    const feedUserIds = [...user.following, user._id];
    
    const createdWorkouts = await Workout.find({
      $or: [
        { creator: { $in: user.following }, isPublic: true },
        { creator: user._id }
      ]
    }).populate('creator', 'username');
    
    console.log(`\nFeed created workouts: ${createdWorkouts.length}`);
    createdWorkouts.forEach(w => {
      console.log(`  - "${w.title}" by ${w.creator.username}`);
    });

    const completedWorkoutsInFeed = await Workout.find({
      $or: [
        { 'completedBy.user': { $in: user.following }, isPublic: true },
        { 'completedBy.user': user._id }
      ]
    }).populate('creator', 'username');
    
    console.log(`\nFeed completed workouts: ${completedWorkoutsInFeed.length}`);
    completedWorkoutsInFeed.forEach(w => {
      console.log(`  - "${w.title}" by ${w.creator.username}`);
      console.log(`    Completed by ${w.completedBy.length} user(s)`);
    });

    console.log('\n✅ Test complete');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testFeed();
