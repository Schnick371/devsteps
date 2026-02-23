## Goal

Extrahiere die Integrity-Check-Logik aus `packages/cli/src/commands/doctor-integrity.ts` und `packages/cli/src/commands/doctor-checks.ts` in eine shared Funktion `runDoctorChecks(devstepsDir, opts?)` im `@schnick371/devsteps-shared` Paket.

## Warum Shared?

Sowohl CLI (`devsteps doctor`) als auch MCP-Server (`mcp_devsteps_doctor`) brauchen dieselbe Logik. Duplizierung führt zu Drift. Shared ist die einzige Source of Truth.

## Implementation

**Neue Datei: `packages/shared/src/core/doctor.ts`**

```typescript
export interface DoctorCheckResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: string[];
  fix?: string;          // Beschreibung des Auto-Fixes
  auto_fixable: boolean; // Kann runDoctorChecks({ auto_fix: true }) das beheben?
}

export interface DoctorReport {
  status: 'healthy' | 'warning' | 'critical';
  checks: DoctorCheckResult[];
  summary: string;
  fixable: string[];     // Check-Namen die auto_fix lösen kann
  checked_at: string;    // ISO 8601
}

export interface DoctorOptions {
  dry_run?: boolean;     // default: true
  auto_fix?: boolean;    // default: false — Asymmetrische Links + Index-Rebuild
}

export async function runDoctorChecks(
  devstepsDir: string,
  opts: DoctorOptions = {}
): Promise<DoctorReport>
```

## Checks zu migrieren (aus CLI)

- `checkJsonFiles()` — alle .json Dateien valide?
- `checkIndexConsistency()` — Index ↔ Item-Dateien konsistent?
- `checkAsymmetricLinks()` — bidirektionale Links vollständig?
- `checkOrphanedItems()` — keine unverwaisten Items?
- `checkBrokenReferences()` — alle referenced IDs existieren?

**Neue Checks hinzufügen:**
- `checkCbpDirectory()` — `.devsteps/cbp/` Struktur vorhanden und keine korrupten Loop-Signals?
- `checkContextStaleness()` — `.devsteps/context/` Dateien nicht älter als 30 Tage?

## Acceptance Criteria
- [ ] `runDoctorChecks` exportiert aus `packages/shared/src/index.ts`
- [ ] Alle 7 Checks implementiert
- [ ] `auto_fix: true` behebt: asymmetrische Links (bidirektional ergänzen) + Index-Rebuild
- [ ] Vollständige TypeScript strict-mode Types
- [ ] Unit Tests in `packages/shared/src/core/doctor.test.ts` für alle 7 Checks