#!/bin/bash

echo "🚀 FitCommunity Setup Script"
echo "=============================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Setup Backend
echo "📦 Setting up backend..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo "Backend dependencies already installed"
fi
cd ..

echo ""

# Setup Mobile
echo "📱 Setting up mobile app..."
cd mobile
if [ ! -d "node_modules" ]; then
    echo "Installing mobile dependencies..."
    npm install
else
    echo "Mobile dependencies already installed"
fi
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start backend: cd backend && npm run dev"
echo "2. Update mobile/config.js with your backend URL"
echo "3. Start mobile: cd mobile && npm start"
echo ""
echo "See README.md for detailed instructions"
