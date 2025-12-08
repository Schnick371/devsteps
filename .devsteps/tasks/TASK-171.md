## Task

Update ItemMetadata schema regex to accept IDs with flexible digit padding (3-5 digits) and optional user postfix.

## Implementation

**File:** `packages/shared/src/schemas/index.ts` (line 133)

**Current:**
```typescript
id: z.string().regex(/^(EPIC|STORY|TASK|REQ|FEAT|BUG|SPIKE|TEST)-\d{3,}$/),
```

**New:**
```typescript
id: z.string().regex(/^(EPIC|STORY|TASK|REQ|FEAT|BUG|SPIKE|TEST)-\d{3,5}(-[A-Z]{2,4})?$/),
```

## Regex Breakdown

- `(EPIC|STORY|TASK|REQ|FEAT|BUG|SPIKE|TEST)` - Type prefix
- `-` - Separator
- `\d{3,5}` - 3-5 digits (supports 3, 4, 5 digit padding)
- `(-[A-Z]{2,4})?` - Optional: dash + 2-4 uppercase letters

## Valid Examples

**3-digit (legacy):**
- `TASK-001`, `STORY-042`

**4-digit (default):**
- `TASK-0001`, `STORY-0042`, `EPIC-0017`

**5-digit (extended):**
- `TASK-00167`, `STORY-00071`

**With postfix:**
- `TASK-001-TH` (3-digit + postfix)
- `TASK-0001-TH` (4-digit + postfix)
- `TASK-00167-MS` (5-digit + postfix)

## Invalid Examples

- `TASK-01` (too few digits)
- `TASK-000001` (too many digits)
- `TASK-0001-th` (lowercase postfix)
- `TASK-0001-T` (postfix too short)
- `TASK-0001-THOMAS` (postfix too long)

## Dependencies

- Relates to: STORY-071 (4-digit expansion)
- Extends: Current 3-digit format

## Testing

```bash
npm run build --workspace=packages/shared
npm test
```

## Acceptance Criteria

- Regex validates 3-5 digit IDs
- Optional postfix (2-4 uppercase letters)
- Backwards compatible (existing 3-digit IDs valid)
- Build passes with no errors
- All test cases pass