## Objective

Add defensive validation to `getWorkspacePath()` to prevent crashes when no workspace is available.

## Implementation

**File:** `packages/mcp-server/src/workspace.ts`

**Current Code:**
```typescript
export function getWorkspacePath(): string {
  const workspaceArg = process.argv[2];
  return workspaceArg || process.cwd();
}
```

**New Code:**
```typescript
export function getWorkspacePath(): string {
  const workspaceArg = process.argv[2];
  const cwd = process.cwd();
  const workspacePath = workspaceArg || cwd;
  
  if (!workspacePath) {
    throw new Error(
      'No workspace path available. DevSteps requires a workspace folder. ' +
      'Please open a folder in VS Code or provide a path argument.'
    );
  }
  
  return workspacePath;
}
```

## Testing

1. Build MCP server: `npm run build`
2. Test with workspace: `node dist/index.js /path/to/workspace`
3. Test without workspace: `node dist/index.js` (should show helpful error)
4. Test in VS Code with no folder open (should show error, not crash)

## Acceptance Criteria

- ✅ Function validates workspace path exists
- ✅ Throws helpful error message when undefined
- ✅ No silent failures or undefined returns
- ✅ All existing tests pass
- ✅ Error message guides user to solution