## Forschungsfrage

Vergleich zweier Multi-Agent-Orchestrierungsmodelle:

1. **Spider Web (Spinnennetz/Radar Chart)** — aktuelles DevSteps-Modell: zentraler Koordinator (Ring 0), feste konzentrische Ringe, radiale Speichen. Flache 2-Tier-Struktur (v1) bzw. Selective Nesting (v2.0/EPIC-042).

2. **Fischernetz-Modell** — neues Konzept: Koordinator liegt auf der Hauptdiagonale eines rotierten Quadratnetzes. Jeder Knoten spawnt max. 2 Sub-Agents (oben/unten). Sub-Agents entscheiden autonom ob weitere Generationen (G2, G3...) nötig sind. Wissen akkumuliert sich über Generationen. Netz wächst organisch — kleine Aufgabe = ein Kästchen, große = volles Netz.

## Research Questions

1. Welche bestehenden akademischen/industriellen Patterns ähneln dem Fischernetz? (Gossip Protocol, Butterfly Network, Wavefront, Mesh Orchestration)
2. Was sind die konkreten Tradeoffs vs. Spider Web in Bezug auf Context Window, Koordinationsoverhead, Adaptivität, Determinismus?
3. Welche SOTA-Arbeiten (90-Tage-Fenster) unterstützen oder widerlegen das Fischernetz-Modell?
4. Ist Fischernetz mit VS Code 1.113 + runSubagent stabil umsetzbar?
5. Hybridmodell möglich? Fischernetz für Exploration, Spider Web für Execution?## Ergebnis (2026-03-31)

Research abgeschlossen. Ring 1: 4/4 Analysten (confidence 0.87–0.94). Ring 2: rate-limited — coord-solo Synthese aus vollständigen Ring-1-Daten.

**Verdict: CONDITIONAL ADOPT (Hybrid) — nicht reines Fischernetz**

Research Brief: tmp/SPIKE-034-Fischernetz-Research-Brief.md

Kernaussage: Fischernetz Hybrid = I-13 Scope-Split Fan-Out rekursiv angewendet mit spawn_signal-Mediierung durch coord. Kein ADP-Invarianten-Bruch. Wavefront Algorithm als formales Fundament.

Follow-up Items: TASK-371 (Schema v2.0), TASK-372 (ADP v5.0), SPIKE-035 (Hybrid Pilot)