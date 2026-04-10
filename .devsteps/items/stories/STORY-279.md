## Problem

Die Extension kennt doc/test Items nur als `cross-cutting` Methodologie-Gruppe im TreeView. Es gibt keine Visualisierung der BOM-Hierarchie (docs-map.json) — die Dokumentstruktur ist ausschließlich über MCP-Server-Tools zugänglich.

## Anforderungen

1. **BOM TreeView Mode**: Neuer View-Mode neben flat/hierarchical, der die docs-map.json Adjacency-List als Baum rendert
2. **ARCH-NNN → DOC-NNN Mapping**: Jeder BOM-Knoten zeigt verlinkte DOC-Items und deren Status
3. **Depth View Slider**: Steuerung der sichtbaren Tiefe (1-4) basierend auf `default_depth` / `tsd_heading_depth_max`
4. **Lazy Loading**: Nur sichtbare BOM-Knoten laden (Performance, vgl. VS Code Issue #235890)
5. **Cross-Reference**: Bei Klick auf BOM-Knoten → verlinkte Work-Items anzeigen

## Abhängigkeiten

- BUG-096 muss zuerst gefixt werden (Schema/Data Mismatch in docs-map.json)
- SPIKE-045 BOM-Schema-Erweiterungen (doc_subtype, status, file_path) sollten berücksichtigt werden
- docs-map.json muss in Produktion existieren (derzeit nur in ideas/)

## Betroffene Dateien

- `packages/extension/src/treeView/` — neuer BOM-View-Provider
- `packages/extension/src/commands/` — View-Mode Toggle erweitern
- `packages/shared/src/core/docs-map.ts` — readDocsMap für Extension nutzbar machen

## Acceptance Criteria

- [ ] BOM-Baum im TreeView mit ARCH-NNN Knoten
- [ ] DOC-Item Status-Badges auf BOM-Knoten
- [ ] Depth View Slider (1-4)
- [ ] Lazy Loading über adjacency-list
- [ ] Keine Regression in bestehenden flat/hierarchical Views