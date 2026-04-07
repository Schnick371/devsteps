## Problem
Die Init/Update-Pipeline für Copilot-Dateien hat drei Lücken:
1. CLI ruft extendExistingAgents() nicht auf (MCP tut es) → Parität-Bug
2. packageVersion wird nicht übergeben → alle managed-file Annotationen zeigen "version: unknown"
3. Kein SHA256-Staleness-Signal im Health-Endpoint → keine Observability ob Dateien veraltet sind
4. Alle Copilot-File-Utilities (copyGithubFiles, updateCopilotFiles, injectDevstepsComment, backupGithubFiles) sind komplett ungetestet

## Goals
1. CLI init erhält --extend-agents Flag (opt-in, kein stiller Overwrite)
2. packageVersion wird korrekt übergeben
3. sha256() wird zu hashContent() exportiert und dedupliziert (aktuell in 2 Dateien)
4. Unit-Tests für alle 4 Utilities
5. Health-Endpoint bekommt copilotFiles: { stale, missing, hint } via dry_run=true mit 60s TTL-Cache

## Success Criteria
- CLI init --extend-agents funktioniert
- Versionsstempel stimmt
- Tests grün
- Health gibt copilotFiles-Objekt zurück (kein Fehler bei fehlendem .github/)