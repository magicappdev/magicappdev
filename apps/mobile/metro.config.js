const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Helper to resolve package paths dynamically using require.resolve
const resolvePackage = name => {
  return path.dirname(require.resolve(path.join(name, "package.json")));
};

// 1. Watch all files within the monorepo
config.watchFolders = [...(config.watchFolders || []), workspaceRoot];

// 2. Configure watcher options
config.watcher = {
  ...config.watcher,
  watchman: {
    deferStates: ["hg.update"],
  },
  healthCheck: {
    enabled: true,
  },
};

// 3. Block problematic directories from watching
config.resolver.blockList = [
  // Exclude pnpm cache directories (works on both Windows and Linux)
  /pnpm-cache/,
  // Exclude Metro's own cache
  /.*\/metro-.*/,
];

// 4. Reduce workers on Windows to prevent file handle issues (optional, can be removed if not Windows-specific)
if (process.platform === "win32") {
  config.maxWorkers = 2;
}

// 5. Set nodeModulesPaths to include local and root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 6. Force resolution for critical workspace packages using dynamic paths
config.resolver.extraNodeModules = {
  // Workspace packages should resolve from their source directory for hot-reloading
  "@magicappdev/shared": path.resolve(workspaceRoot, "packages/shared"),
  // Use require.resolve for third-party packages to handle pnpm's symlink structure robustly
  "@expo/metro-runtime": resolvePackage("@expo/metro-runtime"),
  "expo-router": resolvePackage("expo-router"),
  "react-native": resolvePackage("react-native"),
  react: resolvePackage("react"),
  "@babel/runtime": resolvePackage("@babel/runtime"),
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
// This might be redundant if uuid is correctly resolved via extraNodeModules or hoisting
config.resolver.alias = {
  "uuid/v4": "uuid",
};

module.exports = config;
