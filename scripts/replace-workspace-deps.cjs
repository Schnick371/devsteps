#!/usr/bin/env node
/**
 * Replace workspace:* and file: dependencies with actual versions before publishing
 * 
 * This script runs automatically via prepublishOnly hook.
 * After publish, postpublish hook restores package.json from git.
 */

const fs = require('fs');
const path = require('path');

// Map npm package names to workspace directory names
const WORKSPACE_MAPPING = {
  '@schnick371/devsteps-shared': 'shared',
  '@schnick371/devsteps-cli': 'cli',
  '@schnick371/devsteps-mcp-server': 'mcp-server'
};

const packageJsonPath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

let modified = false;

// Replace workspace:* and file: in dependencies
if (pkg.dependencies) {
  for (const [name, version] of Object.entries(pkg.dependencies)) {
    if (version === 'workspace:*' || version.startsWith('workspace:') || version.startsWith('file:')) {
      // Get workspace directory name from mapping
      const workspaceDir = WORKSPACE_MAPPING[name];
      if (!workspaceDir) {
        console.error(`✗ No workspace mapping found for: ${name}`);
        process.exit(1);
      }
      
      // Get the actual version from the workspace package
      const workspacePkgPath = path.join(
        process.cwd(),
        '../',
        workspaceDir,
        'package.json'
      );
      
      if (fs.existsSync(workspacePkgPath)) {
        const workspacePkg = JSON.parse(fs.readFileSync(workspacePkgPath, 'utf8'));
        pkg.dependencies[name] = workspacePkg.version;
        modified = true;
        console.log(`✓ Replaced ${name}: ${version} → ${workspacePkg.version}`);
      } else {
        console.error(`✗ Workspace package not found: ${workspacePkgPath}`);
        process.exit(1);
      }
    }
  }
}

// Replace workspace:* and file: in devDependencies
if (pkg.devDependencies) {
  for (const [name, version] of Object.entries(pkg.devDependencies)) {
    if (version === 'workspace:*' || version.startsWith('workspace:') || version.startsWith('file:')) {
      const workspaceDir = WORKSPACE_MAPPING[name];
      if (!workspaceDir) {
        console.error(`✗ No workspace mapping found for: ${name}`);
        process.exit(1);
      }
      
      const workspacePkgPath = path.join(
        process.cwd(),
        '../',
        workspaceDir,
        'package.json'
      );
      
      if (fs.existsSync(workspacePkgPath)) {
        const workspacePkg = JSON.parse(fs.readFileSync(workspacePkgPath, 'utf8'));
        pkg.devDependencies[name] = workspacePkg.version;
        modified = true;
        console.log(`✓ Replaced ${name}: ${version} → ${workspacePkg.version}`);
      } else {
        console.error(`✗ Workspace package not found: ${workspacePkgPath}`);
        process.exit(1);
      }
    }
  }
}

if (modified) {
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log('✓ package.json updated for publishing');
  console.log('  (will be restored after publish via postpublish hook)');
} else {
  console.log('No workspace:* or file: dependencies found');
}
