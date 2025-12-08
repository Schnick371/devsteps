## Task

Update `generateItemId()` to optionally append user postfix based on config.

## Implementation

**File:** `packages/shared/src/utils/index.ts` (line 112)

**Signature Change:**
```typescript
export function generateItemId(
  type: string,
  counter: number,
  config?: {
    prefixes?: Record<string, string>;
    userPostfixEnabled?: boolean;
    userPostfixSeparator?: string;
    userInitials?: string;
  }
): string {
  const defaultPrefixes = { /* ... */ };
  const prefixMap = config?.prefixes || defaultPrefixes;
  const prefix = prefixMap[type] || 'ITEM';
  const paddedNumber = counter.toString().padStart(4, '0');
  
  let id = `${prefix}-${paddedNumber}`;
  
  // Append user postfix if enabled
  if (config?.userPostfixEnabled && config?.userInitials) {
    const separator = config.userPostfixSeparator || '-';
    id += `${separator}${config.userInitials.toUpperCase()}`;
  }
  
  return id;
}
```

## Examples

**Without postfix:**
```typescript
generateItemId('task', 167) 
// => "TASK-0167"
```

**With postfix:**
```typescript
generateItemId('task', 167, {
  userPostfixEnabled: true,
  userInitials: 'TH'
})
// => "TASK-0167-TH"
```

## Dependencies

- Depends on: TASK-170 (config schema), TASK-171 (regex validation)

## Integration Points

- CLI: Pass config to `generateItemId()`
- MCP Server: Read config, pass to `generateItemId()`
- Extension: Read config, pass to `generateItemId()`

## Testing

```typescript
// Test cases
console.log(generateItemId('task', 167)); // TASK-0167
console.log(generateItemId('task', 167, { 
  userPostfixEnabled: true, 
  userInitials: 'th' 
})); // TASK-0167-TH
console.log(generateItemId('story', 71, { 
  userPostfixEnabled: true, 
  userPostfixSeparator: '/',
  userInitials: 'MS' 
})); // STORY-0071/MS
```

## Acceptance Criteria

- Function generates IDs with optional postfix
- Postfix auto-uppercase
- Separator configurable
- Backwards compatible (postfix disabled by default)
- All packages build successfully