## Problem

`docs-map.json` (der BOM — Bill of Materials) existiert als Zod-Schema und TypeScript-Typen in `packages/shared/src/types/docs-map.ts`, aber:

1. Es gibt **kein MCP-Tool** zum Erstellen oder Aktualisieren der `docs-map.json`
2. `devsteps_docs_bom_commit` erstellt heute DOC-Items, schreibt aber keine `docs-map.json`
3. Copilot hat keine Möglichkeit, den BOM-Status zu lesen ohne direkt auf `.devsteps/docs-map.json` zuzugreifen

## Session-Erkenntnis

Das BOM braucht ARCH-NNN Knoten (hierarchisch: L0 = Dokument, L1 = H1, L2 = H2, L3 = H3) mit:
- `id`: ARCH-NNN (fortlaufend)
- `doc_id`: DOC-NNN (verknüpftes DOC-Item)
- `parent_id`: ARCH-NNN des Elternknotens (null für L0)
- `order`: Sortierposition auf gleicher Ebene
- `title`: Abschnittstitel
- `devsteps_items[]`: verknüpfte Stories/Tasks die diesen Abschnitt belegen

## Gewünschte Tools

- `devsteps_docs_map_read` — Liest den BOM als strukturierten Baum
- `devsteps_docs_map_add_node` — ARCH-NNN-Knoten einfügen oder aktualisieren
- `devsteps_docs_map_remove_node` — Knoten entfernen
- `devsteps_docs_map_link_items` — `devsteps_items[]` eines Knotens pflegen

## Akzeptanzkriterien

- [ ] `devsteps_docs_map_read` gibt ARCH-Baum als JSON zurück (keine Datei-Leseberechtigung n...tig für Copilot)
- [ ] `devsteps_docs_map_add_node` idempotent (upsert bei gleichem `doc_id + parent_id + title`)
- [ ] BOM-Datei liegt in `.devsteps/docs-map.json`
- [ ] Schema-Validierung gegen `DocsMapDocument` aus `docs-map.ts`