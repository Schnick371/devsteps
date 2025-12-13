## Task

Update validation logic to treat `tested-by` and `tests` as hierarchy relationships (moved from flexible).

## Implementation

**File:** `packages/shared/src/core/validation.ts`

**Change:**
Validation now uses `isHierarchyRelation()` from RELATIONSHIP_CONFIG, which automatically includes tested-by/tests.

**New Rules:**

**Scrum:**
- Test → Epic (implements)
- Test → Story (implements)
- Test → Task (implements)

**Waterfall:**
- Test → Requirement (implements)
- Test → Feature (implements)
- Test → Task (implements)

**Validation Function:**
```typescript
import { isHierarchyRelation } from '../schemas/relationships.js';

export function validateRelationship(
  source: { id: string; type: ItemType },
  target: { id: string; type: ItemType },
  relationType: string,
  methodology: Methodology
): ValidationResult {
  // Skip validation for flexible relationships
  if (!isHierarchyRelation(relationType)) {
    return { valid: true };
  }

  // Validate hierarchy relationships (includes tested-by now!)
  if (relationType === 'implements' || relationType === 'tested-by') {
    return validateScrumHierarchy(source, target, methodology);
  }

  // ... rest of validation
}
```

**Add Test Validation:**
```typescript
function validateScrumHierarchy(
  source: { id: string; type: ItemType },
  target: { id: string; type: ItemType },
  methodology: Methodology
): ValidationResult {
  // ... existing validation ...

  // Test hierarchy validation (NEW!)
  if (source.type === 'test') {
    const validTargets = ['epic', 'story', 'task'];
    if (!validTargets.includes(target.type)) {
      return {
        valid: false,
        error: `Test can only implement Epic, Story, or Task (got ${target.type})`
      };
    }
    return { valid: true };
  }

  // ... rest
}
```

## Dependencies

- Depends on: TASK-175 (RELATIONSHIP_CONFIG with tested-by as hierarchy)

## Testing

```typescript
// Should pass
validateRelationship(
  { id: 'TEST-001', type: 'test' },
  { id: 'STORY-001', type: 'story' },
  'tested-by',
  'scrum'
); // ✅ valid

// Should fail
validateRelationship(
  { id: 'TEST-001', type: 'test' },
  { id: 'REQ-001', type: 'requirement' },
  'tested-by',
  'scrum'
); // ❌ Test cannot test Requirement in Scrum
```

## Acceptance Criteria

- tested-by/tests validated as hierarchy relationships
- Test can implement Epic/Story/Task (Scrum)
- Test can implement Requirement/Feature/Task (Waterfall)
- Invalid test relationships rejected
- All existing validations preserved
- Builds successfully