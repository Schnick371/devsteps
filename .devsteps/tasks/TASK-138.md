# Fix MCP Server bin Configuration - Circular Problem Prevention

## Root Cause Analysis

### Problem
MCP server bin file keeps getting changed between `index.js` and `index.bundled.mjs`, creating a circular refactoring trap.

Current error:
```
Error: Dynamic require of "node:events" is not supported
at file:///.../devsteps-mcp-server/dist/index.bundled.mjs:3:382
```

### Investigation Results

**Git History:**
- Commit 352e280: Bin → `index.bundled.mjs` (broke)
- Commit d08c15f: Bin → `index.js` (fixed)
- Current commit: Bin → `index.bundled.mjs` (broke again)

**Testing:**
- Version 0.6.5: Bundled version has dynamic require error ❌
- Version 0.6.10-0.6.12: Same error ❌
- ALL bundled versions fail

### Circular Problem Pattern
This is a **circular refactoring trap**:
1. Change A: Bin → index.bundled.mjs (breaks with dynamic require)
2. Change B: Bin → index.js (fixes it)
3. Forgot why, so Change A again: Bin → index.bundled.mjs (breaks again)
4. Repeat...

## Solution

**MCP Server stdio mode does NOT need bundling!**

- `dist/index.js` = TypeScript compiled ESM → **Works perfectly for MCP stdio**
- `dist/index.bundled.mjs` = esbuild bundle → **Has dynamic require issues, only for HTTP mode**

### Correct Configuration

```javascript
// bin/devsteps-mcp.js (CORRECT)
#!/usr/bin/env node
import '../dist/index.js';  // ✅ TypeScript compiled ESM
```

```javascript
// bin/devsteps-mcp.js (WRONG - causes circular problem)
#!/usr/bin/env node
import '../dist/index.bundled.mjs';  // ❌ esbuild bundle has node:events issue
```

## Build Process Explained

```bash
npm run build
  ├─ tsc                    # → dist/index.js (MCP stdio entry point) ✅
  ├─ node esbuild.cjs       # → dist/index.bundled.mjs (HTTP server) ⚠️
  └─ npm run copy:docs      # → .devsteps/ documentation
```

## Implementation Steps

1. **Fix bin file:**
   ```bash
   # packages/mcp-server/bin/devsteps-mcp.js
   #!/usr/bin/env node
   import '../dist/index.js';
   ```

2. **Unpublish broken versions:**
   ```bash
   npm unpublish @schnick371/devsteps-mcp-server@0.6.12 --force
   ```

3. **Bump version to 0.6.13**

4. **Build and publish:**
   ```bash
   cd packages/mcp-server
   npm run build
   npm publish --access public
   ```

5. **Test:**
   ```bash
   npx -y --package=@schnick371/devsteps-mcp-server@0.6.13 devsteps-mcp --help
   ```

## Prevention Rules

**NEVER change `bin/devsteps-mcp.js` to point to bundled version!**

- ✅ MCP stdio mode: Use `dist/index.js` (TypeScript compiled)
- ⚠️ HTTP server mode: Uses `dist/index.bundled.mjs` internally
- 🚫 NEVER: Point bin to bundled version (causes dynamic require errors)

**If someone suggests changing bin to bundled:**
1. Read this task first
2. Test with `npx` before committing
3. Remember: bundled version has node:events issues

## Files Modified
- `packages/mcp-server/bin/devsteps-mcp.js`
- `packages/mcp-server/package.json` (version bump)

## Related
- Commit 352e280 (wrong direction - to bundled)
- Commit d08c15f (correct direction - to index.js)
