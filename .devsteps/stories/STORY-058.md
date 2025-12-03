# Story: Migrate MCP Server Code to Extension Package

## User Story
As a **DevSteps developer**, I need to **move the MCP server source code into the extension package** so that it can be **bundled and deployed as a single unit**.

## Acceptance Criteria
- [ ] Create `packages/extension/src/mcp-server/` directory structure
- [ ] Move all tool handlers from `packages/mcp-server/src/`
- [ ] Move shared utilities and types
- [ ] Update import paths to reference shared package
- [ ] Ensure no `vscode` API imports in MCP server code
- [ ] Configure esbuild to bundle MCP server separately
- [ ] Update tests to reference new locations
- [ ] Remove old MCP server package (deprecate)
- [ ] Update monorepo workspace configuration
- [ ] Document new structure in README

## New Directory Structure
```
packages/extension/
├── src/
│   ├── extension.ts              # Main extension entry
│   ├── mcpServerManager.ts       # MCP lifecycle management
│   ├── mcp-server/               # NEW: MCP server code
│   │   ├── index.ts              # Server entry point
│   │   ├── handlers/             # Tool handlers
│   │   │   ├── add.ts
│   │   │   ├── update.ts
│   │   │   ├── list.ts
│   │   │   ├── search.ts
│   │   │   ├── link.ts
│   │   │   ├── trace.ts
│   │   │   └── ...
│   │   ├── workspace.ts          # Workspace utilities
│   │   └── logger.ts             # MCP-specific logging
│   ├── treeView/
│   ├── webview/
│   └── utils/
├── dist/
│   ├── extension.js              # Extension bundle
│   └── mcp-server/
│       └── index.js              # MCP server bundle
├── esbuild.js                    # Dual-target build config
└── package.json
```

## Migration Steps

### 1. Create Directory Structure
```bash
mkdir -p packages/extension/src/mcp-server/handlers
```

### 2. Copy Tool Handlers
```bash
cp packages/mcp-server/src/handlers/*.ts \
   packages/extension/src/mcp-server/handlers/
```

### 3. Update Import Paths
```typescript
// Before (separate package)
import { ItemType } from '../types';

// After (shared package)
import { ItemType } from '@schnick371/devsteps-shared';
```

### 4. Create MCP Server Entry Point
```typescript
// packages/extension/src/mcp-server/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Import handlers
import { registerAddHandler } from './handlers/add.js';
import { registerUpdateHandler } from './handlers/update.js';
// ... more handlers

async function main() {
  const server = new Server({
    name: 'devsteps-mcp',
    version: '1.0.0'
  }, {
    capabilities: {
      tools: {},
      resources: {}
    }
  });

  // Register all handlers
  registerAddHandler(server);
  registerUpdateHandler(server);
  // ... more registrations

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

### 5. Update esbuild Configuration
```javascript
// Build MCP server separately
await esbuild.build({
  entryPoints: ['src/mcp-server/index.ts'],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  target: 'node18',
  outfile: 'dist/mcp-server/index.js',
  external: ['vscode'],
  banner: {
    js: '#!/usr/bin/env node'
  }
});
```

### 6. Update package.json Dependencies
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.4",
    "@schnick371/devsteps-shared": "workspace:*",
    "zod": "^3.23.8"
  }
}
```

## Code Quality Checks
- [ ] No `vscode` API imports in MCP server code
- [ ] All handlers use shared types from `@schnick371/devsteps-shared`
- [ ] Proper error handling in all handlers
- [ ] Logging uses MCP server logger (not extension logger)
- [ ] Environment variable access for workspace root

## Testing Requirements
- [ ] All handlers work from bundled location
- [ ] Import paths resolve correctly
- [ ] Shared package types accessible
- [ ] No circular dependencies
- [ ] Build succeeds without errors
- [ ] Tests pass with new structure

## Deprecation Plan
1. Mark `packages/mcp-server` as deprecated in README
2. Add migration notice to npm package
3. Publish final version with deprecation warning
4. Remove package in future major version

## Affected Files
- `packages/extension/src/mcp-server/**` (all new files)
- `packages/extension/esbuild.js` (updated config)
- `packages/extension/package.json` (new dependencies)
- `packages/extension/tsconfig.json` (updated paths)
- `packages/mcp-server/**` (to be deprecated)

## Success Metrics
- All files migrated successfully
- Build produces working bundle
- No import errors
- Extension activates and registers MCP server
- All tools function correctly