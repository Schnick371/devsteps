#!/usr/bin/env node
/**
 * Copy runtime dependencies from root node_modules to local node_modules
 * This is needed for bundling in VS Code extension
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packageJson = require('./package.json');
const rootNodeModules = path.join(__dirname, '../../node_modules');
const localNodeModules = path.join(__dirname, 'node_modules');

// Get list of runtime dependencies
const dependencies = Object.keys(packageJson.dependencies || {}).filter(
  (dep) => !dep.startsWith('@devsteps/') // Exclude workspace dependencies
);

console.log(`📦 Copying ${dependencies.length} dependencies to local node_modules...`);

// Create local node_modules if it doesn't exist
if (!fs.existsSync(localNodeModules)) {
  fs.mkdirSync(localNodeModules, { recursive: true });
}

// Copy each dependency
for (const dep of dependencies) {
  const sourcePath = path.join(rootNodeModules, dep);
  const targetPath = path.join(localNodeModules, dep);

  if (fs.existsSync(sourcePath)) {
    console.log(`  ✅ Copying ${dep}...`);

    // Remove existing
    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { recursive: true, force: true });
    }

    // Copy
    fs.cpSync(sourcePath, targetPath, { recursive: true });
  } else {
    console.warn(`  ⚠️  Warning: ${dep} not found in root node_modules`);
  }
}

// Also copy @modelcontextprotocol scope
const scopePath = path.join(rootNodeModules, '@modelcontextprotocol');
if (fs.existsSync(scopePath)) {
  console.log(`  ✅ Copying @modelcontextprotocol scope...`);
  const targetScope = path.join(localNodeModules, '@modelcontextprotocol');
  if (fs.existsSync(targetScope)) {
    fs.rmSync(targetScope, { recursive: true, force: true });
  }
  fs.cpSync(scopePath, targetScope, { recursive: true });
}

console.log('✨ Done! Dependencies copied successfully.');
