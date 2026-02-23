## Goal

CLI `devsteps doctor` auf `runDoctorChecks()` aus `@schnick371/devsteps-shared` umstellen (DRY). Die duplizierten Check-Implementierungen in `doctor-integrity.ts` und `doctor-checks.ts` werden entfernt — die CLI wird zum dünnen Wrapper der shared function.

## Vorher (jetzt)

```
CLI doctor.ts
  → doctor-integrity.ts (volle Implementierung)
  → doctor-checks.ts (volle Implementierung)
```

## Nachher

```
CLI doctor.ts
  → @schnick371/devsteps-shared → runDoctorChecks()
    (intern: doctor-integrity-impl.ts, doctor-checks-impl.ts)
MCP doctor handler
  → @schnick371/devsteps-shared → runDoctorChecks()
```

## Implementation

```typescript
// packages/cli/src/commands/doctor.ts (simplified)
import { runDoctorChecks } from '@schnick371/devsteps-shared';

export async function doctorCommand(opts) {
  const report = await runDoctorChecks(devstepsDir, { auto_fix: opts.fix });
  renderDoctorReport(report); // CLI-spezifisches Chalk/Ora formatting bleibt
}
```

## Was bleibt CLI-exklusiv
- `renderDoctorReport()` — chalk/ora Ausgabe-Formatierung
- `migrate` und `setup` Aufrufe — CLI-only, gehören nicht in shared

## Acceptance Criteria
- [ ] `doctor-integrity.ts` und `doctor-checks.ts` in CLI entfernt oder zu pure Render-Helpers reduziert
- [ ] `devsteps doctor` Ausgabe identisch zu vorher (nur Quelle ist jetzt shared)
- [ ] Keine duplizierten Check-Implementierungen mehr
- [ ] `devsteps doctor --fix` ruft `runDoctorChecks({ auto_fix: true })` auf