## Ziel

Letzter Schritt der 5-Tool-Kette. Materialisiert die Import-Session: erstellt DOC-Items in `.devsteps/items/docs/`, aktualisiert `docs-map.json` (BOM) mit neuen `DocsMapNode`-Einträgen. Unterstützt `dry_run` für sichere Vorschau.

## Datei

`packages/mcp-server/src/handlers/docs-bom-commit.ts` (NEU)  
In `packages/mcp-server/src/server.ts` registrieren.

## Input-Schema (Zod)

```typescript
z.object({
  session_id: z.string().uuid(),
  token: z.string().length(64),
  dry_run: z.boolean().optional().default(false),
})
```

## Output-Schema

```typescript
{
  items_created: number;
  bom_nodes_added: number;
  skipped: number;
  errors: Array<{ path: string; reason: string }>;
  doc_items: string[];   // DOC-NNN IDs in Erstellungsreihenfolge
  dry_run: boolean;
  next_steps: string[];
}
```

## Implementierungsschritte (wenn `dry_run === false`)

1. Token validieren + Session lesen
2. **Voraussetzen: `session.pending.length === 0`** — Fehler wenn noch offene Dateien
3. Pro `classified`-Eintrag mit `decision !== 'skip'`:
   a. **`decision === 'accept'`**: 1 DOC-Item anlegen
   b. **`decision === 'split'`**: N DOC-Items anlegen (eines pro `SplitEntry`)
   c. **`decision === 'rewrite'`**: 1 DOC-Item anlegen, `metadata.needs_rewrite = true`
4. Jedes DOC-Item erhält:
   - `metadata.diataxis_type` aus `ClassifiedEntry.diataxis_type`
   - `metadata.source_path` aus `ClassifiedEntry.path`
   - `metadata.import_session_id` aus `session.session_id`
5. `atomicWriteJson` für `.devsteps/items/docs/DOC-NNN.json` und Index-Updates
6. `docs-map.json` lesen → `DocsMapNode[]` anhängen → atomar zurückschreiben
7. `docs-map-positions.json` Shadow-Index aktualisieren
8. `session.status = 'committed'` setzen + Session schreiben

## Fehlerfälle

| Bedingung | Antwort |
|-----------|---------|
| Noch offene Dateien | `{ success: false, error: "Session has {N} pending files. Complete classification first." }` |
| Session bereits committed | Idempotent: `{ success: true, items_created: 0, doc_items: [...vorherige IDs] }` |
| `docs-map.json` Schreibkonfllikt | Eintrag in `errors[]`, Rest fortsetzen |

## next_steps text (Erfolg)

```
"Created {items_created} DOC items: {doc_items.join(', ')}.
Updated docs-map.json with {bom_nodes_added} nodes. Import session complete."
```

## `dry_run`-Verhalten

- Alle Berechnungen wie im normalen Modus
- Keine Dateien auf Disk geschrieben
- Antwort enthält alle Felder exakt wie im echten Modus, plus `dry_run: true`

## Tests

1. Normaler Commit → DOC-Items erstellt, `items_created > 0`
2. `dry_run: true` → keine Dateien auf Disk, `dry_run: true` in Antwort
3. Pending-Dateien vorhanden → Fehler
4. Idempotenz: zweimal commit mit selber Session → zweiter Aufruf gibt vorherige IDs zurück
5. `decision === 'split'` → N Items pro SplitEntry erstellt
6. `metadata.diataxis_type`, `metadata.source_path`, `metadata.import_session_id` korrekt gesetzt
7. `docs-map.json` enthält neue `DocsMapNode`-Einträge

## Voraussetzungen

TASK-404 + TASK-408 abgeschlossen.  
`DocsMapDocument`-Schreiboperationen: `atomicWriteJson`-Pattern aus `packages/shared/src/utils/file-utils.ts`.

## Referenz

`tmp/SPIKE-044-MCPDialog-Research-Brief.md` §3 Tool E (`devsteps_docs_bom_commit`) + §4 BOM Gap Analysis