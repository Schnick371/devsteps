# Add Circular Reference Validation

## Objective
Prevent redundant/circular relationships like:
```json
"implements": ["EPIC-003"],
"relates-to": ["EPIC-003"]  // ❌ REDUNDANT!
```

## Implementation

### 1. Add Validation Function
**File**: `packages/shared/src/core/validation.ts`

```typescript
/**
 * Check for circular/redundant relationships
 */
export function detectCircularReference(
  sourceId: string,
  targetId: string,
  relationType: string,
  existingLinks: LinkedItems
): ValidationResult {
  // Check if opposite relation exists
  const oppositeRelation = getOppositeRelation(relationType);
  if (oppositeRelation && existingLinks[oppositeRelation]?.includes(targetId)) {
    return {
      valid: false,
      error: `Circular reference: ${sourceId} already has ${oppositeRelation} → ${targetId}`,
      suggestion: `Remove one of the redundant links`
    };
  }

  // Check if same relation exists (duplicate)
  if (existingLinks[relationType]?.includes(targetId)) {
    return {
      valid: false,
      error: `Duplicate link: ${sourceId} → ${relationType} → ${targetId} already exists`,
      suggestion: `Link already present, no action needed`
    };
  }

  return { valid: true };
}
```

### 2. Integration Points
- CLI `link` command - call before adding link
- MCP `link` handler - call before adding link
- Return helpful error to Copilot with guidance

## Acceptance Criteria
- [ ] Detects `implements` + `relates-to` to same target
- [ ] Detects duplicate links
- [ ] Returns clear error message
- [ ] Integrated in CLI + MCP link commands
- [ ] Test cases added

## Affected Files
- `packages/shared/src/core/validation.ts`
- `packages/cli/src/commands/link.ts`
- `packages/mcp-server/src/handlers/link.ts`