## Objective
Automatically install DevSteps packages from npm on first extension activation.

## Changes Required

### 1. Import PackageInstaller
Add import to extension.ts:
import { PackageInstaller } from './utils/packageInstaller.js';

### 2. Call installer in activate()
Add before MCP server registration:
const installer = new PackageInstaller();
await installer.ensurePackagesInstalled();

### 3. Update packages to install
Ensure PackageInstaller installs:
- @schnick371/devsteps-shared (latest)
- @schnick371/devsteps-mcp-server (latest)
- @schnick371/devsteps-cli (latest)

### 4. Add error handling
Gracefully handle installation failures:
- Show user-friendly error messages
- Provide manual installation instructions
- Don't block extension activation

## Affected Files
- packages/extension/src/extension.ts
- packages/extension/src/utils/packageInstaller.ts

## Validation
- Fresh VS Code install triggers npm install automatically
- Progress notification shows during installation
- Extension works after installation completes
- Installation only runs once (checks if already installed)