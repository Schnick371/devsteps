## Objective
Ensure PackageInstaller installs shared package along with CLI and MCP server.

## Changes Required

### 1. Update packages list
Change in installPackages() method:
const packages = '@schnick371/devsteps-shared @schnick371/devsteps-cli @schnick371/devsteps-mcp-server';

### 2. Update installation check
Change in arePackagesInstalled() method:
npm list -g @schnick371/devsteps-shared @schnick371/devsteps-cli @schnick371/devsteps-mcp-server

### 3. Keep latest version strategy
No version pinning - always install latest:
npm install -g @schnick371/devsteps-shared@latest @schnick371/devsteps-cli@latest @schnick371/devsteps-mcp-server@latest

## Affected Files
- packages/extension/src/utils/packageInstaller.ts

## Validation
- All three packages installed globally
- Packages install in correct order (shared first as dependency)
- Works on Windows, Linux, macOS, WSL2