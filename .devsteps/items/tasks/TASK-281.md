# Task: T2-Impl — Epic-Log Write nach Implementation

## Änderungen

### Neuer Schritt nach Implementation, vor Reviewer-Handoff
```markdown
## Post-Implementation: Write Epic Log Entry
1. Bestimme Epic-ID: `devsteps/list` → Item-Hierarchie → Parent → Epic
2. Append to `.devsteps/logs/epic-<ID>.log.md` (Format: devsteps-log-protocol.instructions.md):
   - Datum + Item-ID + Item-Titel
   - Kontext: was hat uns zu diesem Item gebracht? (aus MandateResult-Findings destillieren)
   - T2-Mandate Destillat: 2-4 Sätze aus den MandateResults — KEINE rohen Envelopes
   - Designentscheidungen + verworfene Alternativen (mit Begründung)
   - Überraschungen / Bugs: was anders war als erwartet
3. Falls kein Epic gefunden: schreibe in PROJECT-LOG.md stattdessen
```

## Wichtig
- Epic-Log-Eintrag wird geschrieben BEVOR T2-Reviewer aufgerufen wird
- Destillat kommt aus MandateResults (die T2 bereits kennt) — kein Extra-Overhead
- Falls `.devsteps/logs/epic-<ID>.log.md` nicht existiert: Datei anlegen mit Titel-Header