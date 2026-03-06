## Goal

Extract the integrity-check logic from `packages/cli/src/commands/doctor-integrity.ts` and `packages/cli/src/commands/doctor-checks.ts` into a shared function `runDoctorChecks(devstepsDir, opts?)` in the `@schnick371/devsteps-shared` package.

## Why Shared?

Both the CLI (`devsteps doctor`) and the MCP server (`mcp_devsteps_doctor`) need the same logic. Duplication leads to drift. Shared is the single source of truth.

## Implementation

**New file: `packages/shared/src/core/doctor.ts`**

```typescript
export interface DoctorCheckResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: string[];
  fix?: string;          // Description of the auto-fix action
  auto_fixable: boolean; // Can runDoctorChecks({ auto_fix: true }) resolve this?
}

export interface DoctorReport {
  status: 'healthy' | 'warning' | 'critical';
  checks: DoctorCheckResult[];
  summary: string;
  fixable: string[];     // Check names that auto_fix can resolve
  checked_at: string;    // ISO 8601
}

export interface DoctorOptions {
  dry_run?: boolean;     // default: true
  auto_fix?: boolean;    // default: false — asymmetric links + index rebuild
}

export async function runDoctorChecks(
  devstepsDir: string,
  opts: DoctorOptions = {}
): Promise<DoctorReport>
```

## Checks to Migrate (from CLI)

- `checkJsonFiles()` — are all .json files valid?
- `checkIndexConsistency()` — are index ↔ item files consistent?
- `checkAsymmetricLinks()` — are all bidirectional links complete?
- `checkOrphanedItems()` — no orphaned items without a parent?
- `checkBrokenReferences()` — do all referenced IDs exist?

**New checks to add:**
- `checkCbpDirectory()` — is the `.devsteps/cbp/` structure present and free of corrupted loop signals?
- `checkContextStaleness()` — are `.devsteps/context/` files no older than 30 days?

## Acceptance Criteria
- [ ] `runDoctorChecks` exported from `packages/shared/src/index.ts`
- [ ] All 7 checks implemented
- [ ] `auto_fix: true` resolves: asymmetric links (add missing inverse) + index rebuild
- [ ] Full TypeScript strict-mode types
- [ ] Unit tests in `packages/shared/src/core/doctor.test.ts` for all 7 checks