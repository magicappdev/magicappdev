#!/usr/bin/env node

/**
 * Patch expo-router to replace React 19's use() with React 18's useContext()
 * and inject missing babel helpers
 *
 * This script is needed because expo-router@6.0.22 was built with React 19
 * and uses the use() API which doesn't exist in React 18.
 * Expo SDK 54 requires React 18, so we need to patch the package.
 */

const path = require("path");
const fs = require("fs");

const rootDir = path.resolve(__dirname, "..");
const nodeModulesDir = path.join(rootDir, "node_modules", ".pnpm");

console.log("🔧 Patching expo-router for React 18 compatibility...");

try {
  // Find all expo-router directories
  const expoRouterDirs = fs
    .readdirSync(nodeModulesDir)
    .filter(dir => dir.startsWith("expo-router@6.0.22"))
    .map(dir =>
      path.join(nodeModulesDir, dir, "node_modules", "expo-router", "build"),
    )
    .filter(dir => fs.existsSync(dir));

  if (expoRouterDirs.length === 0) {
    console.log(
      "✅ No expo-router directories found to patch (already patched or not installed)",
    );
    process.exit(0);
  }

  let patchedFiles = 0;
  let patchedDirs = 0;

  // Helper function to inject
  const babelHelperInjection = `// Polyfill for _objectWithoutPropertiesLoose helper
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
// Also define numbered variants that Metro bundler might create
var _objectWithoutPropertiesLoose2 = _objectWithoutPropertiesLoose;
var _objectWithoutPropertiesLoose3 = _objectWithoutPropertiesLoose;
var _objectWithoutPropertiesLoose4 = _objectWithoutPropertiesLoose;
`;

  // Patterns to find files that need patching
  const reactUsePatterns = [
    [/\(0,\s*react_1\.use\)\(/g, "(0, react_1.useContext)("],
    [/React\.use\(/g, "React.useContext("],
  ];

  // Walk through each expo-router build directory
  for (const buildDir of expoRouterDirs) {
    const filesToPatch = [];

    // Find all JavaScript files
    const findJsFiles = dir => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          findJsFiles(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".js")) {
          const content = fs.readFileSync(fullPath, "utf8");
          // Check if any pattern matches or if it needs babel helper injection
          const needsReactUsePatch = reactUsePatterns.some(([pattern]) =>
            pattern.test(content),
          );
          const needsBabelHelper =
            content.includes("_objectWithoutPropertiesLoose") &&
            !content.includes("var _objectWithoutPropertiesLoose = function");
          const isExpoRoot = fullPath.endsWith("ExpoRoot.js");

          if (needsReactUsePatch || needsBabelHelper || isExpoRoot) {
            filesToPatch.push({
              path: fullPath,
              needsReactUsePatch,
              needsBabelHelper,
              isExpoRoot,
            });
          }
        }
      }
    };

    findJsFiles(buildDir);

    // Patch each file
    for (const {
      path: filePath,
      needsReactUsePatch,
      needsBabelHelper,
      isExpoRoot,
    } of filesToPatch) {
      try {
        let content = fs.readFileSync(filePath, "utf8");
        const originalContent = content;

        // Inject babel helper if needed (for ExpoRoot.js and files that use it)
        if (isExpoRoot || needsBabelHelper) {
          if (
            !content.includes("var _objectWithoutPropertiesLoose = function")
          ) {
            // Insert after the "use strict" directive
            content = content.replace(
              /"use strict";/,
              `"use strict";\n${babelHelperInjection}`,
            );
          }
        }

        // Replace React.use with React.useContext
        if (needsReactUsePatch) {
          for (const [pattern, replacement] of reactUsePatterns) {
            content = content.replace(pattern, replacement);
          }
        }

        // Write back if changed
        if (content !== originalContent) {
          fs.writeFileSync(filePath, content, "utf8");
          patchedFiles++;
          console.log(`  ✓ Patched: ${path.relative(rootDir, filePath)}`);
        }
      } catch (err) {
        console.warn(
          `  ⚠️  Failed to patch: ${path.relative(rootDir, filePath)}`,
          err.message,
        );
      }
    }

    if (filesToPatch.length > 0) {
      patchedDirs++;
    }
  }

  if (patchedFiles > 0) {
    console.log(
      `\n✅ Successfully patched ${patchedFiles} files in ${patchedDirs} expo-router installations`,
    );
  } else {
    console.log("✅ No files needed patching (already patched)");
  }
} catch (err) {
  console.error("❌ Failed to patch expo-router:", err.message);
  process.exit(1);
}
