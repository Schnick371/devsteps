## Solution
Update getMethodologyConfig() to include spikes/ directory for all methodologies.

## Implementation
1. Locate: `packages/shared/src/utils/index.ts` → `getMethodologyConfig()`
2. Add 'items/spikes' to directories array for Scrum/Waterfall/Hybrid
3. Verify init creates directory during project initialization

## Validation
- Run: `npm run test:cli`
- Test #17 should pass
- Verify: `.devsteps/items/spikes/` exists after init

## Files
- `packages/shared/src/utils/index.ts`