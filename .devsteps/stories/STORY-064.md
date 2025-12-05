# Schema & Data Migration - Remove Priority Field

## Objective
Remove `priority` enum from shared schemas, keep only `eisenhower`. Migrate existing 281 work items.

## Schema Changes

**packages/shared/src/schemas/index.ts:**
- Remove `Priority` enum (line ~49)
- Remove `priority` from `WorkItemCore` (line ~138)
- Keep `eisenhower` field (already exists)
- Update defaults to use eisenhower

**packages/shared/src/types/index.ts:**
- Remove Priority type exports
- Update WorkItem interface

## Data Migration Script

Create `packages/shared/src/migration/remove-priority-field.ts`:

```typescript
// Map old priority to eisenhower
const priorityToEisenhower = {
  'critical': 'urgent-important',     // Q1
  'high': 'not-urgent-important',     // Q2  
  'medium': 'urgent-not-important',   // Q3
  'low': 'not-urgent-not-important'   // Q4
};

// For each item:
// 1. If has priority but no eisenhower → convert
// 2. If has both → keep eisenhower, remove priority
// 3. Update index.json
```

## Validation
- Verify all 281 items have eisenhower value
- No items retain priority field
- Index integrity maintained

## Affected Packages
- shared (schema source)
- cli (imports schemas)
- mcp-server (imports schemas)  
- extension (imports schemas)