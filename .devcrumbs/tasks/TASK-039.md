# CLI: Enforce Relationship Validation

## Problem
CLI currently allows creating any relationship without validation.

## Solution
Integrate validation engine from shared package in `add` and `link` commands.

## Implementation

### 1. Import Validation
```typescript
import { validateRelationship } from '@devcrumbs/shared';
```

### 2. Modify `link` Command
**File:** `packages/cli/src/commands/link.ts`

```typescript
export async function linkCommand(
  sourceId: string,
  relationType: string,
  targetId: string,
  options: { force?: boolean }
) {
  const devcrumbsPath = path.join(process.cwd(), '.devcrumbs');
  
  // Load items
  const sourceResult = await getItem(devcrumbsPath, sourceId);
  const targetResult = await getItem(devcrumbsPath, targetId);
  
  if (!sourceResult.metadata || !targetResult.metadata) {
    console.error('Item not found');
    return;
  }
  
  // Load project config for methodology
  const config = await loadProjectConfig(devcrumbsPath);
  const methodology = config.methodology || 'hybrid';
  
  // Validate relationship (unless --force)
  if (!options.force) {
    const validation = validateRelationship(
      sourceResult.metadata,
      targetResult.metadata,
      relationType as RelationType,
      methodology
    );
    
    if (!validation.valid) {
      console.error(chalk.red('✗'), validation.error);
      if (validation.suggestion) {
        console.log(chalk.yellow('💡'), validation.suggestion);
      }
      console.log(chalk.gray('\nUse --force to override validation'));
      process.exit(1);
    }
  }
  
  // Proceed with linking...
}
```

### 3. Add --force Flag
Allow override for special cases:
```bash
devcrumbs link EPIC-001 implements TASK-001 --force
```

### 4. Helpful Error Messages
Examples:
```
✗ Epics can only implement Stories in Scrum
💡 Create a Story first, then link Epic → Story

✗ Invalid relationship type 'foo'
💡 Valid types: implements, relates-to, depends-on, blocks, tested-by
```

### 5. Update Help Text
```bash
devcrumbs link --help

Options:
  --force    Override validation rules (use with caution)
  
Relationship Types:
  Hierarchy (validated):
    implements       Parent implements child (Epic→Story, Story→Task)
    
  Flexible (always allowed):
    relates-to       General relationship between any items
    blocks           Item blocks another from progressing
    depends-on       Item depends on another
    tested-by        Item is tested by test case
```

## Testing Scenarios

### Valid Cases
```bash
# Scrum hierarchy
devcrumbs link EPIC-001 implements STORY-001  # ✅
devcrumbs link STORY-001 implements TASK-001  # ✅

# Flexible relationships
devcrumbs link TASK-001 relates-to TASK-002   # ✅
devcrumbs link BUG-001 blocks STORY-001       # ✅
```

### Invalid Cases (with helpful errors)
```bash
# Scrum hierarchy violation
devcrumbs link EPIC-001 implements TASK-001
# ✗ Epics can only implement Stories in Scrum
# 💡 Create a Story first, then link Epic → Story

# Wrong direction
devcrumbs link TASK-001 implements EPIC-001
# ✗ Tasks cannot implement Epics
# 💡 Use: Epic → Story → Task hierarchy
```

### Force Override
```bash
devcrumbs link EPIC-001 implements TASK-001 --force
# ⚠️  Validation overridden
# ✓ Linked EPIC-001 --implements--> TASK-001
```

## Success Criteria
- ✅ Validation integrated in link command
- ✅ Clear error messages with suggestions
- ✅ --force flag for overrides
- ✅ Help text updated
- ✅ All test scenarios pass

## Dependencies
- Depends on: TASK-038 (validation engine)
