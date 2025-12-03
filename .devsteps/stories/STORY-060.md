# Story: Update Extension Packaging and Distribution

## User Story
As a **DevSteps maintainer**, I need to **update the extension packaging to include the bundled MCP server** so that **users get a complete, self-contained extension**.

## Acceptance Criteria
- [ ] Update `.vscodeignore` to include MCP server bundle
- [ ] Configure `vsce package` to bundle MCP server
- [ ] Optimize bundle size (compression, tree-shaking)
- [ ] Update extension README with new architecture
- [ ] Add installation verification script
- [ ] Test packaged extension on all platforms
- [ ] Measure and document bundle size
- [ ] Update CHANGELOG with bundling changes
- [ ] Publish pre-release version for testing
- [ ] Gather user feedback before stable release

## .vscodeignore Configuration
```
# Source files (exclude)
src/
esbuild.js
esbuild.mjs
tsconfig.json
.vscode/

# Build artifacts (include)
!dist/extension.js
!dist/mcp-server/index.js

# Dependencies (exclude - bundled)
node_modules/

# Documentation (include)
README.md
LICENSE.md
CHANGELOG.md

# Tests (exclude)
test/
*.test.ts
*.spec.ts

# Monorepo (exclude)
../../**
!../../packages/extension/**
```

## Package.json Configuration
```json
{
  "name": "devsteps-extension",
  "version": "2.0.0",
  "publisher": "devsteps",
  "engines": {
    "vscode": "^1.101.0"
  },
  "main": "./dist/extension.js",
  "contributes": {
    "mcpServerDefinitionProviders": [
      {
        "id": "devsteps",
        "name": "DevSteps MCP Server"
      }
    ]
  },
  "scripts": {
    "package": "npm run build && vsce package --no-dependencies",
    "publish:prerelease": "vsce publish --pre-release",
    "publish:stable": "vsce publish"
  }
}
```

## Bundle Size Optimization
```javascript
// esbuild.js - Production optimizations
{
  minify: true,
  treeShaking: true,
  drop: ['console', 'debugger'], // Remove in production
  banner: {
    js: '/* DevSteps Extension - Bundled MCP Server */'
  }
}
```

## Package Contents Verification
```bash
#!/bin/bash
# scripts/verify-package.sh

VSIX_FILE="devsteps-extension-2.0.0.vsix"

# Extract package
unzip -q "$VSIX_FILE" -d temp_extract

# Verify required files
echo "Checking package contents..."

if [ -f "temp_extract/extension/dist/extension.js" ]; then
  echo "✅ Extension bundle found"
else
  echo "❌ Extension bundle missing"
  exit 1
fi

if [ -f "temp_extract/extension/dist/mcp-server/index.js" ]; then
  echo "✅ MCP server bundle found"
else
  echo "❌ MCP server bundle missing"
  exit 1
fi

# Check bundle sizes
EXT_SIZE=$(stat -f%z "temp_extract/extension/dist/extension.js")
MCP_SIZE=$(stat -f%z "temp_extract/extension/dist/mcp-server/index.js")

echo "Extension size: $(numfmt --to=iec $EXT_SIZE)"
echo "MCP server size: $(numfmt --to=iec $MCP_SIZE)"

# Cleanup
rm -rf temp_extract

echo "✅ Package verification complete"
```

## README Updates
```markdown
# DevSteps VS Code Extension

## Installation

Install from VS Code Marketplace:
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "DevSteps"
4. Click Install

## Features

- **Zero Configuration**: MCP server bundled and auto-starts
- **Instant Activation**: No external dependencies
- **Cross-Platform**: Works on Windows, macOS, Linux
- **AI Integration**: Full Copilot Chat support

## Architecture

DevSteps uses a bundled MCP server architecture:
- Extension bundle: ~50KB
- MCP server bundle: ~500KB
- Total package: <1MB compressed

The MCP server runs as a separate Node.js process using VS Code's
native MCP registration API.

## Requirements

- VS Code 1.101.0 or higher
- Node.js 18+ (included with VS Code)

## Troubleshooting

### MCP Server Not Starting
1. Check Output → DevSteps for errors
2. Run Command: "DevSteps: Restart MCP Server"
3. Verify workspace folder is open

### Tools Not Appearing
1. Ensure Copilot Chat is in Agent Mode
2. Click tools icon to verify DevSteps is listed
3. Restart extension if needed
```

## CHANGELOG Updates
```markdown
## [2.0.0] - 2025-12-XX

### Breaking Changes
- MCP server now bundled with extension (no separate npm package)
- Minimum VS Code version: 1.101.0

### Added
- Native VS Code MCP registration API
- Automatic server lifecycle management
- Zero-configuration installation
- Status bar integration
- Manual restart command

### Removed
- npx-based installation
- Global npm dependency
- Manual configuration requirements

### Fixed
- Platform-specific installation issues
- Extension activation delays
- npm permission errors
```

## Pre-release Testing
1. **Package**: `npm run package`
2. **Install locally**: `code --install-extension devsteps-*.vsix`
3. **Test on platforms**:
   - Windows 10/11
   - macOS (Intel & ARM)
   - Linux (Ubuntu 22.04+)
   - WSL2
4. **Verify functionality**:
   - Extension activates
   - MCP server registers
   - Tools appear in Copilot
   - Commands work
5. **Publish pre-release**: `npm run publish:prerelease`

## Rollback Plan
If issues found:
1. Remove v2.0.0 from marketplace
2. Republish v1.x with fix notice
3. Document known issues
4. Plan hotfix release

## Affected Files
- `packages/extension/.vscodeignore` (updated)
- `packages/extension/package.json` (updated)
- `packages/extension/README.md` (rewritten)
- `packages/extension/CHANGELOG.md` (updated)
- `scripts/verify-package.sh` (new)

## Success Metrics
- Package size <1MB (compressed)
- Installation success rate >99%
- Zero npm permission errors
- Positive user feedback
- No critical bugs in first week