# Prevent Conflicting Relation Types to Same Target

## Problem
Copilot creates **conflicting relationships** to the same item:
```json
BUG-027 {
  "implements": ["EPIC-003"],     // Formal hierarchy
  "relates-to": ["EPIC-003"]      // ❌ REDUNDANT! Informal association
}
```

This pollutes data and creates semantic confusion.

## Solution
**Hard block** multiple relation types to same target during link creation.

### Validation Rules

#### Block: Hierarchy + Any Other Type
```typescript
// ❌ INVALID - hierarchy conflicts with anything
implements + relates-to  → same target
implements + depends-on  → same target
implemented-by + blocks  → same target
```

#### Block: Multiple Hierarchy Types
```typescript
// ❌ INVALID - multiple formal relationships
implements + implemented-by → same target (creates cycle)
```

#### Allow: Same Type Multiple Times
```typescript
// ✅ VALID - duplicate check already exists
implements: ["STORY-001", "STORY-001"] → handled separately
```

#### Allow: Bidirectional Symmetric Relations
```typescript
// ✅ VALID - relates-to is symmetric by design
EPIC-003 { "relates-to": ["EPIC-010"] }
EPIC-010 { "relates-to": ["EPIC-003"] }
```

## Implementation

### 1. Add Validation Function
**File**: `packages/shared/src/core/validation.ts`

```typescript
/**
 * Prevent multiple relation types to same target
 * Block: hierarchy + flexible, or multiple hierarchy types
 * Allow: symmetric flexible relations (relates-to bidirectional)
 */
export function validateRelationConflict(
  sourceId: string,
  targetId: string,
  newRelationType: RelationType,
  existingLinks: LinkedItems
): ValidationResult {
  // Check all existing relations for conflicts
  for (const [existingType, targetIds] of Object.entries(existingLinks)) {
    if (existingType === newRelationType) continue; // Same type handled by duplicate check
    
    if (!targetIds.includes(targetId)) continue; // Different target = no conflict
    
    // Both are hierarchy = conflict
    if (isHierarchyRelation(newRelationType) && isHierarchyRelation(existingType)) {
      return {
        valid: false,
        error: `Cannot add ${newRelationType} to ${targetId} - already has hierarchy relation ${existingType}`,
        suggestion: `Remove ${existingType} first, or use a different relationship type`
      };
    }
    
    // Hierarchy + flexible = conflict
    if (isHierarchyRelation(newRelationType) || isHierarchyRelation(existingType)) {
      return {
        valid: false,
        error: `Cannot mix ${newRelationType} and ${existingType} to same target ${targetId}`,
        suggestion: `Use ${isHierarchyRelation(existingType) ? existingType : newRelationType} (hierarchy takes precedence)`
      };
    }
    
    // Multiple flexible relations = allowed (user might relate AND depend-on same item)
  }
  
  return { valid: true };
}
```

### 2. Integration Points

**CLI**: `packages/cli/src/commands/link.ts`
```typescript
// After hierarchy validation, before creating link
const conflictCheck = validateRelationConflict(
  args.source_id,
  args.target_id, 
  args.relation_type,
  sourceMetadata.linked_items
);

if (!conflictCheck.valid) {
  console.error(`❌ ${conflictCheck.error}`);
  console.log(`💡 ${conflictCheck.suggestion}`);
  process.exit(1);
}
```

**MCP**: `packages/mcp-server/src/handlers/link.ts`
```typescript
// After hierarchy validation
const conflictCheck = validateRelationConflict(
  args.source_id,
  args.target_id,
  args.relation_type,
  sourceMetadata.linked_items
);

if (!conflictCheck.valid) {
  return {
    success: false,
    error: conflictCheck.error,
    suggestion: conflictCheck.suggestion,
    validation_failed: true
  };
}
```

## Test Cases

```typescript
// ❌ Hierarchy + flexible
BUG-001.implements = ["EPIC-003"]
link(BUG-001, "relates-to", EPIC-003) → ERROR

// ❌ Multiple hierarchy
STORY-001.implements = ["EPIC-001"]  
link(STORY-001, "implemented-by", EPIC-001) → ERROR (creates cycle)

// ✅ Bidirectional flexible
EPIC-003.relates-to = ["EPIC-010"]
link(EPIC-010, "relates-to", EPIC-003) → OK (symmetric)

// ✅ Multiple flexible to same target (edge case, allowed)
TASK-001.depends-on = ["TASK-002"]
link(TASK-001, "relates-to", TASK-002) → OK (might relate AND depend)
```

## Acceptance Criteria
- [ ] Blocks hierarchy + flexible to same target
- [ ] Blocks multiple hierarchy types to same target  
- [ ] Allows bidirectional symmetric `relates-to`
- [ ] Allows multiple flexible types to same target
- [ ] Clear error messages for Copilot
- [ ] Integrated in CLI + MCP link commands
- [ ] Test cases pass

## Non-Goals
- ❌ Block dependency cycles (TASK-100 handles via doctor)
- ❌ Block all "circular" references (too broad)

## Related
- TASK-098: Update Copilot guidance
- TASK-100: Detect dependency cycles (doctor warning)
