#!/bin/bash

echo "🚀 Starting FitCommunity Backend..."
echo ""

# Kill any process on port 3000
echo "Checking for processes on port 3000..."
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "Found process on port 3000. Stopping it..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
    echo "✅ Port 3000 is now free"
else
    echo "✅ Port 3000 is already free"
fi

echo ""
echo "Starting backend server..."
echo ""

# Start the server
npm run dev
