# Story: Transform Build System for Dual-Target MCP Bundling

## User Story
As a **DevSteps developer**, I need to **configure esbuild to produce separate extension and MCP server bundles** so that the **MCP server can run as an independent process without vscode API access**.

## Acceptance Criteria
- [ ] Create separate esbuild target for MCP server bundle
- [ ] Configure MCP server bundle to exclude `vscode` API
- [ ] Bundle all MCP dependencies (SDK, handlers, shared packages)
- [ ] Optimize bundle size with tree-shaking and minification
- [ ] Generate platform-independent MCP server executable
- [ ] Update package.json scripts for dual builds
- [ ] Ensure dist/ structure matches VS Code expectations
- [ ] Verify bundle works on Windows, macOS, Linux
- [ ] Add bundle size monitoring and optimization
- [ ] Document build process and configuration

## Technical Requirements

### MCP Server Bundle Configuration
```javascript
// esbuild configuration for MCP server
{
  entryPoints: ['src/mcp-server/index.ts'],
  bundle: true,
  format: 'cjs',  // CommonJS for Node.js
  platform: 'node',
  target: 'node18',
  outfile: 'dist/mcp-server/index.js',
  external: ['vscode'],  // CRITICAL!
  minify: true,
  sourcemap: false,
  mainFields: ['module', 'main'],
  banner: {
    js: '#!/usr/bin/env node'
  }
}
```

### Extension Bundle Configuration
```javascript
// esbuild configuration for extension
{
  entryPoints: ['src/extension.ts'],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  target: 'node18',
  outfile: 'dist/extension.js',
  external: ['vscode'],
  minify: true
}
```

## Build Output Structure
```
packages/extension/dist/
├── extension.js          # Main extension bundle (~50KB)
├── extension.js.map
├── mcp-server/
│   ├── index.js         # MCP server bundle (~500KB)
│   └── index.js.map
```

## Package.json Scripts
```json
{
  "scripts": {
    "build": "npm run build:extension && npm run build:mcp",
    "build:extension": "esbuild src/extension.ts --bundle ...",
    "build:mcp": "esbuild src/mcp-server/index.ts --bundle ...",
    "watch": "npm run watch:extension & npm run watch:mcp",
    "package": "vsce package --no-dependencies"
  }
}
```

## Bundle Size Targets
- Extension bundle: ~50KB (current)
- MCP server bundle: ~500KB (includes SDK + handlers)
- Total extension package: <1MB (compressed)

## Dependencies to Bundle
- `@modelcontextprotocol/sdk`
- `@schnick371/devsteps-shared`
- All handler modules
- All utility modules

## Affected Files
- `packages/extension/esbuild.js` (new dual-target config)
- `packages/extension/package.json` (updated scripts)
- `packages/extension/src/mcp-server/index.ts` (new entry point)
- `packages/extension/.vscodeignore` (updated exclusions)

## Testing Checklist
- [ ] Extension builds without errors
- [ ] MCP server bundle is executable
- [ ] No `vscode` API references in MCP server
- [ ] All tools register correctly
- [ ] Works on Windows (test with `.cmd` wrapper)
- [ ] Works on macOS (test with `zsh`)
- [ ] Works on Linux (test with `bash`)
- [ ] Bundle size within targets

## Success Metrics
- Clean build with no errors
- Extension package size <1MB
- MCP server starts independently
- All platforms tested and working