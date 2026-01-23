#!/usr/bin/env node

/**
 * Fix import paths in compiled dist files
 * Adds .js extensions to relative imports for Node.js ESM compatibility
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '../dist');

function fixImportsInFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');

  // Fix relative imports from ./path to ./path.js
  content = content.replace(
    /from ["'](\.\/[^"']+)["']/g,
    (match, importPath) => {
      // Don't modify if it already has an extension
      if (importPath.endsWith('.js') || importPath.endsWith('.json')) {
        return match;
      }
      // Add .js extension
      return `from "${importPath}.js"`;
    }
  );

  // Fix exports
  content = content.replace(
    /export \* from ["'](\.\/[^"']+)["']/g,
    (match, importPath) => {
      if (importPath.endsWith('.js') || importPath.endsWith('.json')) {
        return match;
      }
      return `export * from "${importPath}.js"`;
    }
  );

  writeFileSync(filePath, content, 'utf-8');
}

function processDirectory(dir) {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.js')) {
      fixImportsInFile(filePath);
      console.log(`✓ Fixed imports in ${filePath}`);
    }
  }
}

console.log('Fixing import paths in dist files...');
processDirectory(distDir);
console.log('✓ Done!');
