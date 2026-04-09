Fehlende Navigationsfunktion: Der Nutzer will 'zeige mir die 2 Kapitel vor und nach DOC-028' — derzeit nicht möglich.

**Lösung (2 Teile):**

**Teil 1 — Core-Funktion:**
In `packages/shared/src/core/docs-map.ts` neue Funktion ergänzen:
```typescript
export function getNodeContext(
  docsMap: DocsMapDocument,
  nodeId: string,
  neighborsBefore: number,
  neighborsAfter: number
): { before: DocsMapNode[], target: DocsMapNode, after: DocsMapNode[] }
```
Navigiert die flache Adjacency-List (topologische Reihenfolge), gibt Nachbarn zurück.

**Teil 2 — Tool-Parameter:**
`devsteps_docs_map_read` erhält optionale Parameter:
```json
{
  "doc_id": "DOC-028",
  "neighbors_before": 2,
  "neighbors_after": 2,
  "include_children": true
}
```
Wenn `doc_id` gesetzt, wird `getNodeContext()` aufgerufen statt die full map zurückzugeben.

**KEIN neues Tool** — nur optionale Parameter im bestehenden Handler.

Parent: STORY-251