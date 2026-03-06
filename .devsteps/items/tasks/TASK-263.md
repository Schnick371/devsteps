## Goal

Migrate CLI `devsteps doctor` to use `runDoctorChecks()` from `@schnick371/devsteps-shared` (DRY). The duplicated check implementations in `doctor-integrity.ts` and `doctor-checks.ts` are removed — the CLI becomes a thin wrapper around the shared function.

## Before (current)

```
CLI doctor.ts
  → doctor-integrity.ts (full implementation)
  → doctor-checks.ts (full implementation)
```

## After

```
CLI doctor.ts
  → @schnick371/devsteps-shared → runDoctorChecks()
    (internally: doctor-integrity-impl.ts, doctor-checks-impl.ts)
MCP doctor handler
  → @schnick371/devsteps-shared → runDoctorChecks()
```

## Implementation

```typescript
// packages/cli/src/commands/doctor.ts (simplified)
import { runDoctorChecks } from '@schnick371/devsteps-shared';

export async function doctorCommand(opts) {
  const report = await runDoctorChecks(devstepsDir, { auto_fix: opts.fix });
  renderDoctorReport(report); // CLI-specific chalk/ora formatting stays here
}
```

## What Remains CLI-Exclusive
- `renderDoctorReport()` — chalk/ora output formatting
- `migrate` and `setup` calls — CLI-only, do not belong in shared

## Acceptance Criteria
- [ ] `doctor-integrity.ts` and `doctor-checks.ts` removed from CLI or reduced to pure render helpers
- [ ] `devsteps doctor` output identical to before (source is now shared)
- [ ] No duplicated check implementations
- [ ] `devsteps doctor --fix` calls `runDoctorChecks({ auto_fix: true })`