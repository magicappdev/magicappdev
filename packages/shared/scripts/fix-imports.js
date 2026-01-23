#!/usr/bin/env node

/**
 * Fix import paths in compiled dist files
 * Adds .js extensions to relative imports for Node.js ESM compatibility
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, "../dist");

function fixImportsInFile(filePath) {
  let content = readFileSync(filePath, "utf-8");

  // Fix all relative imports including type-only imports
  // Matches: from "./path", from './path', type { X } from "./path"
  content = content.replace(
    /(["'])(\.\/[^"']+)\1/g,
    (match, quote, importPath) => {
      // Don't modify if it already has an extension
      if (
        importPath.endsWith(".js") ||
        importPath.endsWith(".json") ||
        importPath.endsWith(".mjs")
      ) {
        return match;
      }
      // Add .js extension
      return `${quote}${importPath}.js${quote}`;
    },
  );

  writeFileSync(filePath, content, "utf-8");
}

function processDirectory(dir) {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith(".js")) {
      fixImportsInFile(filePath);
      console.log(`✓ Fixed imports in ${filePath}`);
    }
  }
}

function fixbaseerrors() {
  const baseErrors = join(distDir, "/errors/base.error.js");
  console.log("Fixing base errors...", baseErrors);
  let content = readFileSync(baseErrors, "utf-8");
  content = content.replace(
    `import { ErrorCodes, ErrorMessages } from "../constants/index";`,
    `import { ErrorCodes, ErrorMessages } from "../constants/index.js";`,
  );
  writeFileSync(baseErrors, content, "utf-8");
  // console.log('Replacing imports...', content);
  // console.log('✓ Done!');
}

console.log("Fixing import paths in dist files...");
processDirectory(distDir);
console.log("✓ Done!");
fixbaseerrors();
console.log("✓ Done!");
