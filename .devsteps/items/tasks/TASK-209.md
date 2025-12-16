# Problem

Monorepo packages use `file:../shared` for local development, but this breaks when published to npm.

## Current State

```json
// packages/mcp-server/package.json
"dependencies": {
  "@schnick371/devsteps-shared": "file:../shared"  // ❌ BREAKS npm install
}

// packages/cli/package.json  
"dependencies": {
  "@schnick371/devsteps-shared": "file:../shared"  // ❌ BREAKS npm install
}
```

## Solution

Replace with workspace protocol that npm can resolve:

```json
"dependencies": {
  "@schnick371/devsteps-shared": "workspace:*"  // ✅ npm resolves to published version
}
```

OR use explicit version (needs manual sync):

```json
"dependencies": {
  "@schnick371/devsteps-shared": "0.8.1-next.6"  // ✅ Works but needs version updates
}
```

## Implementation

**Option 1: workspace: protocol** (RECOMMENDED)
- npm automatically resolves to local during development
- npm automatically uses published version during install
- No manual version sync needed
- Works with npm 7+

**Option 2: Explicit versions**
- Must update versions before each publish
- Risk of version mismatches
- More error-prone

**Choose Option 1!**

## Changes Needed

1. `packages/mcp-server/package.json`: `file:../shared` → `workspace:*`
2. `packages/cli/package.json`: `file:../shared` → `workspace:*`
3. Test: `npm pack` + extract + verify dependencies resolve
4. Re-publish 0.8.1-next.7 with fixed dependencies

## Testing

```bash
# After fix:
cd packages/mcp-server
npm pack
tar -tzf schnick371-devsteps-mcp-server-*.tgz | grep package.json
tar -xzf schnick371-devsteps-mcp-server-*.tgz
cat package/package.json | grep devsteps-shared
# Should show: "@schnick371/devsteps-shared": "0.8.1-next.6" (NOT file:)

# Test install:
cd /tmp
npm install --prefix test-install @schnick371/devsteps-mcp-server@next
ls test-install/node_modules/@schnick371/devsteps-shared
# Should exist!
```

## Impact

- Fixes BUG-049
- Enables MCP server to run from npm
- Unblocks all pre-release testing
- Required before publishing any future versions

Implements: BUG-049
