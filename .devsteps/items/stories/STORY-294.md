Fünf gezielte Korrekturen am R0-coord-Dispatch-Protokoll basierend auf dem Research Brief tmp/research-brief-coord-spawning-2026-04-14.md (gate PASS, confidence 0.91).

## Root Causes addressed

- RC-1: Stale QUICK-Kriterium in coord.agent.md (commit 60f5326, EPIC-039 hat copilot-instructions korrigiert aber nicht coord.agent.md)
- RC-2: Kein Refactoring-Verb-Trigger (kein Mindest-Tier für 'refactor/migrate/rework')
- RC-3: Keine quantitativen Trigger (kein Schwellenwert für Zeilenzahl / Dateianzahl)
- RC-5: Bootstrap-Zirkularität (Pre-Scan läuft nur nach FULL-Entscheidung, kann FULL aber nicht erst ermitteln)

## Änderungen (5 Korrekturen an ~6 Dateien)

P1: QUICK neu definieren in allen coord*.agent.md-Kopien
- packages/mcp-server/.github/agents/devsteps-R0-coord.agent.md (kanonische Quelle)
- packages/mcp-server/.github/agents/devsteps-R0-coord-sprint.agent.md
- (sync propagiert zu root + cli)

P2: Quantitativer FULL-Trigger hinzufügen
- FULL wenn: >300 Zeilen ODER >10 Dateien ODER packages/shared in affected_paths

P3: Pre-Scan Step 0.5 auf STANDARD+ ausweiten
- Aktuell: nur bei FULL
- Neu: auch bei STANDARD; wenn scan_result >5 Dateien → FULL-Promotion

P4: Prompt-10 Dynamic Tier Promotion Logic
- packages/mcp-server/.github/prompts/devsteps-10-plan-work.prompt.md
- Triage-Promotion-Block: Verb-Check (refactor/migrate/rework → STANDARD min) + Quantitativ (>300 lines → FULL)

P5: aspect-staleness in STANDARD Roster
- AGENT-DISPATCH-PROTOCOL.md: STANDARD-Zeile um aspect-staleness erweitern
- devsteps-agent-protocol.instructions.md entsprechend aktualisieren

## Constraints

- coord.agent.md liegt bei exakt 150 Zeilen (Hard Limit). Änderungen müssen netto-neutral oder kleiner sein.
- 3 Kopien aller coord-Dateien: root / mcp-server / cli (sync-Richtung: mcp-server → root via update_copilot_files)
- AGENT-DISPATCH-PROTOCOL.md ist root-only (kein Sync)

## Akzeptanzkriterien

- [ ] QUICK-Kriterium: nur noch whitespace/typo in allen 3 coord-Kopien
- [ ] FULL-Trigger-Tabelle enthält quantitativen Zeilenschwellenwert
- [ ] Pre-Scan Step 0.5 Kommentar enthält STANDARD-Pfad + FULL-Promotion-Bedingung
- [ ] Prompt-10 enthält Promotion-Block (kein vollständiges Triage-Tabellen-Duplikat)
- [ ] aspect-staleness in STANDARD-Zeile von ADP Triage-Tabelle
- [ ] Alle Tests grün (npm test)
- [ ] gate-reviewer PASS