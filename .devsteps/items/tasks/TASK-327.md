## Problem
Aktuell: `read_mandate_results` gibt leeres Array bei fehlendem File zurück — kein Error, kein Log. Coord kann mit 0 MandateResults weiterlaufen (silent failure).

## Behebung
Nach Ring-1-Fan-out prüft coord via `read_mandate_results` ob alle erwarteten `analyst_ids` vorhanden sind. Bei Delta>0: `write_escalation` statt weiterlaufen.

## Quorum-Check Regel (Pseudocode)
```
dispatched_ids = [analyst-archaeology, analyst-risk, ...]
results = read_mandate_results(sprint_id)
received_ids = results.map(r => r.analyst)
missing = dispatched_ids.filter(id => !received_ids.includes(id))
if (missing.length > 0):
  write_escalation(missing_analysts=missing)
  STOP — do NOT proceed to Ring 2
```

## Betroffene Dokumente
- `.github/agents/devsteps-R0-coord.agent.md` — Quorum-Check Protokoll ergänzen
- `.github/copilot-instructions.md` — Behavioral Rule ergänzen

## Acceptance Criteria
- Quorum-Check Protokoll ist in devsteps-R0-coord.agent.md als explizite Regel dokumentiert
- copilot-instructions.md enthält entsprechende Behavioral Rule in der Mandatory Rules Tabelle
- Kein Silent-Failure-Szenario möglich wenn Analyst keinen MandateResult schreibt