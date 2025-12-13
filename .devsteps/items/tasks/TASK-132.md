# Fix MCP Server bin Configuration - TypeScript Bundler Resolution Issue

**Status:** ✅ COMPLETED  
**Version:** 0.6.14 published and working  
**Date:** Dec 3, 2025

## Summary

MCP server versions 0.6.4-0.6.13 ALL failed when installed from npm. Root cause: TypeScript `"moduleResolution": "Bundler"` doesn't emit `.js` files (designed for Vite/Bun, not Node.js).

**Solution:** Changed to `"Node16"` resolution → tsc now emits `.js` files → npm package works!

## Root Cause Analysis (Dec 3, 2025)

### The REAL Problem
**TypeScript "moduleResolution": "Bundler"** prevents `.js` file emission!

This setting is designed for bundlers that read TypeScript directly (Vite, Bun, esbuild). Node.js cannot run TypeScript, so it needs runtime `.js` files - but tsc doesn't emit them with "Bundler" resolution.

### Current Error Symptoms
```
# When bin points to index.js:
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/dist/index.js'

# When bin points to index.bundled.mjs:
Error: Dynamic require of "node:events" is not supported
at file:///.../devsteps-mcp-server/dist/index.bundled.mjs:3:382
```

### Complete Investigation Timeline

**Version Testing Results:**
- 0.6.13: `index.js` not found (just published - broken!) ❌
- 0.6.12: `bundled.mjs` dynamic require error (unpublished) ❌
- 0.6.10: `bundled.mjs` dynamic require error ❌
- 0.6.9: `bundled.mjs` dynamic require error ❌
- 0.6.5: `bundled.mjs` dynamic require error ❌
- 0.6.4: `index.js` not found ❌
- **0.6.1: WORKS!** ✅ (has `dist/index.js` 13.2kB)
- **0.5.10: WORKS!** ✅

**Git History:**
- Commit 82aedac (today): Bin → `index.js` (but file doesn't exist!)
- Commit 0686460: Bin → `index.bundled.mjs` (dynamic require error)
- Commit 352e280: Bin → `index.bundled.mjs` (broke)
- Commit d08c15f: Bin → `index.js` (worked locally with tsc --watch)
- Commits before 0.6.4: `index.js` (worked by accident!)

**Package Content Analysis:**
```bash
# Version 0.6.1 (WORKING):
dist/index.js              # 13.2kB ✅
dist/index.bundled.mjs     # 2.5MB ✅
dist/http-server.js        # ✅
dist/logger.js             # ✅
dist/metrics.js            # ✅
dist/shutdown.js           # ✅
dist/workspace.js          # ✅
dist/handlers/*.js         # ✅

# Version 0.6.13 (BROKEN):
dist/index.bundled.mjs     # 2.5MB ✅ (but has errors)
dist/handlers/*.js         # ✅
# MISSING: index.js, http-server.js, logger.js, metrics.js, shutdown.js, workspace.js
```

### Why Did 0.6.1 Work?
**Version 0.6.1 worked BY ACCIDENT!** Someone had `npm run dev` (= `tsc --watch`) running during development, which created `.js` files, and those got published. 

But `tsc` alone (in build script) with `"moduleResolution": "Bundler"` **does NOT emit files**.

### Failed Solutions (DO NOT REPEAT!)
1. ❌ Change bin to `index.bundled.mjs` → Dynamic require error
2. ❌ Change bin to `index.js` → File doesn't exist in package
3. ❌ Unpublish and re-publish with different bin → Same problems
4. ❌ Test older versions hoping to find working config → All broken except 0.6.1 (accident)

### Circular Problem Pattern
This appeared to be a circular refactoring trap, but it's actually a **systemic build configuration error**:
- `index.js` doesn't exist (tsconfig doesn't emit)
- `index.bundled.mjs` has errors (esbuild dynamic require issue)
- Neither option works!

## Solution

### Fix TypeScript Configuration
Change `"moduleResolution": "Bundler"` to `"Node16"` in `packages/mcp-server/tsconfig.json`.

**Why Node16?**
- ✅ Emits `.js` files that Node.js can execute
- ✅ Standard for Node.js ESM packages
- ✅ Matches CLI package configuration (which works!)
- ✅ Proper ESM import/export resolution

**Alternative (NOT chosen):** Fix esbuild bundle to handle dynamic requires - more complex, deeper debugging needed.

### Correct Configuration After Fix

```json
// packages/mcp-server/tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "Node16",  // Changed from "Bundler"
    // ... rest unchanged
  }
}
```

```javascript
// bin/devsteps-mcp.js (correct)
#!/usr/bin/env node
import '../dist/index.js';  // ✅ TypeScript compiled ESM
```

### Build Process After Fix

```bash
npm run build
  ├─ tsc                    # → dist/index.js + all .js files ✅
  ├─ node esbuild.cjs       # → dist/index.bundled.mjs (HTTP mode) ✅
  └─ npm run copy:docs      # → .devsteps/ documentation
```

**Result:** Both stdio mode (index.js) and HTTP mode (bundled.mjs) work!

## Implementation Steps (COMPLETED)

1. ✅ **Unpublished broken version 0.6.13**
2. ✅ **Fixed tsconfig.json:**
   - Changed `"moduleResolution": "Bundler"` → `"Node16"`
   - Changed `"module": "ESNext"` → `"Node16"` (required by Node16 resolution)
3. ✅ **Fixed simple-git imports:**
   - Changed `import simpleGit from 'simple-git'` → `import { simpleGit } from 'simple-git'`
   - Files: `src/handlers/add.ts`, `src/handlers/update.ts`
   - Reason: Node16 ESM resolution requires named imports
4. ✅ **Verified bin file:** Already correct (`import '../dist/index.js'`)
5. ✅ **Bumped version to 0.6.14**
6. ✅ **Built and verified:**
   - `npm run clean && npm run build`
   - Confirmed dist/ contains: index.js (16KB), http-server.js, logger.js, metrics.js, shutdown.js, workspace.js
7. ✅ **Tested locally:**
   - `node dist/index.js` → MCP server started successfully
   - All 15 tools registered
8. ✅ **Published:** `@schnick371/devsteps-mcp-server@0.6.14`
9. ✅ **Verified from npm:**
   - `npx -y --package=@schnick371/devsteps-mcp-server@0.6.14 devsteps-mcp`
   - Works perfectly! ✨

## Results

**Version 0.6.14 is the FIRST working MCP server version installed from npm since 0.6.1!**

Package now contains:
- ✅ `dist/index.js` (16.0kB) - stdio mode entry point
- ✅ `dist/index.bundled.mjs` (2.5MB) - HTTP mode entry point  
- ✅ All supporting .js files (http-server, logger, metrics, shutdown, workspace)
- ✅ All handler .js files
- ✅ Complete type definitions (.d.ts)

## Prevention Rules

**TypeScript Configuration for Node.js Packages:**
- ✅ Use `"moduleResolution": "Node16"` or `"NodeNext"` for Node.js packages
- ❌ NEVER use `"moduleResolution": "Bundler"` for packages that run in Node.js
- 💡 "Bundler" is ONLY for tools that read TypeScript directly (Vite, Bun)

**Testing Before Publishing:**
- ✅ Always `npm pack` and test with `npx ./package.tgz` before publishing
- ✅ Check that dist/ contains ALL expected .js files (not just .d.ts)
- ✅ Run `ls -la dist/` to verify file existence
- ❌ NEVER publish without local testing

**Build Verification:**
- ✅ `tsc` must create `.js` files, not just `.d.ts` files
- ✅ If dist/ only has .d.ts files → tsconfig is wrong!
- ✅ Compare with working version (0.6.1) to see expected files

**If MCP Server Fails to Start:**
1. Check if `dist/index.js` exists in published package
2. Check tsconfig `moduleResolution` setting
3. Test with `npm pack` locally before publishing
4. Read this task to avoid repeating mistakes

## Files Modified
- `packages/mcp-server/tsconfig.json` (moduleResolution: Bundler → Node16)
- `packages/mcp-server/package.json` (version: 0.6.13 → 0.6.14)
- `.devsteps/tasks/TASK-138.md` (documentation)

## Related
- Versions 0.6.4-0.6.13: ALL broken (never worked via npm)
- Version 0.6.1: Worked by accident (had tsc --watch running)
- Version 0.5.10: Worked by accident
- CLI package: SAME ISSUE DISCOVERED (see CLI Analysis section below)

---

## CLI Package Analysis (Dec 3, 2025)

### Current CLI Configuration
**packages/cli/tsconfig.json:**
- ✅ `"module": "Node16"` (correct)
- ✅ `"moduleResolution": "Node16"` (correct)

**packages/cli/package.json:**
- ❌ NO `"type": "module"` field
- ✅ `"bin": { "devsteps": "./dist/index.cjs" }` (points to bundled version)

### The Problem
When `"module": "Node16"` is used WITHOUT `"type": "module"` in package.json:
- TypeScript generates **ESM code** (import/export)
- Node.js interprets files as **CommonJS** (because no type field)
- Result: **"The current file is a CommonJS module whose imports will produce 'require' calls; however, the referenced file is an ECMAScript module"**

### Why CLI 0.6.11 Works
CLI was built BEFORE the shared package had `"type": "module"`. The old build succeeded and the bundled `index.cjs` was published. Now:
- ✅ Published version 0.6.11 works (has old bundled index.cjs)
- ❌ **Local rebuild FAILS** (22 TypeScript errors)
- ❌ **Cannot be rebuilt from source!**

### Testing Results
```bash
# Published version works:
npx @schnick371/devsteps-cli@0.6.11 --version
# Output: 0.1.0 ✅

# Local rebuild fails:
npm run build
# ERROR: TS1479: The current file is a CommonJS module... ❌
```

### CLI vs MCP Comparison

| Aspect | MCP Server | CLI |
|--------|-----------|-----|
| **tsconfig module** | ~~"Bundler"~~ → "Node16" ✅ | "Node16" ✅ |
| **package.json type** | ✅ "module" | ❌ Missing |
| **bin target** | `dist/index.js` (tsc output) | `dist/index.cjs` (esbuild bundle) |
| **Build strategy** | tsc + esbuild (dual) | tsc + esbuild (bundle only) |
| **Current status** | ✅ Fixed in 0.6.14 | ⚠️ Published works, rebuild fails |

### Root Cause
**Shared package added `"type": "module"` but CLI package.json doesn't have it!**

When CLI imports from `@schnick371/devsteps-shared`:
- Shared is ESM (has "type": "module")
- CLI is CommonJS (no "type" field)
- TypeScript detects mismatch → 22 errors

### Solution for CLI
Add `"type": "module"` to `packages/cli/package.json`:

```json
{
  "name": "@schnick371/devsteps-cli",
  "version": "0.6.11",
  "type": "module",  // ← ADD THIS
  // ... rest
}
```

### Impact Assessment
1. ✅ Published CLI 0.6.11 still works (bundled binary)
2. ❌ Cannot rebuild 0.6.11 from source
3. ⚠️ All future CLI development blocked until fixed
4. 🔧 Simple fix: Add "type": "module" + rebuild

### Files to Modify (COMPLETED)
- ✅ `packages/cli/package.json` (added "type": "module")
- ✅ `packages/cli/package.json` (bumped to 0.6.12)

### Results - CLI 0.6.12
✅ **Local rebuild now works!** (was failing with 22 TypeScript errors)
✅ **Published and tested via npm:** `npx @schnick371/devsteps-cli@0.6.12` works
✅ **All .js files generated correctly**
✅ **index.cjs bundled successfully** (867KB)
✅ **Package size reduced:** 325KB → 182KB (due to proper tree-shaking with ESM)

### CLI Testing
```bash
# Build test:
npm run build
# Result: SUCCESS (was failing before) ✅

# Local test:
node dist/index.cjs --version
# Output: 0.1.0 ✅

# npm test:
npx @schnick371/devsteps-cli@0.6.12 devsteps --version
# Output: 0.1.0 ✅
```

### Prevention
**CRITICAL: When using ESM in monorepo:**
- ✅ ALL packages must have `"type": "module"` in package.json
- ✅ Root package.json should also have `"type": "module"`
- ✅ Test local rebuild before publishing
- ✅ If shared is ESM, ALL consumers must be ESM
