## Task

Update ItemMetadata schema regex to accept both 3-digit (legacy) and 4-digit (new) ID formats for backwards compatibility during transition.

## Implementation

**File:** `packages/shared/src/schemas/index.ts` (line 133)

**Change:**
```typescript
// OLD: id: z.string().regex(/^(EPIC|STORY|TASK|REQ|FEAT|BUG|SPIKE|TEST)-\d{3,}$/),
// NEW: id: z.string().regex(/^(EPIC|STORY|TASK|REQ|FEAT|BUG|SPIKE|TEST)-\d{3,4}$/),
```

## Validation

- Existing IDs valid: `TASK-001`, `STORY-070`, `EPIC-017` ✅
- New IDs valid: `TASK-0167`, `STORY-0071`, `EPIC-0018` ✅
- Invalid IDs rejected: `TASK-01` (2 digits), `TASK-00001` (5 digits) ❌

## Affected Components

- CLI: Uses schema for validation in add/update commands
- MCP Server: Uses schema for validation in tools
- Extension: Uses schema for TreeView validation

## Testing

Run TypeScript compiler and build to ensure no breaking changes:
```bash
npm run clean && npm install && npm run build
```

## Acceptance Criteria

- Schema regex updated to `\d{3,4}`
- TypeScript compiles with no errors
- All packages build successfully
- Existing tests pass (no regression)