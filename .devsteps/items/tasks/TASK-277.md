# Task: Log-Protocol Instructions-Datei erstellen

Erstelle `.github/instructions/devsteps-log-protocol.instructions.md` mit korrektem YAML-Frontmatter und vollständiger Spezifikation.

## Inhalt der Instructions-Datei

### Frontmatter
```yaml
applyTo: ".devsteps/logs/**,.github/agents/devsteps-t1-*.agent.md,.github/agents/devsteps-t2-impl.agent.md,.github/agents/devsteps-t2-reviewer.agent.md,.github/prompts/devsteps-*.prompt.md"
description: "Log-Protokoll für Projekt-Logbuch und Epic-Logbücher — Format, Regeln, Anti-Patterns"
```

### PROJECT-LOG.md Eintrag-Schema
```markdown
## [DATUM] — [SESSION-TYP] | [KURZ-BESCHREIBUNG]

**Items:** [ID1] [Titel1], [ID2] [Titel2]

**Was wirklich passiert ist:**
[Narrativ — was wurde entdeckt, entschieden, verworfen]

**Offene Threads:**
- [Was ungelöst geblieben ist und warum]

**Cross-cutting Observations:**
[Muster über mehrere Items hinweg — nur wenn vorhanden]
```

### Epic-Log Eintrag-Schema (.devsteps/logs/epic-<ID>.log.md)
```markdown
## [DATUM] — [ITEM-ID] [ITEM-TITEL]

**Kontext:** [Was hat uns zu diesem Item gebracht?]

**T2-Mandate Destillat:** [Komprimierte Analyse: 2-4 Sätze, keine rohen Envelopes]

**Designentscheidungen:**
- Gewählt: [Ansatz] — Begründung: [...]
- Verworfen: [Alternative] — Warum: [...]

**Überraschungen / Bugs:**
[Was anders war als erwartet]

**Abschluss:** [Was wissen wir jetzt, was wir vorher nicht wussten?]
```

### Persistenz-Regeln
- Append-only — kein Löschen, kein Überschreiben
- Neueste Einträge oben (reverse chronological)
- T1 liest beim Session-Start: letzte 3 Projekt-Log-Einträge, letzte 2 Epic-Log-Einträge
- Schreibreihenfolge: T2-Impl schreibt zuerst, T2-Reviewer appended

### Anti-Patterns (NIEMALS)
- Raw T3-Envelope-Content im Log
- Item-Status 1:1 aus DevSteps-Items duplizieren
- Bullet-Dump ohne Kontext (Entscheidungen brauchen Begründung)
- "Done." als Abschluss-Statement (kein Mehrwert)