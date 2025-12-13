## Task

Update `generateItemId()` function to pad IDs with 4 digits instead of 3, ensuring new items use expanded format while existing items remain unchanged.

## Implementation

**File:** `packages/shared/src/utils/index.ts` (line 112)

**Change:**
```typescript
// OLD: const paddedNumber = counter.toString().padStart(3, '0');
// NEW: const paddedNumber = counter.toString().padStart(4, '0');
```

**Example Output:**
- Counter 167 → `TASK-0167` (new 4-digit format)
- Counter 71 → `STORY-0071` (new 4-digit format)
- Existing items (001-166) unchanged

## Impact

- **New Items**: Generated with 4-digit padding starting from next add
- **Counters**: Continue from current values (TASK: 166 → 167 → TASK-0167)
- **Existing Items**: No changes (TASK-001 through TASK-166 remain)
- **Validation**: TASK-167 ensures schema accepts both formats

## Dependencies

- Depends on: TASK-167 (schema regex must accept 3-4 digits first)

## Testing

1. Build shared package: `npm run build --workspace=packages/shared`
2. Test ID generation:
   ```bash
   node -e "const {generateItemId} = require('./packages/shared/dist/utils/index.js'); console.log(generateItemId('task', 167)); console.log(generateItemId('story', 71));"
   ```
3. Expected output: `TASK-0167`, `STORY-0071`

## Acceptance Criteria

- Function pads to 4 digits for all new items
- TypeScript compiles with no errors
- Shared package builds successfully
- Integration tests pass (CLI/MCP use new format)