const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Watchman is installed, so we don't need polling mode
// This config is optimized for Watchman

module.exports = config;
