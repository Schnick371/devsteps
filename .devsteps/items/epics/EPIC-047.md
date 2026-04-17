Optimierung der R0-coordinator-Dispatch-Logik und Erweiterung des Spider-Web-Modells auf per-Ring-Koordinatoren.

## Hintergrund

Eine DEEP-Forschungssession (2026-04-14) hat 5 Root Causes für unter-parallelisiertes Subagent-Spawning identifiziert (Anchor: 667-Zeilen-Refactoring, ~60 Meldungen, nur 1 Subagent gespawnt).

Forschungsbericht: tmp/research-brief-coord-spawning-2026-04-14.md (gate PASS, confidence 0.91)

## Phase 1 — Story A: Triage-Korrekturen
- Fix stale QUICK-Kriterium in coord*.agent.md (RC-1)
- Quantitativer FULL-Trigger: >300 Zeilen ODER >10 Dateien (RC-3)
- Pre-Scan Step 0.5 auf STANDARD ausweiten mit FULL-Promotion (RC-5)
- aspect-staleness in STANDARD-Roster aufnehmen
- Prompt-10: Dynamic Tier Promotion Logic

## Phase 2 — Story B: Ring-Coordinator-Architektur
- R1-coord / R2-coord Ring-Coordinator Agent-Dateien
- FALSE_ALARM-Mechanismus für Ring-Level-Relevanz-Check
- ADP §0 Spider-Web-2.0-Erweiterung
- Research-Prompt: tmp/research-prompt-spider-web-ring-coordinators.md