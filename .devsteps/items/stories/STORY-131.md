# Story: Epic-Narrativ — T2 Integration

## Scope

T2-Impl und T2-Reviewer schreiben nach Abschluss eines Items dessen Epic-Log-Eintrag. T1 liest das Epic-Log, bevor er mit der Arbeit an einem Epic-Item beginnt. Ergebnis: Die Entwicklungsgeschichte eines Epics ist vollständig und rekonstruierbar.

## T2-Impl — Änderungen

### Neuer Post-Implementation Step: Write Epic Log Entry
Nach erfolgreicher Implementierung (vor Übergabe an T2-Reviewer):
- Bestimme Epic-ID aus DevSteps-Item-Hierarchie
- Schreibe Abschnitt in `.devsteps/logs/epic-<ID>.log.md`:
  - Kontext: was hat uns zu diesem Item gebracht?
  - T2-Mandate-Destillat: komprimierte Analyse-Erkenntnisse (nicht rohe Envelopes!)
  - Designentscheidungen + explizit verworfene Alternativen + Begründung
  - Was anders war als erwartet (Bugs, Überraschungen, unerwartete Abhängigkeiten)

## T2-Reviewer — Änderungen

### Bei PASS: Write Epic Log Verdict
- Abschluss-Statement zum Item: was ist jetzt bekannt, was vorher nicht war?
- Quality-Gate-Ergebnis mit Kontext (nicht nur "PASS" sondern "warum problemlos" oder "nach N fix-loops")

### Bei ESCALATED: Write Epic Log Escalation Entry
- Warum eskaliert? Welches Problem ist ungelöst?
- Welche Ansätze wurden versucht?

## T1-Integration (Coordinator + Sprint Executor)

### Vor Arbeit an Epic-Item: Read Epic Log
- Falls `epic-<ID>.log.md` existiert: lese letzten N Einträge
- "Was wissen wir schon über dieses Epic?" beantwortet ohne T2-Archaeology-Overhead

## Akzeptanzkriterien

1. T2-Impl schreibt Epic-Log-Eintrag nach Implementation, vor Reviewer-Handoff
2. T2-Reviewer schreibt Verdict-Eintrag (PASS/ESCALATED) in Epic-Log
3. T1-Coordinator liest Epic-Log vor MPD-Dispatch, falls Epic-ID aus Item-Hierarchie bestimmbar
4. T1-Sprint-Executor liest Epic-Log in "Step 0" mit (gebündelt mit Project-Log)
5. Keine rohen T3-Envelope-Inhalte im Epic-Log — nur Destillate
6. Epic-Log ist append-only — R2-Reviewer überschreibt nichts, nur Anhängen