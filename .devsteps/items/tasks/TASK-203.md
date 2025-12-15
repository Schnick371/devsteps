## Solution
Change status command output from 'Total Items: X' to 'Total: X'.

## Implementation
1. Locate: `packages/cli/src/commands/index.ts` → status command
2. Find line with 'Total Items:'
3. Change to 'Total:'
4. Ensure consistent with other output formatting

## Validation
- Run: `npm run test:cli`
- Test #22 should pass
- Verify: Status shows 'Total: 5' not 'Total Items: 5'

## Files
- `packages/cli/src/commands/index.ts`