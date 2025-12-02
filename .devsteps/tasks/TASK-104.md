# Validation: Allow Bug → Epic/Requirement via relates-to + affects

## Task
Update validation rules to allow Bug → Epic/Requirement relationships using both "relates-to" (context) and "affects" (impact).

## Current State
Bug validation only accepts "implements" to Epic/Requirement, which is semantically incorrect.

## Changes Required

### 1. Update validation.ts (Scrum)
```typescript
// Bug validation - allow flexible relationships to Epic
if (sourceType === 'bug') {
  if (relationType === 'relates-to' || relationType === 'affects') {
    return targetType === 'epic'; // Context or Impact
  }
  if (relationType === 'implemented-by') {
    return targetType === 'task'; // Solution
  }
}
```

### 2. Update validation.ts (Waterfall)
```typescript
// Bug validation - allow flexible relationships to Requirement
if (sourceType === 'bug') {
  if (relationType === 'relates-to' || relationType === 'affects') {
    return targetType === 'requirement'; // Context or Impact
  }
  if (relationType === 'implemented-by') {
    return targetType === 'task'; // Solution
  }
}
```

### 3. Update Error Messages
```typescript
// Guidance for Bug relationships
'Bug can use "relates-to" (context) or "affects" (impact) to Epic/Requirement, or "implemented-by" for Task solution'
```

### 4. Update test-validation.js
```javascript
// Test: Bug → Epic via relates-to
validateRelationship({ type: 'bug' }, 'relates-to', { type: 'epic' }) // Should pass

// Test: Bug → Epic via affects
validateRelationship({ type: 'bug' }, 'affects', { type: 'epic' }) // Should pass
```

## Acceptance Criteria
- [ ] Scrum validation allows Bug → Epic via relates-to + affects
- [ ] Waterfall validation allows Bug → Requirement via relates-to + affects
- [ ] Error messages guide users toward correct types
- [ ] All existing tests pass
- [ ] New tests for relates-to + affects pass