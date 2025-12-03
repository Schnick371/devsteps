## Objective

Remove `affects/affected-by` from CLI commands and descriptions.

## Changes

**File: packages/cli/src/commands/index.ts (lines ~437-438)**

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

**File: packages/cli/src/index.ts (line ~91)**

Update description:
```typescript
.description('Create a relationship between two items. HIERARCHY (implements): Scrum: Epic→Story|Spike|Bug, Story→Task|Bug, Bug→Task. Waterfall: Requirement→Feature|Spike|Bug, Feature→Task|Bug, Bug→Task. FLEXIBLE: relates-to, blocks, depends-on, tested-by, supersedes.')
```

**Update argument description (line ~93):**
```typescript
.argument('<relation-type>', 'Relation type: implements|tested-by|blocks|relates-to|depends-on|supersedes')
```

## Validation

- Run `npm run build`
- Test `devsteps link TASK-001 blocks STORY-001` succeeds
- Test `devsteps link TASK-001 affects STORY-001` fails with error