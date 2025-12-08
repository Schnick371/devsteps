## Task

Update `generateItemId()` to read digit padding and user postfix from config's `id_generation` settings.

## Implementation

**File:** `packages/shared/src/utils/index.ts` (line 112)

**New Signature:**
```typescript
export function generateItemId(
  type: string,
  counter: number,
  config?: {
    prefixes?: Record<string, string>;
    id_generation?: {
      digit_padding?: number;
      user_postfix_enabled?: boolean;
      user_postfix_separator?: string;
      default_user_initials?: string;
    };
  }
): string {
  const defaultPrefixes = { /* ... */ };
  const prefixMap = config?.prefixes || defaultPrefixes;
  const prefix = prefixMap[type] || 'ITEM';
  
  // Get padding from config (default: 4)
  const padding = config?.id_generation?.digit_padding || 4;
  const paddedNumber = counter.toString().padStart(padding, '0');
  
  let id = `${prefix}-${paddedNumber}`;
  
  // Append user postfix if enabled
  const idGen = config?.id_generation;
  if (idGen?.user_postfix_enabled && idGen?.default_user_initials) {
    const separator = idGen.user_postfix_separator || '-';
    const initials = idGen.default_user_initials.toUpperCase();
    id += `${separator}${initials}`;
  }
  
  return id;
}
```

## Examples

**Default (4-digit, no postfix):**
```typescript
generateItemId('task', 167)
// => "TASK-0167"
```

**3-digit (legacy):**
```typescript
generateItemId('task', 167, {
  id_generation: { digit_padding: 3 }
})
// => "TASK-167"
```

**5-digit:**
```typescript
generateItemId('task', 167, {
  id_generation: { digit_padding: 5 }
})
// => "TASK-00167"
```

**With postfix:**
```typescript
generateItemId('task', 167, {
  id_generation: {
    digit_padding: 4,
    user_postfix_enabled: true,
    default_user_initials: 'TH'
  }
})
// => "TASK-0167-TH"
```

**With postfix + custom separator:**
```typescript
generateItemId('story', 71, {
  id_generation: {
    digit_padding: 4,
    user_postfix_enabled: true,
    user_postfix_separator: '/',
    default_user_initials: 'ms'  // Auto-uppercased
  }
})
// => "STORY-0071/MS"
```

## Dependencies

- Depends on: TASK-170 (schema with id_generation)
- Depends on: TASK-171 (regex validation)

## Integration Points

- CLI: Pass `config.settings` to `generateItemId()`
- MCP Server: Pass `config.settings` to `generateItemId()`
- Extension: Pass `config.settings` to `generateItemId()`

## Testing

```typescript
// Test suite
const tests = [
  { counter: 167, config: undefined, expected: 'TASK-0167' },
  { counter: 167, config: { id_generation: { digit_padding: 3 }}, expected: 'TASK-167' },
  { counter: 167, config: { id_generation: { digit_padding: 5 }}, expected: 'TASK-00167' },
  { counter: 167, config: { id_generation: { digit_padding: 4, user_postfix_enabled: true, default_user_initials: 'TH' }}, expected: 'TASK-0167-TH' },
];
```

## Acceptance Criteria

- Function respects digit_padding setting
- Function generates postfix if enabled
- Initials auto-uppercased
- Separator configurable
- Backwards compatible (defaults work)
- All packages build successfully