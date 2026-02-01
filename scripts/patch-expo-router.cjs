#!/usr/bin/env node

/**
 * Robust patch for expo-router to replace React 19's use() with React 18's useContext()
 * and inject missing babel helpers.
 */

const path = require("path");
const fs = require("fs");

const rootDir = path.resolve(__dirname, "..");

console.log("🔧 Running robust patch for expo-router...");

function findPackageDirs(startDir, packageName) {
  const results = [];
  
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    
    // Skip common non-package directories
    if (dir.includes(".git") || dir.includes(".nx") || dir.includes(".turbo")) return;

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (entry.name === "node_modules") {
            const pkgPath = path.join(fullPath, packageName);
            if (fs.existsSync(pkgPath)) {
              results.push(pkgPath);
            }
            // Also look inside .pnpm virtual store if it exists
            const pnpmStore = path.join(fullPath, ".pnpm");
            if (fs.existsSync(pnpmStore)) {
              try {
                const pnpmEntries = fs.readdirSync(pnpmStore, { withFileTypes: true });
                for (const pnpmEntry of pnpmEntries) {
                  if (pnpmEntry.isDirectory() && pnpmEntry.name.includes(packageName.replace("/", "+"))) {
                    const nestedPkgPath = path.join(pnpmStore, pnpmEntry.name, "node_modules", packageName);
                    if (fs.existsSync(nestedPkgPath)) {
                      results.push(nestedPkgPath);
                    }
                  }
                }
              } catch (e) {
                // Ignore errors reading .pnpm
              }
            }
          } else {
            walk(fullPath);
          }
        }
      }
    } catch (e) {
      // Ignore errors reading directory
    }
  }
  
  walk(startDir);
  return [...new Set(results.map(p => {
    try {
      return fs.realpathSync(p);
    } catch (e) {
      return p;
    }
  }))];
}

try {
  const expoRouterPkgDirs = findPackageDirs(rootDir, "expo-router");
  const buildDirs = expoRouterPkgDirs
    .map(pkgDir => path.join(pkgDir, "build"))
    .filter(dir => fs.existsSync(dir));

  if (buildDirs.length === 0) {
    console.log("✅ No expo-router installations found to patch.");
    process.exit(0);
  }

  console.log(`🔍 Found ${buildDirs.length} expo-router installations to check.`);

  let patchedFilesCount = 0;

  const babelHelperInjection = `"use strict";
// Polyfill for _objectWithoutPropertiesLoose helper
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

  const reactUsePatterns = [
    { pattern: /\(0,\s*react_1\.use\)\(/g, replacement: "(0, react_1.useContext)(" },
    { pattern: /React\.use\(/g, replacement: "React.useContext(" },
  ];

  function patchFile(filePath) {
    let content = fs.readFileSync(filePath, "utf8");
    const originalContent = content;

    const needsBabelHelper = 
      content.includes("_objectWithoutPropertiesLoose") && 
      !content.includes("var _objectWithoutPropertiesLoose = function") &&
      !content.includes("function _objectWithoutPropertiesLoose");
    
    const isExpoRoot = filePath.endsWith("ExpoRoot.js");

    // Inject babel helpers if needed
    if (isExpoRoot || needsBabelHelper) {
      if (!content.includes("function _objectWithoutPropertiesLoose")) {
        content = content.replace(/"use strict";/, babelHelperInjection);
      }
    }

    // Replace React.use with React.useContext
    for (const { pattern, replacement } of reactUsePatterns) {
      content = content.replace(pattern, replacement);
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`  ✓ Patched: ${path.relative(rootDir, filePath)}`);
      patchedFilesCount++;
      return true;
    }
    return false;
  }

  function walkAndPatch(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkAndPatch(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".js")) {
        patchFile(fullPath);
      }
    }
  }

  for (const buildDir of buildDirs) {
    walkAndPatch(buildDir);
  }

  if (patchedFilesCount > 0) {
    console.log(`\n✅ Successfully patched ${patchedFilesCount} files across ${buildDirs.length} installations.`);
  } else {
    console.log("\n✅ All expo-router installations are already up to date.");
  }

} catch (err) {
  console.error("❌ Error during expo-router patching:", err);
  process.exit(1);
}
