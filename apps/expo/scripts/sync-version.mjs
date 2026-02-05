/**
 * Version Sync Script
 *
 * Syncs the version from package.json to app.json and increments build numbers.
 *
 * Usage:
 *   node scripts/sync-version.mjs
 *
 * This script is automatically called by the version:* npm scripts.
 */

import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// Read package.json
const packageJsonPath = join(rootDir, "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
const newVersion = packageJson.version;

// Read app.json
const appJsonPath = join(rootDir, "app.json");
const appJson = JSON.parse(readFileSync(appJsonPath, "utf-8"));

// Update version
const oldVersion = appJson.expo.version;
appJson.expo.version = newVersion;

// Increment iOS build number
const oldBuildNumber = parseInt(appJson.expo.ios.buildNumber || "0", 10);
appJson.expo.ios.buildNumber = String(oldBuildNumber + 1);

// Increment Android version code
const oldVersionCode = appJson.expo.android.versionCode || 0;
appJson.expo.android.versionCode = oldVersionCode + 1;

// Write updated app.json
writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + "\n", "utf-8");

console.log(`Version synced: ${oldVersion} → ${newVersion}`);
console.log(
  `iOS buildNumber: ${oldBuildNumber} → ${appJson.expo.ios.buildNumber}`,
);
console.log(
  `Android versionCode: ${oldVersionCode} → ${appJson.expo.android.versionCode}`,
);
