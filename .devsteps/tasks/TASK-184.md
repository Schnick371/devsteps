## Task Description

Replace CLI command status string literals with type-safe STATUS constants.

## Current Violations

**Files:**
- `bulk.ts`: `options.status === 'review'`, `options.status === 'done'`
- `doctor.ts`: `check.status === 'pass'`, `check.status === 'warn'`
- `index.ts`: Multiple status comparisons in status display, filtering, search results

**Examples:**
```typescript
// ❌ Current
if (options.status === 'done') { ... }
if (item.status === 'in-progress') { ... }

// ✅ Target
if (options.status === STATUS.DONE) { ... }
if (item.status === STATUS.IN_PROGRESS) { ... }
```

## Implementation

1. **Add import to each CLI command file:**
   ```typescript
   import { STATUS } from '@schnick371/devsteps-shared';
   ```

2. **Replace status literals:**
   - `bulk.ts`: Update review/done checks
   - `doctor.ts`: Update pass/warn checks (if STATUS includes these)
   - `index.ts`: Update all status display/filtering logic

3. **Handle edge cases:**
   - `match_type === 'title'` → Not status-related, consider separate MATCH_TYPE constant
   - Doctor status ('pass', 'warn', 'fail') → May need separate DOCTOR_STATUS constant

## Notes

**Doctor Status:** May need separate constant since it's different domain:
```typescript
const DOCTOR_STATUS = {
  PASS: 'pass',
  WARN: 'warn',
  FAIL: 'fail',
} as const;
```

**Search Match Type:** Also separate domain, consider in follow-up task.

## Testing

1. Build CLI package
2. Test bulk status updates
3. Run doctor command
4. Test list command with status filtering
5. Verify status output in status command

## Acceptance Criteria

- All work item status comparisons use STATUS.*
- Doctor-specific status uses appropriate constant
- CLI commands function identically
- Build passes without errors