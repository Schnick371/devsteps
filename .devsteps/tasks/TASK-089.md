## Objective
Stop bundling MCP server files in extension package - use npm installation instead.

## Changes Required

### 1. Update .vscodeignore
Add exclusion: dist/mcp-server/

### 2. Remove build script
Remove copy-mcp-server from package.json scripts

### 3. Update build command
Change build script to: node esbuild.mjs --production

### 4. Clean dist folder
Remove packages/extension/dist/mcp-server/ directory

## Affected Files
- packages/extension/.vscodeignore
- packages/extension/package.json

## Validation
- Extension builds without errors
- dist/ folder does NOT contain mcp-server/
- Extension package size reduced significantly