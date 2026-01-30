const { parseYouTubeWorkout, parseInstagramWorkout, parseWorkoutFromText } = require('../utils/workoutParser');

// Test URLs from user
const testCases = [
  {
    name: 'YouTube Example 1: Strength Workout',
    url: 'https://www.youtube.com/watch?v=4gX0SWUiV9k',
    type: 'youtube',
    description: '30 MIN FULL BODY WORKOUT at Home (No Equipment)',
    expectedTags: ['strength', 'full body', 'no equipment']
  },
  {
    name: 'YouTube Example 2: Yoga/Stretch',
    url: 'https://www.youtube.com/watch?v=jPHh9HhbJCY',
    type: 'youtube',
    description: '20 Min Full Body Stretch & Flexibility Routine',
    expectedTags: ['yoga', 'stretching', 'flexibility', 'full body']
  },
  {
    name: 'Instagram Example 1: Hip Mobility',
    url: 'https://www.instagram.com/p/DT3MKs-ETrC/?img_index=1',
    type: 'instagram',
    caption: `Hip Mobility Flow 💪
    
1. Hip Circles - 10 each direction
2. Leg Swings - 15 per side
3. Hip Flexor Stretch - 30 sec per side
4. Pigeon Pose - 45 sec per side
5. 90/90 Stretch - 1 min per side

#hipmobility #flexibility #mobility`
  },
  {
    name: 'Instagram Example 2: Running Strength',
    url: 'https://www.instagram.com/p/DSkMlUVDCWF/',
    type: 'instagram',
    caption: `3 Mile Run + Strength Circuit 🏃‍♀️💪

Run: 3 miles easy pace

Strength Circuit (3 rounds):
- Squats x 15
- Push-ups x 10
- Lunges x 12 per side
- Plank - 45 sec
- Rest 60 sec between rounds

#running #strength #cardio`
  },
  {
    name: 'Instagram Example 3: Hip Mobility (Different Format)',
    url: 'https://www.instagram.com/p/DRyDdHxjxAl/',
    type: 'instagram',
    caption: `Daily Hip Mobility Routine 🔥

• Hip Circles: 10x each way
• Leg Swings: 15 per leg
• Hip Flexor Stretch: Hold 30s each
• Pigeon Pose: 45s per side
• 90/90: 1 minute per side

Do this daily for better hip mobility! #hipmobility #mobility #flexibility`
  }
];

async function runTests() {
  console.log('🧪 Testing Workout Parser with Real Examples\n');
  console.log('='.repeat(80));

  const results = [];

  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log(`URL: ${testCase.url}`);
    console.log('-'.repeat(80));

    try {
      let parsedWorkout;

      if (testCase.type === 'youtube') {
        // For YouTube, we'll use the description as caption text since we can't easily fetch
        parsedWorkout = await parseYouTubeWorkout(testCase.url, testCase.description);
      } else if (testCase.type === 'instagram') {
        parsedWorkout = await parseInstagramWorkout(testCase.url, testCase.caption);
      } else {
        parsedWorkout = parseWorkoutFromText(testCase.caption || testCase.description);
      }

      const result = {
        name: testCase.name,
        url: testCase.url,
        success: true,
        parsed: {
          title: parsedWorkout.title,
          duration: parsedWorkout.estimatedDuration,
          exerciseCount: parsedWorkout.exercises.length,
          exercises: parsedWorkout.exercises.map(ex => ({
            name: ex.name,
            sets: ex.sets.length,
            reps: ex.sets[0]?.reps || 0,
            duration: ex.sets[0]?.duration || 0
          })),
          tags: parsedWorkout.tags,
          equipment: parsedWorkout.equipment,
          difficulty: parsedWorkout.difficulty
        }
      };

      results.push(result);

      // Display results
      console.log(`✅ Title: ${parsedWorkout.title}`);
      console.log(`⏱️  Duration: ${parsedWorkout.estimatedDuration || 'Not specified'} minutes`);
      console.log(`💪 Exercises Found: ${parsedWorkout.exercises.length}`);
      console.log(`🏷️  Tags: ${parsedWorkout.tags.join(', ') || 'None'}`);
      console.log(`🎯 Equipment: ${parsedWorkout.equipment}`);
      console.log(`📊 Difficulty: ${parsedWorkout.difficulty}`);

      if (parsedWorkout.exercises.length > 0) {
        console.log('\n📝 Exercises:');
        parsedWorkout.exercises.forEach((ex, idx) => {
          const setInfo = ex.sets[0];
          let info = '';
          if (setInfo.reps > 0) {
            info = `${ex.sets.length} sets x ${setInfo.reps} reps`;
          } else if (setInfo.duration > 0) {
            info = `${setInfo.duration} seconds`;
          } else {
            info = `${ex.sets.length} set(s)`;
          }
          console.log(`   ${idx + 1}. ${ex.name} - ${info}`);
        });
      } else {
        console.log('⚠️  No exercises found');
      }

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      results.push({
        name: testCase.name,
        url: testCase.url,
        success: false,
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 TEST SUMMARY\n');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);

  // JSON output for comparison
  console.log('\n📄 JSON Output (for comparison):\n');
  console.log(JSON.stringify(results, null, 2));

  return results;
}

// Run tests
if (require.main === module) {
  runTests()
    .then(() => {
      console.log('\n✨ Tests completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runTests };
