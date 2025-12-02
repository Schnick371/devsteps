# Validation: Allow Bug → Epic/Requirement via relates-to + affects ✅

## Implementation Complete

### Changes Made

**1. Updated Scrum Bug Validation**
```typescript
// Bug cannot use "implements" - must use flexible relationships
if (sourceType === 'bug') {
  return {
    valid: false,
    error: 'Bugs cannot use "implements" relationship',
    suggestion: `Use "relates-to" (context) or "affects" (impact) to link Bug → Epic. Use Task to implement the fix (Task implements Bug).`,
  };
}
```

**2. Updated Waterfall Bug Validation**
```typescript
// Bug cannot use "implements" - must use flexible relationships
if (sourceType === 'bug') {
  return {
    valid: false,
    error: 'Bugs cannot use "implements" relationship',
    suggestion: `Use "relates-to" (context) or "affects" (impact) to link Bug → Requirement. Use Task to implement the fix (Task implements Bug).`,
  };
}
```

**3. Updated Test Suite**
- Changed: `Bug → Epic via implements` now expects `false` (invalid)
- Added: `Bug → Epic via relates-to` expects `true` (valid - context)
- Added: `Bug → Epic via affects` expects `true` (valid - impact)

### Verification Results

✅ Build passes
✅ TypeScript compilation successful
✅ **All 13 tests pass** (was 11, added 2 new tests)
✅ Bug → Epic via implements: **REJECTED** with helpful error
✅ Bug → Epic via relates-to: **ALLOWED** (flexible)
✅ Bug → Epic via affects: **ALLOWED** (flexible)
✅ Task → Bug still works (Task implements fix)

### Error Message Quality

**Scrum:**
```
Error: "Bugs cannot use \"implements\" relationship"
Suggestion: "Use \"relates-to\" (context) or \"affects\" (impact) to link Bug → Epic. Use Task to implement the fix (Task implements Bug)."
```

**Waterfall:**
```
Error: "Bugs cannot use \"implements\" relationship"
Suggestion: "Use \"relates-to\" (context) or \"affects\" (impact) to link Bug → Requirement. Use Task to implement the fix (Task implements Bug)."
```

### Impact

- **Breaking change** for existing workflows using `Bug implements Epic`
- **Semantically correct** - Bugs don't "implement" business initiatives
- **Industry-aligned** - Matches Jira/Azure DevOps 2025 best practices
- **Clear guidance** - Error messages explain what to use instead
- **Backward compatible** for Task → Bug (fix workflow unchanged)

### Files Modified

- `packages/shared/src/core/validation.ts` - Updated validateScrumHierarchy() and validateWaterfallHierarchy()
- `test-validation.js` - Updated Bug test case + added 2 new test cases
- `packages/shared/dist/**` - TypeScript compilation artifacts (auto-generated)

Implements: TASK-104
Refs: STORY-049