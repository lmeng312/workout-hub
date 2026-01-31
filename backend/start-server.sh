#!/bin/bash

# FitCommunity Backend Startup Script
# This ensures environment variables are properly loaded

cd "$(dirname "$0")"

echo "🚀 Starting FitCommunity Backend..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    exit 1
fi

# Load environment variables from .env
export $(cat .env | grep -v '^#' | xargs)

# Verify MongoDB URI is loaded
if [ -z "$MONGODB_URI" ]; then
    echo "❌ Error: MONGODB_URI not found in .env"
    exit 1
fi

echo "✓ Environment variables loaded"
echo "✓ MongoDB URI: MongoDB Atlas (hidden)"
echo "✓ Port: ${PORT:-3000}"
echo ""

# Kill any existing process on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 1

# Start the server
node server.js
