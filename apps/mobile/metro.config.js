const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch monorepo root so Metro can track packages/domain
config.watchFolders = [monorepoRoot];

// 2. Resolve node_modules from mobile and root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// 3. Extra node modules alias
config.resolver.extraNodeModules = {
  "@georynth/domain": path.resolve(monorepoRoot, "packages/domain/src"),
};

module.exports = config;
