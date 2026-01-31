#!/bin/bash

# Quick script to add images to existing workouts
# Run this from the backend directory

echo "🏋️  Adding Exercise Images to Existing Workouts"
echo "==============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this from the backend directory"
    echo "   cd backend"
    echo "   ./scripts/quick-migrate.sh"
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

# Run the migration
echo "🔄 Starting migration..."
echo ""

node scripts/migrateExerciseImages.js

echo ""
echo "✨ Done! Check your app - workouts should now have exercise images!"
echo ""
echo "📱 Refresh your mobile app to see the changes"
