const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Get the project root
const projectRoot = __dirname;

config.resolver.assetExts.push(
  // Audio formats
  'wav',
  'mp3',
  'aac',
  'm4a',
  'ogg',
);

// Configure watchFolders to include the project root
config.watchFolders = [projectRoot];

// Set the project root explicitly
config.projectRoot = projectRoot;

// Ensure assets are resolved from the project root
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

// Ensure source maps are enabled for better debugging
config.transformer.minifierConfig = {
  keep_classnames: true,
  keep_fnames: true,
  mangle: {
    keep_classnames: true,
    keep_fnames: true,
  },
};

module.exports = config;
