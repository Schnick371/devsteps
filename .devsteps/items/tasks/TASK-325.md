In copilot-instructions.md, AGENT-DISPATCH-PROTOCOL.md, TIER2-PROTOCOL.md und devsteps-R0-coord.agent.md referenzieren Formulierungen `report_path`, `upstream_paths` und `verdict` als formale JSON-Feld-Übergaben.

## Problem
Archäologie (conf 0.93) bestätigt: diese Felder existieren NICHT im live MandateResult schema_version 1.0. Alle Referenzen sind Phantom-Felder ohne Implementierung.

## Behebung
Alle Referenzen müssen durch korrekte Formulierung ersetzt werden: "coord reads via `read_mandate_results(sprint_id)`".

## Betroffene Dateien
1. `.github/copilot-instructions.md`
2. `.github/agents/AGENT-DISPATCH-PROTOCOL.md`
3. `.github/agents/TIER2-PROTOCOL.md`
4. `.github/agents/devsteps-R0-coord.agent.md`

## Acceptance Criteria
- Keine Referenzen auf `report_path`, `upstream_paths`, `verdict` als JSON-Felder in den 4 Dokumenten
- Ersetzte Formulierungen verweisen korrekt auf `read_mandate_results(sprint_id)`
- Kein funktionaler Inhalt wird entfernt, nur korrigiert