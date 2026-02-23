## Problem

`devsteps doctor` im CLI prüft Datenintegrität vollständig (asymmetrische Links, Orphaned Items, Broken References, JSON-Validierung, Index↔Item Konsistenz). Ein AI-Agent hat aber **keinen MCP-Zugriff** auf diese Prüfungen — `mcp_devsteps_health` prüft nur Server-Laufzeit, nicht Datenkonsistenz.

**Konsequenz:** Nach einem Branch-Merge, Crash oder direktem Dateibearbeitung kann kein Agent automatisch erkennen, ob der `.devsteps/`-Index korrupt ist. Er bekommt `healthy` zurück — und schlägt dann bei der ersten Leseoperation mit verwirrenden Fehlern fehl.

## Goal

`mcp_devsteps_doctor` als vollständiges MCP-Tool das die gleichen Checks wie der CLI ausführt — aufrufbar von AI-Agenten, CI-Pipelines und der VS Code Extension.

## Acceptance Criteria

- [ ] Neue Funktion `runDoctorChecks(devstepsDir, opts?)` in `packages/shared/src/core/` extrahiert aus CLI `doctor-integrity.ts` + `doctor-checks.ts`
- [ ] `mcp_devsteps_doctor` Tool registriert in `packages/mcp-server/src/tools/system.ts`
- [ ] Handler in `packages/mcp-server/src/handlers/` delegiert an shared function
- [ ] Rückgabe: `{ status: 'healthy'|'warning'|'critical', checks: CheckResult[], summary: string, fixable: string[] }`
- [ ] CLI `devsteps doctor` importiert `runDoctorChecks` aus shared (DRY — kein duplizierter Code)
- [ ] Option `dry_run: boolean` — Checks ohne Auto-Fix
- [ ] Option `auto_fix: boolean` — Asymmetrische Links + Index-Rebuild automatisch reparieren (default: false, NIEMALS default true im MCP)
- [ ] Tool erscheint in `mcp_devsteps_context` Tool-Katalog

## Checks abgedeckt (von CLI übernehmen)

| Check | Quelle | Schwere |
|---|---|---|
| JSON-Dateien valide | `doctor-checks.ts` | CRITICAL |
| Index↔Items konsistent | `doctor-integrity.ts` | CRITICAL |
| Asymmetrische bidirektionale Links | `doctor-integrity.ts` | WARNING |
| Orphaned Items (kein Parent, nicht Epic) | `doctor-integrity.ts` | WARNING |
| Broken References (ID existiert nicht) | `doctor-integrity.ts` | CRITICAL |
| Context-Dateien stale | neu | WARNING |
| CBP-Verzeichnis-Struktur | neu | INFO |

## Agent Usage Pattern

```
T1 nach Branch-Merge: mcp_devsteps_doctor({ dry_run: true })
→ status: "warning", checks: [{ name: "asymmetric-links", ... }]
→ mcp_devsteps_doctor({ auto_fix: true })
→ status: "healthy"
```