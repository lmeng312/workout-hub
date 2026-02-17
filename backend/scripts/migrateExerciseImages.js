/**
 * Migration Script: Add Images to Existing Exercises
 * 
 * This script updates all existing workouts to include exercise images.
 * Run this once after deploying the exercise images feature.
 * 
 * Usage: node scripts/migrateExerciseImages.js
 */

const mongoose = require('mongoose');
const Workout = require('../models/Workout');
const { enrichExercisesWithImages } = require('../utils/exerciseImageLookup');

// Load environment variables
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set. Add it to backend/.env');
  process.exit(1);
}

async function migrateExerciseImages() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all workouts
    console.log('📋 Fetching all workouts...');
    const workouts = await Workout.find({});
    console.log(`Found ${workouts.length} workouts\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const workout of workouts) {
      try {
        if (!workout.exercises || workout.exercises.length === 0) {
          console.log(`⏭️  Skipping "${workout.title}" - no exercises`);
          skippedCount++;
          continue;
        }

        // Check if already has images
        const hasImages = workout.exercises.some(ex => ex.image);
        
        if (hasImages) {
          console.log(`⏭️  Skipping "${workout.title}" - already has images`);
          skippedCount++;
          continue;
        }

        // Enrich with images
        console.log(`🖼️  Processing "${workout.title}" with ${workout.exercises.length} exercises...`);
        workout.exercises = enrichExercisesWithImages(workout.exercises);
        
        // Count how many got images
        const imagesAdded = workout.exercises.filter(ex => ex.image).length;
        
        await workout.save();
        console.log(`✅ Updated "${workout.title}" - added ${imagesAdded}/${workout.exercises.length} images\n`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Error processing "${workout.title}":`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Updated: ${updatedCount} workouts`);
    console.log(`   ⏭️  Skipped: ${skippedCount} workouts`);
    console.log(`   ❌ Errors: ${errorCount} workouts`);
    console.log(`   📋 Total: ${workouts.length} workouts\n`);

    console.log('✨ Migration completed!\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the migration
migrateExerciseImages();
