# Test bundled MCP server executable

## Testing Results

**Bundling Approach: ABANDONED**
- Attempted esbuild bundling with ESM format (`.js` and `.mjs` extensions)
- All attempts failed with: `Error: Dynamic require of "node:events" is not supported`
- Root cause: esbuild injects CJS compatibility shims (`var N=(t=>typeof require<"u"?require:...`) that break ESM execution
- Issue persists even with `external: ['node:*']`, `format: 'esm'`, and `.mjs` output

**Solution: Use npm Package Directly**
- Extension now uses published `@schnick371/devsteps-mcp-server` package via `npx`
- Removed bundling complexity from extension build (esbuild.js simplified)
- MCP server execution: `npx @schnick371/devsteps-mcp-server` (auto-installs on first run)
- Verified working: `node packages/mcp-server/dist/index.js --help` ✅

**Build Changes:**
- Disabled `mcpServerBuildOptions` in `packages/extension/esbuild.js`
- Removed MCP server bundle generation from build process
- Extension remains at 339.9 KB (no MCP server code included)

**Benefits:**
- No ESM/CJS interop issues
- Simpler extension packaging
- MCP server updates independent of extension releases
- Users always get latest MCP server via npm