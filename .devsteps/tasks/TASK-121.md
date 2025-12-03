## Objective

Remove `affects/affected-by` from MCP server handlers and tool descriptions.

## Changes

**File: packages/mcp-server/src/handlers/link.ts (lines ~83-84)**

Remove from reverse mapping:
```typescript
const REVERSE_RELATIONS: Record<string, string> = {
  // ... existing
  blocks: 'blocked-by',
  'blocked-by': 'blocks',
  // REMOVE: affects: 'affected-by',
  // REMOVE: 'affected-by': 'affects',
  // ...
};
```

**File: packages/mcp-server/src/tools/index.ts (line ~233)**

Update description:
```typescript
description: 'Create a relationship between two items. HIERARCHY RULES (implements): Scrum: Epic→Story|Spike|Bug, Story→Task|Bug, Bug→Task. Waterfall: Requirement→Feature|Spike|Bug, Feature→Task|Bug, Bug→Task. FLEXIBLE (always allowed): relates-to, blocks, depends-on, tested-by, supersedes.',
```

**Remove from enum (lines ~251-252):**
```typescript
enum: [
  // ... existing
  'blocks',
  'blocked-by',
  // REMOVE: 'affects',
  // REMOVE: 'affected-by',
  'relates-to',
  // ...
]
```

## Validation

- Run `npm run build`
- Test MCP link tool accepts blocks/relates-to
- Test MCP link tool rejects affects