## Hintergrund

In der heutigen Session wurde ein 7-Schritte-Workflow erarbeitet, mit dem aus einem Projekt-Scan heraus ein vollständiges Dokument via DOC-Items + BOM aufgebaut werden kann:

1. **Heading-Level festlegen** — z.B. H1 = Top-Level-Abschnitt
2. **Projekt scannen** — alle H1-Überschriften aus bestehenden MD-Dateien indizieren
3. **DOC-Item je H1 anlegen** — ein DOC-NNN Item pro Top-Level-Abschnitt
4. **BOM aufbauen** — ARCH-NNN Knoten mit Chapters und Heading-Ebenen (L0–L3)
5. **DOC-Item-IDs in BOM verknüpfen** — `doc_id` in ARCH-Knoten setzen
6. **BOM und DOC-Items aktuell halten** — bei Änderungen im Session-Verlauf nachführen
7. **Vollständiges Dokument generieren** — On-Demand aus BOM + DOC-Item-Inhalten zusammenstellen

## Aktueller Stand

- Typen existieren: `DocsMapNode`, `DocsMapDocument` in `packages/shared/src/types/docs-map.ts`
- Kein MCP-Tool implementiert für Schritte 2, 4, 5, 7
- `devsteps_docs_import` deckt Teilaspekte von Schritt 2 ab (Import existierender Dateien)

## Was fehlt

- MCP-Tool: `devsteps_docs_scan_headings` — H1–H4 Überschriften aus Verzeichnis/Datei lesen
- MCP-Tool: `devsteps_docs_assemble` — Vollständiges Markdown aus BOM + DOC-Item-Inhalten generieren
- MCP-Tool: `devsteps_docs_map_*` (separat in STORY-251)

> **Klarstellung:** Das **Schreiben** von DOC-Item-Inhalten ist bereits vollständig abgedeckt durch das vorhandene `update`-Tool (`description`-Feld). Kein neues `write_content`-Tool benötigt — wir haben bereits genug Tools.

## Akzeptanzkriterien

- [ ] Alle 7 Schritte können vollständig via MCP-Tools ausgeführt werden
- [ ] Kein Schritt erfordert direkten Dateisystem-Zugriff durch Copilot
- [ ] Happy-Path-Test mit synthetischem MD-Dokument durchläuft alle 7 Schritte