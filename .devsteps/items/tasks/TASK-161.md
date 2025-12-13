# MCP Server: Rename Tool Parameter eisenhower → priority

## Context

MCP tool schemas currently have BOTH legacy `priority` (critical/high/medium/low) AND `eisenhower` fields. This creates confusion for AI agents using the tools.

After STORY-064, we need to:
1. Remove legacy `priority` field completely
2. Rename `eisenhower` → `priority` for external API
3. Keep internal `eisenhower` field in JSON/schemas

## Scope

### Tool Schema Updates (packages/mcp-server/src/tools/index.ts)

**devsteps-add tool:**
```typescript
// REMOVE this legacy field
priority: {
  type: 'string',
  enum: ['critical', 'high', 'medium', 'low'],
  description: 'Priority level',
},

// RENAME eisenhower → priority (external parameter)
priority: {  // was: eisenhower
  type: 'string',
  enum: [
    'urgent-important',
    'not-urgent-important', 
    'urgent-not-important',
    'not-urgent-not-important',
  ],
  description: 'Priority (Eisenhower Matrix): urgent-important (Q1), not-urgent-important (Q2), urgent-not-important (Q3), not-urgent-not-important (Q4)',
},
```

**devsteps-update tool:**
- Same pattern: remove legacy `priority`, rename `eisenhower` → `priority`

**devsteps-list tool:**
- Update filter parameter from `eisenhower` → `priority`

### Handler Updates

**add handler (packages/mcp-server/src/handlers/add.ts):**
```typescript
// Map external 'priority' parameter → internal 'eisenhower' field
const eisenhowerValue = args.priority; // external param
metadata.eisenhower = eisenhowerValue; // internal field
```

**update handler:**
- Same normalization pattern

**list handler:**
- Filter by `args.priority` parameter
- Match against internal `item.eisenhower` field

## Backward Compatibility

- External API: Use `priority` parameter (user-friendly)
- Internal storage: Keep `eisenhower` field (no breaking changes to data)
- No migration needed - only parameter rename

## Testing

```javascript
// Test with AI agent or HTTP client
{
  "tool": "devsteps-add",
  "arguments": {
    "type": "task",
    "title": "Test priority parameter",
    "priority": "urgent-important"  // NEW parameter name
  }
}

// Should store as:
{
  "eisenhower": "urgent-important"  // Internal field unchanged
}
```

## Success Criteria

- Legacy `priority` field removed from all tool schemas
- External parameter renamed to `priority` (Eisenhower values)
- Handlers correctly map `args.priority` → `metadata.eisenhower`
- AI agents see clear, single priority system
- No breaking changes to stored data
