#!/bin/bash

# Fix for "EMFILE: too many open files" error on macOS
# This increases the file descriptor limit for the current session

echo "Fixing file watcher limit for macOS..."
echo ""

# Check current limit
echo "Current limits:"
ulimit -n

# Increase limit (macOS default is usually 256, we'll set to 10240)
ulimit -n 10240

echo ""
echo "New limit:"
ulimit -n

echo ""
echo "✅ File watcher limit increased!"
echo "Now you can run: npm start"
echo ""
echo "Note: This is temporary for this terminal session."
echo "To make permanent, add to ~/.zshrc:"
echo "  ulimit -n 10240"
