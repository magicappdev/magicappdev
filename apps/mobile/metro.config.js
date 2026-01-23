const { getDefaultConfig } = require("@expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [...(config.watchFolders || []), workspaceRoot];

// 2. Configure watch options for Windows/pnpm
config.watchOptions = {
  ...config.watchOptions,
  useWatchman: false, // Disable watchman on Windows (has issues with pnpm)
  poll: 1000, // Use polling instead of native file watching (more reliable on Windows)
};

// 3. Block problematic directories from watching
config.blockList = [
  // Exclude pnpm cache directories
  /.*\/node_modules\/\.pnpm\/.*/,
  /.*\/node_modules\/.*\/\.pnpm\/.*/,
  // Exclude Metro's own cache
  /.*\/metro-.*/,
];

// 4. Reduce workers on Windows to prevent file handle issues
config.maxWorkers = 2;

// 5. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Force resolution to use node_modules for workspace packages
config.resolver.extraNodeModules = {
  "@magicappdev/shared": path.resolve(workspaceRoot, "packages/shared"),
};

// Add support for 3D model files
config.resolver.assetExts.push("fbx", "glb", "gltf");

// Add TypeScript extensions for source resolution
config.resolver.sourceExts.push("ts", "tsx");

// Enable package.json exports field support
config.resolver.unstable_enablePackageExports = true;

// Use react-native condition for package.json exports
config.resolver.unstable_conditionNames = ["react-native", "require", "import"];

// Prioritize react-native exports in package.json
config.resolver.resolverMainFields = ["react-native", "browser", "main"];

// Handle uuid import for newer versions - use modern import
config.resolver.alias = {
  "uuid/v4": "uuid",
};

module.exports = config;
