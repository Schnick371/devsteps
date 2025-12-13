# Migrate MCP Server Code to Extension Package

## Status: BLOCKED ⚠️

**Blocker**: esbuild bundling produces non-functional ESM bundles due to CJS compatibility shim injection.

## What Was Completed (TASK-133 to TASK-136)

✅ **TASK-133**: Copied 19 MCP server files to `packages/extension/src/mcp-server/`
- handlers/ (15 files)
- utilities (workspace.ts, logger.ts, shutdown.ts, http-server.ts, metrics.ts)
- tools/ (index.ts, health-check.ts)

✅ **TASK-134**: Verified imports use `@schnick371/devsteps-shared`

✅ **TASK-135**: Copied index.ts entry point (490 lines)

❌ **TASK-136**: Bundling FAILED - all ESM bundles produce runtime error:
```
Error: Dynamic require of "node:events" is not supported
```

## Root Cause

esbuild injects CJS compatibility code (`var N=(t=>typeof require<"u"?require:...`) even with:
- `format: 'esm'`
- `external: ['node:*']`
- `.mjs` output extension

One of the dependencies (commander, pino, or prom-client) uses CJS patterns that trigger this.

## Current Workaround

Extension continues using `npx @schnick371/devsteps-mcp-server` (external npm package).

## Path Forward - Options

### Option A: Fix esbuild Configuration
- Research why mcp-server package bundling worked before
- Find esbuild option to prevent CJS shim injection
- Possibly switch to different bundler (Rollup, Webpack)

### Option B: Abandon Bundling Goal
- Accept npm package dependency
- Clean up copied `src/mcp-server/` files (delete them)
- Update EPIC-015 to reflect architectural decision
- Focus on STORY-057 with npm package approach

### Option C: Use TypeScript Compiled Output
- Copy `packages/mcp-server/dist/*.js` (unbundled, works)
- Include all dependencies in extension VSIX
- Larger extension size but avoids bundling issues

## Recommendation

**Option B** - The npm package approach is simpler, more maintainable, and allows independent MCP server updates. GitLens architecture is aspirational but not mandatory.

## Affected Files (Currently Unused)
- `packages/extension/src/mcp-server/**/*` (19 files, 1918 lines)
- `packages/extension/esbuild.js` (disabled MCP server build)

## Decision Needed

Should we:
1. Continue investigating bundling solutions?
2. Accept npm package architecture?
3. Try alternative bundling approach?