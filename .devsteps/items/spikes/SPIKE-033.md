## Goal

Validieren, dass exec-impl als Conductor (dispatcht worker-coder via runSubagent) in VS Code 1.113 mit `chat.subagents.allowInvocationsFromSubagents=true` stabil funktioniert — BEVOR die Architecture in STORY-XXX implementiert wird.

## Prerequisite

VS Code 1.113 installed + `chat.subagents.allowInvocationsFromSubagents` in settings.json aktiviert + `chat.subagents.maxDepth = 3` gesetzt.

## Research Questions

### Q1: Depth-Semantik
- Zählt coord→exec-impl als Depth=1 und exec-impl→worker-coder als Depth=2?
- Oder ist coord immer Depth=0 und exec-impl=1, worker-coder=2?
- **Expected:** coord=0, exec-impl=1, worker-coder=2 → maxDepth=3 erlaubt noch eine weitere Ebene (nicht genutzt)

### Q2: Context-Isolation
- Hat worker-coder vollständige Isolation vom coord-Context?
- Welche Informationen aus exec-impl's Context werden automatisch propagiert?
- Muss exec-impl explizit alle nötigen Context-Informationen in den worker-coder-Prompt übergeben?

### Q3: MandateResult-Routing
- Schreibt worker-coder via write_mandate_result oder write_analysis_report?
- Liest exec-impl via read_mandate_results oder read_analysis_envelope?
- Oder kommuniziert worker-coder DIREKT via Datei-Write und exec-impl liest selbst?

### Q4: Failure-Handling
- Wenn worker-coder FAIL produziert — kann exec-impl einen neuen worker-coder dispatchen?
- Ist das max 3-Iter-Loop weiterhin begrenzt oder kann exec-impl unbegrenzt re-dispatchen?
- **Expected:** exec-impl hält den Iteration-Counter intern, max 3, danach ESCALATE

### Q5: Performance-Impact
- Wie viel Overhead entsteht durch Conductor-Level-Nesting?
- Gibt es signifikante Latenz-Erhöhung zwischen flat (coord→worker) und nested (coord→exec→worker)?
- Ist der Overhead durch Parallelisierung kompensierbar?

## Test Implementation

1. Aktiviere `chat.subagents.allowInvocationsFromSubagents` im Testworkspace
2. Setze maxDepth=3
3. Dispatche exec-impl (modifiziert: adds worker-coder dispatch) für ein 3-Schritt Impl-Plan
4. Beobachte: Depth-Zähler, Context-Propagation, MandateResult-Routing, Fehlerbeseitigung

## Deliverables

1. **LessonsLearned-Eintrag** in `LessonsLearned/` mit Q1-Q5 Antworten + Evidence
2. **VS Code Konfiguration** für `.vscode/settings.json` (maxDepth empfohlen: 3)
3. **Go/No-Go für STORY-XXX** (Ring 4 Exec-Conductors): Alle Fragen beantwortet?

## Success Criteria

- [ ] Q1-Q5 vollständig beantwortet mit konkretem Evidence (no hypothesis)
- [ ] Pilot-Dispatch exec-impl→worker-coder funktioniert ohne Crash/Recursion
- [ ] maxDepth=3 verhindert Endlosrekursion korrekt
- [ ] LessonsLearned-Dokument committed zu `LessonsLearned/research/`
- [ ] STORY (Ring 4 Exec-Conductors) kann mit Go-Status gestartet werden