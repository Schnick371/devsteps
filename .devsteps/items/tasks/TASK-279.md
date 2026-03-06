# Task: T1 Sprint Executor — Log-Integration

## Änderungen

### Step 0 (vor Backlog Discovery — neu einzufügen)
```markdown
### Step 0: Read Project Log (Session-Kontext)
- Read `.devsteps/logs/PROJECT-LOG.md` — letzte 3 Einträge
- Read `.devsteps/logs/epic-<ID>.log.md` für alle Epics in diesem Sprint (falls vorhanden)
- Extrahiere: offene Threads, bekannte Bug-Loops, verworfene Ansätze, letzte Stoppstelle
- Plane darauf aufbauend — Continuation, nicht Fresh Start
- Falls Log leer/nicht vorhanden: normal starten, nach Sprint initialen Eintrag erstellen
```

### Post-Sprint Step (nach letztem merge --no-ff — neu einzufügen)
```markdown
### Post-Sprint: Write Project Log Entry
Append to `.devsteps/logs/PROJECT-LOG.md` (format: devsteps-log-protocol.instructions.md):
- Datum + Session-Typ (Sprint)
- Alle bearbeiteten Items mit ID + Titel
- Narrativ: Bugs gefunden, Designentscheidungen, verworfene Alternativen
- Offene Threads: was ist ungelöst und warum
- Cross-cutting Observations: Muster über Items hinweg (optional)
```

### Pause-Trigger-Ergänzung
Bei ESCALATED oder HARD STOP: schreibe zusätzlich "Pause-Eintrag" mit Kontext.

## Akzeptanzkriterien
- Step 0 ist der allererste inhaltliche Schritt nach Session-Classification
- Log-Write ist der letzte Schritt, auch wenn Sprint vorzeitig beendet wird
- Referenz auf `devsteps-log-protocol.instructions.md` im Datei-Header