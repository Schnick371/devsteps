## Task

Extend `DevStepsConfig` schema to support optional user postfix configuration.

## Implementation

**File:** `packages/shared/src/schemas/index.ts`

**Add to settings object:**
```typescript
export const DevStepsConfig = z.object({
  // ... existing fields
  settings: z.object({
    // ... existing settings
    user_postfix_enabled: z.boolean().default(false),
    user_postfix_separator: z.string().default('-'),
    default_user_initials: z.string().optional(),
  })
});
```

## Validation

- `user_postfix_separator`: Must be one of: `-`, `/`, `_`
- `default_user_initials`: 2-4 uppercase letters (optional)

## Backwards Compatibility

- All fields optional with defaults
- Existing configs work without changes
- `user_postfix_enabled` defaults to `false`

## Testing

```bash
npm run build --workspace=packages/shared
npm run typecheck
```

## Acceptance Criteria

- Schema accepts new postfix settings
- Defaults prevent breaking changes
- TypeScript compiles successfully
- Existing configs remain valid