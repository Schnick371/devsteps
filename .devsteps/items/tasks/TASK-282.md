# Task: T2-Reviewer — Epic-Log Verdict schreiben

## Änderungen

### Bei PASS — Verdict-Eintrag in Epic-Log
```markdown
## Post-Review: Append Verdict to Epic Log
Append to `.devsteps/logs/epic-<ID>.log.md`:
- Review-Verdict: PASS
- Quality-Gate-Kontext: warum problemlos, oder nach wievielen fix-loops
- Abschluss-Statement: Was wissen wir jetzt, was wir vorher nicht wussten?
```

### Bei ESCALATED — Eskalations-Eintrag
```markdown
## Post-Review: Append Escalation to Epic Log
- Review-Verdict: ESCALATED
- Warum eskaliert: welches Problem ist ungelöst
- Versuchte Ansätze (Kurzfassung der review-fix-loop-Iterationen)
```

## Wichtig
- Schreibe NACH dem Verdict, VOR Rückgabe an T1
- Reviewer hat Kontext über alle Iterations — das ist wertvolles Wissen für das Log
- Format: devsteps-log-protocol.instructions.md