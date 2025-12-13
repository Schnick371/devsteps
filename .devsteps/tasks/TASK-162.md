# Extension MCP Server: Rename Tool Parameter eisenhower → priority

## Context

The VS Code extension has an embedded MCP server (duplicate of main MCP server) that also needs the parameter rename from `eisenhower` → `priority`.

This is the same change as TASK-161 but for the extension's embedded server.

## Scope

### Tool Schema Updates (packages/extension/src/mcp-server/tools/index.ts)

Same as TASK-161:
1. Remove legacy `priority` field (critical/high/medium/low)
2. Rename `eisenhower` → `priority` parameter
3. Update descriptions to use "Priority" terminology

### Handler Updates

**add/update/list handlers:**
- Map `args.priority` → internal `eisenhower` field
- Same normalization as TASK-161

### Documentation Updates (handlers/init.ts)

Update embedded devsteps agent documentation:

```typescript
// OLD example in init handler
- priority: "high"

// NEW example
- priority: "urgent-important"
```

Update workflow examples to use `priority` parameter instead of `eisenhower`.

## Relationship to TASK-161

- Same changes, different codebase location
- Extension's MCP server is a duplicate of main MCP server
- Both should be updated together for consistency

## Testing

Test through extension's TreeView or MCP integration:
1. Add item via extension MCP server
2. Verify `priority` parameter accepted
3. Verify stored as `eisenhower` field internally

## Success Criteria

- Extension MCP tools use `priority` parameter
- Init handler documentation uses `priority` examples
- Consistent with main MCP server (TASK-161)
- No breaking changes to extension functionality
