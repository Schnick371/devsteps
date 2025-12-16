# Problem

Build script in `packages/mcp-server/package.json` uses `tsc` instead of `tsc --build`.

With `"composite": true` in tsconfig.json, TypeScript requires `--build` flag to emit .js files.

## Current Behavior

```json
"build": "tsc && node esbuild.cjs --production && npm run copy:docs"
```

Result:
- `tsc` runs without error
- NO .js files emitted (only .d.ts declaration files)
- `node esbuild.cjs` creates bundle from TypeScript sources
- npm package missing individual .js files
- **bin/devsteps-mcp.js fails** because it imports `dist/index.js` (doesn't exist)

## Root Cause

From TypeScript docs:
> When `"composite": true`, tsc without `--build` skips emit phase in project reference mode

tsconfig.json has `"composite": true` (required for monorepo project references).

## Solution

Change build script to use `tsc --build`:

```json
"build": "tsc --build && node esbuild.cjs --production && npm run copy:docs"
```

This will emit:
- ✅ dist/index.js (stdio mode entry)
- ✅ dist/handlers/*.js (all handlers including health.js)
- ✅ dist/*.d.ts (TypeScript declarations)
- ✅ dist/index.bundled.mjs (HTTP mode entry from esbuild)

## Testing

After fix:
1. `rm -rf dist`
2. `npm run build`
3. Verify `dist/index.js` exists
4. Verify `dist/handlers/health.js` exists  
5. Test: `npx -y --package=file:. devsteps-mcp` (local package)

## Impact

- Fixes BUG-048 (npm @next package incomplete)
- Enables proper npm publication
- Unblocks pre-release testing
- Aligns with TASK-138 fix (which worked because it used correct tsc mode)

## Related

- Implements: BUG-048
- Regression from: TASK-138 (0.6.14 worked, but script was manually corrected)
- Affects: All MCP server versions with composite: true
