## Ziel

Zwei Tools in einem Task:
- **`devsteps_docs_classify_confirm`** — nimmt die Nutzer-Entscheidung für eine Datei entgegen (accept/split/skip/rewrite), schreibt sie in die Session, meldet Restanzahl
- **`devsteps_docs_bom_status`** — read-only Fortschrittsanzeige der Session als Markdown-Tabelle

## Dateien

- `packages/mcp-server/src/handlers/docs-classify-confirm.ts` (NEU)
- `packages/mcp-server/src/handlers/docs-bom-status.ts` (NEU)
- Beide in `packages/mcp-server/src/server.ts` registrieren

---

## Tool 1: `devsteps_docs_classify_confirm`

### Input-Schema (Zod)

```typescript
z.object({
  path: z.string().min(1),
  decision: z.enum(['accept', 'split', 'skip', 'rewrite']),
  // Pflicht wenn decision === 'accept'
  diataxis_type: z.enum(['tutorial','how-to','reference','explanation','architecture','research']).optional(),
  // Pflicht wenn decision === 'split'
  splits: z.array(z.object({
    new_path: z.string().min(1),
    sections: z.array(z.string()).min(1),
    diataxis_type: z.enum(['tutorial','how-to','reference','explanation','architecture','research']),
  })).optional(),
  session_id: z.string().uuid(),
  token: z.string().length(64),
}).refine(d => d.decision !== 'accept' || d.diataxis_type !== undefined,
  { message: "diataxis_type is required when decision is 'accept'" })
 .refine(d => d.decision !== 'split' || (d.splits && d.splits.length > 0),
  { message: "splits[] is required when decision is 'split'" })
```

### Output-Schema

```typescript
{
  path: string;
  decision: 'accept' | 'split' | 'skip' | 'rewrite';
  pending_count: number;
  classified_count: number;
  next_steps: string[];
}
```

### next_steps

- `pending_count > 0`: `"{n} file(s) remaining. Continue with devsteps_docs_classify for: {nextPath}"`
- `pending_count === 0`: `"All files classified. Review with devsteps_docs_bom_status, then call devsteps_docs_bom_commit."`

### Implementierungsschritte

1. Token + Session validieren (wie TASK-407)
2. `splits[].new_path` validieren: `resolveWithin(cwd, newPath)` für jeden Split-Eintrag **(Gate-Note #2 — Pflicht)**
3. Session lesen → Pfad in `pending[]` suchen → Fehler wenn nicht gefunden
4. **Read-Modify-Write mit Conflict Detection (Gate-Note #4):**
   - Session nochmal von Disk lesen bevor Schreiben
   - Wenn Pfad inzwischen in `classified[]` → idempotent zurückgeben (kein Fehler)
5. `ClassifiedEntry` bauen + an `session.classified[]` anhängen, Pfad aus `session.pending[]` entfernen
6. Session schreiben (atomares `.tmp` → rename)
7. `next_steps`-Text nach Restanzahl wählen

### Idempotenz

Wenn Datei schon in `session.classified[]` → aktuellen Stand zurückgeben (kein Fehler).

---

## Tool 2: `devsteps_docs_bom_status`

### Input-Schema (Zod)

```typescript
z.object({
  session_id: z.string().uuid(),
  token: z.string().length(64),
})
```

### Output-Schema

```typescript
{
  session_id: string;
  status: ImportSessionStatus;
  files_total: number;
  classified: number;
  skipped: number;
  pending: number;
  mixed_flagged: number;
  summary_table: string;  // Markdown-Tabelle: Path | Type | Decision | Mixed
  next_steps: string[];
}
```

### next_steps

- `pending > 0`: `"{n} file(s) still pending. Call devsteps_docs_classify for: {paths}"`
- `pending === 0`: `"All resolved. Call devsteps_docs_bom_commit (dry_run: true to preview)."`

---

## Tests

1. `classify_confirm` mit `decision='accept'` → `pending_count` sinkt um 1
2. `classify_confirm` mit `decision='split'` → 2 SplitEntry → Session aktualisiert
3. Ungültiger `new_path` (Pfad-Traversal) → Fehler
4. Idempotenz: gleicher Pfad zweimal bestätigen → gleiches Ergebnis, kein Fehler
5. Concurrent-Schutz: Race auf `session.classified[]` → keine doppelten Einträge
6. `bom_status` gibt korrekte Markdown-Tabelle zurück
7. `bom_status` zeigt `mixed_flagged` korrekt

## Voraussetzungen

TASK-404 + TASK-406 + TASK-407

## Referenz

`tmp/SPIKE-044-MCPDialog-Research-Brief.md` §3 Tools C+D