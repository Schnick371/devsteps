## Task

Update schema regex to accept IDs with optional user postfix.

## Implementation

**File:** `packages/shared/src/schemas/index.ts` (line 133)

**Current:**
```typescript
id: z.string().regex(/^(EPIC|STORY|TASK|REQ|FEAT|BUG|SPIKE|TEST)-\d{3,4}$/),
```

**New:**
```typescript
id: z.string().regex(/^(EPIC|STORY|TASK|REQ|FEAT|BUG|SPIKE|TEST)-\d{3,4}(-[A-Z]{2,4})?$/),
```

## Valid Examples

- `TASK-167` (3-digit, no postfix)
- `TASK-0167` (4-digit, no postfix)
- `TASK-167-TH` (3-digit + postfix)
- `TASK-0167-MS` (4-digit + postfix)

## Invalid Examples

- `TASK-167-th` (lowercase)
- `TASK-167-T` (too short)
- `TASK-167-THOMAS` (too long)

## Dependencies

- Depends on: TASK-167 (4-digit regex already updated)

## Testing

```bash
npm run build --workspace=packages/shared
npm test
```

## Acceptance Criteria

- Regex validates IDs with/without postfix
- Postfix must be 2-4 uppercase letters
- Backwards compatible (existing IDs valid)
- Build passes with no errors