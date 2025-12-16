# Implementation Plan

Add default binary entry that matches the package name to enable npx usage.

## Changes Required

### packages/mcp-server/package.json
Add default binary matching package scope:
```json
"bin": {
  "devsteps-mcp-server": "bin/devsteps-mcp.js",  // NEW: Default for npx
  "devsteps-mcp": "bin/devsteps-mcp.js",          // Keep for compatibility
  "devsteps-mcp-tsx": "bin/devsteps-mcp-tsx.js"
}
```

## Why This Works
- npx looks for binary matching the last segment of package name
- `@schnick371/devsteps-mcp-server` → looks for `devsteps-mcp-server` binary
- Adding this entry makes `npx @schnick371/devsteps-mcp-server` work
- Keeps existing binaries for backward compatibility

## Testing
```bash
# Should work after fix
npx @schnick371/devsteps-mcp-server --help

# Should still work
npx @schnick371/devsteps-mcp-server devsteps-mcp --help
```

## Version Impact
- Requires new npm package release (0.8.6)
- Extension 0.8.4 will auto-use new version via @latest