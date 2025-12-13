## Task

Extend `DevStepsConfig` schema to support configurable ID generation patterns including digit padding and optional user postfix.

## Implementation

**File:** `packages/shared/src/schemas/index.ts`

**Add to settings object:**
```typescript
export const DevStepsConfig = z.object({
  // ... existing fields
  settings: z.object({
    // ... existing settings
    
    // ID Generation Settings
    id_generation: z.object({
      digit_padding: z.number().min(3).max(5).default(4), // 3-5 digits
      user_postfix_enabled: z.boolean().default(false),
      user_postfix_separator: z.enum(['-', '/', '_']).default('-'),
      default_user_initials: z.string().regex(/^[A-Z]{2,4}$/).optional(),
    }).default({
      digit_padding: 4,
      user_postfix_enabled: false,
      user_postfix_separator: '-',
    }),
  })
});
```

## Configuration Example

**`.devsteps/config.json`:**
```json
{
  "settings": {
    "methodology": "scrum",
    "id_generation": {
      "digit_padding": 4,
      "user_postfix_enabled": true,
      "user_postfix_separator": "-",
      "default_user_initials": "TH"
    }
  }
}
```

## Generated ID Examples

**digit_padding: 3, postfix: disabled**
- `TASK-001`, `STORY-042`

**digit_padding: 4, postfix: disabled** (default)
- `TASK-0001`, `STORY-0042`

**digit_padding: 4, postfix: enabled (TH)**
- `TASK-0001-TH`, `STORY-0042-TH`

## Backwards Compatibility

- All fields have defaults
- Existing configs work without changes
- `digit_padding` defaults to 4 (STORY-071 target)
- `user_postfix_enabled` defaults to false

## Validation

- `digit_padding`: 3-5 (reasonable range)
- `user_postfix_separator`: Only `-`, `/`, `_`
- `default_user_initials`: 2-4 uppercase letters (optional)

## Testing

```bash
npm run build --workspace=packages/shared
npm run typecheck
```

## Acceptance Criteria

- Schema accepts id_generation settings
- Defaults prevent breaking changes
- TypeScript compiles successfully
- Existing configs remain valid
- Regex validation for initials works