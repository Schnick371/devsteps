# Relationship Validation Engine

## Problem
Currently no validation exists - users can create ANY relationship between ANY item types, violating methodology principles.

## Solution
Implement validation engine in shared package that enforces Scrum/Waterfall hierarchy rules.

## Implementation

### 1. Validation Function
**File:** `packages/shared/src/core/validation.ts`

```typescript
export interface ValidationResult {
  valid: boolean;
  error?: string;
  suggestion?: string;
}

export function validateRelationship(
  source: WorkItem,
  target: WorkItem,
  relationType: RelationType,
  methodology: 'scrum' | 'waterfall' | 'hybrid'
): ValidationResult {
  // "relates-to" always allowed
  if (relationType === 'relates-to') {
    return { valid: true };
  }
  
  // Methodology-specific validation
  if (methodology === 'scrum' || methodology === 'hybrid') {
    const scrumResult = validateScrumHierarchy(source, target, relationType);
    if (!scrumResult.valid && methodology === 'scrum') {
      return scrumResult;
    }
  }
  
  if (methodology === 'waterfall' || methodology === 'hybrid') {
    return validateWaterfallHierarchy(source, target, relationType);
  }
  
  return { valid: false, error: 'Unknown methodology' };
}
```

### 2. Scrum Validation Rules
```typescript
function validateScrumHierarchy(
  source: WorkItem,
  target: WorkItem,
  relationType: RelationType
): ValidationResult {
  // Epic → Story
  if (source.type === 'epic' && relationType === 'implements') {
    if (target.type === 'story') return { valid: true };
    return {
      valid: false,
      error: 'Epics can only implement Stories in Scrum',
      suggestion: 'Create a Story first, then link Epic → Story'
    };
  }
  
  // Story → Task
  if (source.type === 'story' && relationType === 'implements') {
    if (target.type === 'task') return { valid: true };
    return {
      valid: false,
      error: 'Stories can only implement Tasks in Scrum',
      suggestion: 'Create a Task, then link Story → Task'
    };
  }
  
  // Bug/Spike/Test → Story or standalone
  if (['bug', 'spike', 'test'].includes(source.type)) {
    if (relationType === 'implements' && target.type === 'story') {
      return { valid: true };
    }
    // Bugs/Spikes/Tests can be standalone (no implements link)
    return { valid: true };
  }
  
  return { valid: false, error: 'Invalid Scrum hierarchy' };
}
```

### 3. Waterfall Validation Rules
```typescript
function validateWaterfallHierarchy(
  source: WorkItem,
  target: WorkItem,
  relationType: RelationType
): ValidationResult {
  // Requirement → Feature
  if (source.type === 'requirement' && relationType === 'implements') {
    if (target.type === 'feature') return { valid: true };
    return {
      valid: false,
      error: 'Requirements can only implement Features in Waterfall',
      suggestion: 'Create a Feature first, then link Requirement → Feature'
    };
  }
  
  // Feature → Task
  if (source.type === 'feature' && relationType === 'implements') {
    if (target.type === 'task') return { valid: true };
    return {
      valid: false,
      error: 'Features can only implement Tasks in Waterfall',
      suggestion: 'Create a Task, then link Feature → Task'
    };
  }
  
  return { valid: false, error: 'Invalid Waterfall hierarchy' };
}
```

### 4. Relationship Type Schema
**File:** `packages/shared/src/schemas/relationships.ts`

```typescript
export const HIERARCHY_RELATIONSHIPS = [
  'implements',
  'implemented-by'
] as const;

export const FLEXIBLE_RELATIONSHIPS = [
  'relates-to',
  'blocks',
  'blocked-by',
  'depends-on',
  'required-by',
  'tested-by',
  'tests',
  'supersedes',
  'superseded-by'
] as const;

export type HierarchyRelation = typeof HIERARCHY_RELATIONSHIPS[number];
export type FlexibleRelation = typeof FLEXIBLE_RELATIONSHIPS[number];
export type RelationType = HierarchyRelation | FlexibleRelation;
```

## Integration Points
- CLI: Call before creating link
- MCP: Call before creating link
- Future: VS Code extension UI validation

## Testing
```typescript
// Valid cases
validateRelationship(epic, story, 'implements', 'scrum') // ✅
validateRelationship(story, task, 'implements', 'scrum') // ✅
validateRelationship(bug, story, 'relates-to', 'scrum') // ✅

// Invalid cases
validateRelationship(epic, task, 'implements', 'scrum') // ❌
validateRelationship(task, epic, 'implements', 'scrum') // ❌
```

## Success Criteria
- ✅ All validation rules implemented
- ✅ Helpful error messages with suggestions
- ✅ Tests covering valid/invalid cases
- ✅ Exported from shared package

## Dependencies
- Depends on: SPIKE-003 (validation approach confirmed)
