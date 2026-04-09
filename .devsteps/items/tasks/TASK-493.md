## Hintergrund

ADR-S2-12 legt fest: "ARCH-NNN ist manifest-only, kein DevSteps ItemType". Die Entscheidung ist solide, aber es fehlt die Konvention welche Root-ARCH-NNN-Knoten aussehen sollen.

## Was fehlt

In `docs-map.json` kann ein Root-ARCH-NNN (`parent_id: null, order: 0`) das Gesamt-Dokument repräsentieren und dabei:
- `doc_id → DOC-NNN` als Anker-Item zeigen (das DOC-Item mit dem Dokument-Titel)
- `description` für Diataxis-Typ + Sprache + Abstract nutzen
- Als Container für alle Kapitel-Knoten (L1+) dienen

Diese Konvention ist weder in ADR-S2-12 noch in `docs-map.ts` dokumentiert.

## Akzeptanzkriterien

- [ ] ADR-S2-12 erweitert mit: Root-ARCH-NNN Konvention (parent_id: null, doc_id required, description: diataxis_type + language + abstract)
- [ ] `DocsMapNode` TSDoc-Kommentar aktualisiert mit Root-Knoten Beispiel
- [ ] STORY-251 (BOM MCP-Tools) referenziert die Konvention