#!/usr/bin/env node

/**
 * Copy necessary package.json fields to dist folder
 * This is needed for Node.js to resolve dependencies when using subpath exports
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootPkg = JSON.parse(fs.readFileSync(join(__dirname, '../package.json'), 'utf-8'));

// Create minimal package.json for dist folder
const distPkg = {
  name: rootPkg.name,
  version: rootPkg.version,
  type: rootPkg.type,
  dependencies: rootPkg.dependencies,
  exports: rootPkg.exports,
};

fs.writeFileSync(
  join(__dirname, '../dist/package.json'),
  JSON.stringify(distPkg, null, 2),
  'utf-8'
);

console.log('✓ Created dist/package.json');
