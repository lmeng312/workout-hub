#!/bin/bash

# Script to start the mobile app with proper file watcher settings

echo "🚀 Starting FitCommunity Mobile App"
echo "===================================="
echo ""

# Check if Watchman is installed
if command -v watchman &> /dev/null; then
    echo "✅ Watchman is installed"
else
    echo "⚠️  Watchman not found. Installing via Homebrew..."
    echo "   Run: brew install watchman"
    echo ""
fi

# Increase file descriptor limit
echo "📈 Setting file descriptor limit..."
ulimit -n 10240

# Verify limit
CURRENT_LIMIT=$(ulimit -n)
echo "   Current limit: $CURRENT_LIMIT"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "   Make sure you're in the mobile directory"
    exit 1
fi

# Start the app
echo "🎯 Starting Expo..."
echo ""
npm start
