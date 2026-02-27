# Task: devsteps-40-sprint + devsteps-90-context Log-Integration

## devsteps-40-sprint.prompt.md

### Erster Schritt nach Branch-Check (vor Backlog-Scan — ergänzen)
```markdown
### Session-Context from Log
- Read `.devsteps/logs/PROJECT-LOG.md` — letzte 3 Einträge
- Extrahiere: offene Threads, bekannte Probleme, letzte Stoppstelle
- Sprint-Ziel darauf aufbauend formulieren (Continuation Frame, nicht Zero-Context-Start)
```

## devsteps-90-project-context.prompt.md

### Ergänzung im Loading-Protokoll (nach README.md + Aspects)
```markdown
### 5. Project Log (optional — falls vorhanden)
Falls `.devsteps/logs/PROJECT-LOG.md` existiert:
- Lade letzte 2 Einträge
- Gibt narrativen Kontext, den strukturelle Items NICHT haben
- Staleness-Signal: Falls letzter Eintrag >7 Tage alt → informiere User
```

## Akzeptanzkriterien
- devsteps-40: Log-Schritt ist explizit vor Backlog-Discovery (stärkt Sprint-Brief-Qualität)
- devsteps-90: Log-Loading ist optional (skip falls keine Datei), aber dokumentiert
- devsteps-90: Staleness-Check gibt nützliches Signal ohne Overhead