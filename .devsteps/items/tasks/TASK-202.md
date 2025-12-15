## Solution
Update get command to display ALL relationship types (blocks, depends-on, tested-by, bidirectional).

## Implementation
1. Locate: `packages/cli/src/commands/index.ts` → get command
2. Or: `packages/shared/src/core/index.ts` → item retrieval logic
3. Ensure all refs/* entries displayed in output
4. Format: Show both directions (implements ↔ implemented-by)

## Validation
- Run: `npm run test:cli`
- Tests #4, #5, #8, #10, #19, #20 should pass
- Verify all relationship types visible

## Files
- `packages/cli/src/commands/index.ts`
- `packages/shared/src/core/index.ts`