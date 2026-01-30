#!/bin/bash

echo "🧹 Cleaning and restarting Expo server..."
echo ""

# Stop any running processes on port 8081
echo "Stopping any processes on port 8081..."
lsof -ti:8081 | xargs kill -9 2>/dev/null || echo "No processes to kill"

# Clear all caches
echo "Clearing caches..."
rm -rf .expo
rm -rf node_modules/.cache
rm -rf .metro

echo "✅ Cache cleared!"
echo ""
echo "Now restart the server with:"
echo "  npx expo start --clear"
echo ""
