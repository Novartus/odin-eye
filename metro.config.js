// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Helper to escape path string for regex
const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Anchor explicitly to project root to avoid blocking node_modules packages that use "dist" or "build"
const projectDist = new RegExp(`^${escapeRegExp(path.resolve(__dirname, 'dist'))}.*`);
const projectDocs = new RegExp(`^${escapeRegExp(path.resolve(__dirname, 'docs'))}.*`);
const projectAndroidBuild = new RegExp(`^${escapeRegExp(path.resolve(__dirname, 'android', 'build'))}.*`);
const projectAndroidAppBuild = new RegExp(`^${escapeRegExp(path.resolve(__dirname, 'android', 'app', 'build'))}.*`);
const projectAndroidGradle = new RegExp(`^${escapeRegExp(path.resolve(__dirname, 'android', '.gradle'))}.*`);

const additionalBlockList = [
  projectDist,
  projectDocs,
  projectAndroidBuild,
  projectAndroidAppBuild,
  projectAndroidGradle,
];

if (Array.isArray(config.resolver.blockList)) {
  config.resolver.blockList.push(...additionalBlockList);
} else if (config.resolver.blockList) {
  config.resolver.blockList = [config.resolver.blockList, ...additionalBlockList];
} else {
  config.resolver.blockList = additionalBlockList;
}

module.exports = config;
