## Task
Health-Response um optionales copilotFiles-Feld erweitern.

## Schema
```ts
copilotFiles?: {
  stale: number;    // Anzahl veralteter Dateien
  missing: number;  // Anzahl fehlender Dateien
  hint?: string;    // z.B. "Run mcp_devsteps_update_copilot_files to sync"
  error?: string;   // falls Check selbst scheitert
}
```

## Implementation
- Intern updateCopilotFiles({ dry_run: true }) aufrufen
- Ergebnis mit 60s TTL cachen (In-Memory reicht)
- Fehler im Feld copilotFiles.error, NICHT als success: false
- Wenn .github/ fehlt: stale=0, missing=N, kein Fehler

## Acceptance Criteria
- Health gibt copilotFiles-Objekt zurück
- Kein I/O bei TTL < 60s
- Test: Health-Response shape inkl. copilotFiles