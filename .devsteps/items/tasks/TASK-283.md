# Task: devsteps-20 + devsteps-25 Log-Integration

## devsteps-20-start-work.prompt.md

### Vor Implementierungs-Start (ergänzen nach Branch-Check)
```markdown
### Schritt 0: Kontext aus Log laden
- Read `.devsteps/logs/PROJECT-LOG.md` — letzte 2 Einträge
- Falls Epic zugehörig: Read `.devsteps/logs/epic-<ID>.log.md` — letzte 2 Einträge
- "Was weiß ich schon, bevor ich anfange?" — vermeidet bekannte Fehler
```

## devsteps-25-review.prompt.md

### Nach Review-Walkthrough (ergänzen als letzter optionaler Schritt)
```markdown
### Post-Review Option: Write to Epic Log
Falls Review neue Erkenntnisse gebracht hat (Bugs gefunden, Ansätze verworfen):
- Append Findings to `.devsteps/logs/epic-<ID>.log.md`
- Review-Walkthroughs ohne Implementierung erzeugen Wissen — das soll persistiert werden
```

## Akzeptanzkriterien
- devsteps-20: Log-Read als expliziter Schritt sichtbar (nicht nur als Hinweis)
- devsteps-25: Log-Write als optionaler post-review Schritt mit konkretem Format-Verweis