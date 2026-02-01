const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [...(config.watchFolders || []), workspaceRoot];

// 2. Configure watcher options for Windows/pnpm
config.watcher = {
  ...config.watcher,
  watchman: {
    deferStates: ["hg.update"],
  },
  healthCheck: {
    enabled: true,
  },
};

// 3. Block problematic directories from watching (use resolver.blockList)
// NOTE: Removed pnpm .pnpm blocking to allow @babel/runtime helpers to resolve
config.resolver.blockList = [
  // Exclude pnpm dlx cache (used by bun/pnpm)
  /[A-Z]:\\.+\\pnpm-cache\\+.*/,
  /.*\/pnpm-cache\/.*/,
  // Exclude Metro's own cache
  /.*\/metro-.*/,
  // Exclude Windows AppData
  /[A-Z]:\\.+\\AppData\.+/,
];

// 4. Reduce workers on Windows to prevent file handle issues
config.maxWorkers = 2;

// 5. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Helper to robustly resolve packages in a monorepo
const resolvePkg = pkg => {
  try {
    return path.dirname(
      require.resolve(`${pkg}/package.json`, { paths: [projectRoot, workspaceRoot] }),
    );
  } catch (e) {
    return path.resolve(workspaceRoot, "node_modules", pkg);
  }
};

// Force resolution to use node_modules for workspace packages
config.resolver.extraNodeModules = {
  "@magicappdev/shared": path.resolve(workspaceRoot, "packages/shared"),
  "@expo/metro-runtime": resolvePkg("@expo/metro-runtime"),
  "expo-router": resolvePkg("expo-router"),
  "react-native": resolvePkg("react-native"),
  react: resolvePkg("react"),
  "@babel/runtime": resolvePkg("@babel/runtime"),
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
