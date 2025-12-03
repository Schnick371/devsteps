## Objective

Add validation logic for `blocks` relation enabling Bug→Epic/Story/Requirement/Feature hierarchy.

## Problem

After moving `blocks` to HIERARCHY_RELATIONSHIPS, validation will be enforced. Need to add rules for:
- Bug `blocks` Epic/Story/Requirement/Feature (hierarchy)
- Other types still flexible (Story→Story, Task→Task)

## Solution Strategy

**Option 1: Modify validateRelationship() to bypass blocks for non-Bug types**
```typescript
// Before hierarchy validation, add:
if (relationType === 'blocks' && sourceType !== 'bug') {
  return { valid: true }; // Non-bug blocks are flexible
}
```

**Option 2: Add explicit Bug blocks validation in hierarchy functions**
```typescript
// In validateScrumHierarchy():
if (sourceType === 'bug' && relationType === 'blocks') {
  if (targetType === 'epic' || targetType === 'story') {
    return { valid: true };
  }
  return { valid: false, error: 'Bug can only block Epic or Story in Scrum' };
}

// In validateWaterfallHierarchy():
if (sourceType === 'bug' && relationType === 'blocks') {
  if (targetType === 'requirement' || targetType === 'feature') {
    return { valid: true };
  }
  return { valid: false, error: 'Bug can only block Requirement or Feature in Waterfall' };
}
```

**Recommended: Option 1** (simpler, preserves backward compatibility)

## Implementation

**File: packages/shared/src/core/validation.ts**

Add before line ~42 (before hierarchy checks):
```typescript
// Special case: blocks relation is flexible for non-Bug types (Jira 2025)
// Bug blocks Epic/Story validates via hierarchy, other types bypass
if (isHierarchyRelation(relationType) && relationType === 'blocks') {
  if (source.type !== 'bug') {
    return { valid: true }; // Story→Story, Task→Task still flexible
  }
  // Bug blocks goes through hierarchy validation below
}
```

**Then add Bug validation in hierarchy functions:**

In `validateScrumHierarchy()` after line ~139 (after Bug implements check):
```typescript
// Bug → Epic/Story via blocks (Jira hierarchy + blocking)
if (sourceType === 'bug' && relationType === 'blocks') {
  if (targetType === 'epic' || targetType === 'story') {
    return { valid: true };
  }
  return {
    valid: false,
    error: 'Bug can only block Epic or Story in Scrum',
    suggestion: 'Link Bug blocks Epic (epic-level defect) or Bug blocks Story (story-level defect).',
  };
}
```

In `validateWaterfallHierarchy()` after line ~225 (after Bug implements check):
```typescript
// Bug → Requirement/Feature via blocks (Jira hierarchy + blocking)
if (sourceType === 'bug' && relationType === 'blocks') {
  if (targetType === 'requirement' || targetType === 'feature') {
    return { valid: true };
  }
  return {
    valid: false,
    error: 'Bug can only block Requirement or Feature in Waterfall',
    suggestion: 'Link Bug blocks Requirement (requirement-level defect) or Bug blocks Feature (feature-level defect).',
  };
}
```

## Validation

- Unit test: Bug blocks Epic succeeds
- Unit test: Bug blocks Task fails
- Unit test: Story blocks Story succeeds (bypass)
- Unit test: Task blocks Task succeeds (bypass)