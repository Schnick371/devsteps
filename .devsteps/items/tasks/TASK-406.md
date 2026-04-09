## Ziel

Erstes Tool des 5-Tool-Ketten-Dialogs. Scannt ein Verzeichnis, erstellt eine Import-Session, gibt Datei-Excerpts und `next_steps`-Anweisungen zurück, die Copilot führen, alle Dateien über `devsteps_docs_classify` zu klassifizieren.

## Dateien

- `packages/mcp-server/src/handlers/docs-import.ts` — Handler (NEU)
- `packages/mcp-server/src/server.ts` — Tool-Registrierung ergänzen

## Input-Schema (Zod)

```typescript
z.object({
  path: z.string().min(1)
    .describe('Zu scannende(s) Verzeichnis oder Glob, z.B. "docs/" oder "docs/**/*.md"'),
  dry_run: z.boolean().optional().default(false)
    .describe('Wenn true: scannen und zurückgeben, aber keine Session-Datei schreiben'),
})
```

## Output-Schema

```typescript
{
  session_id: string;
  token: string;           // 64-stelliger Hex-HMAC — an alle Folgetools weitergeben
  files: Array<{
    path: string;          // relativ zu Projekt-Root
    excerpt: string;       // erste 40 Zeilen
    size_bytes: number;
    last_modified: string; // ISO 8601
  }>;
  summary: {
    total_files: number;
    total_size_bytes: number;
    scanned_path: string;
  };
  next_steps: string[];
}
```

## Implementierungsschritte

1. **Pfad auflösen** — `path.resolve(cwd, userPath)`; prüfen ob im Workspace (`resolveWithin`-Guard); Fehler wenn außerhalb
2. **Symlink-sicherer Scan** — `lstatSync` pro Eintrag; Symlinks überspringen; nur `.md`-Dateien
3. **Excerpts extrahieren** — `readFileSync` + `split('\n').slice(0, 40).join('\n')` pro Datei
4. **Idempotenz** — `findExistingSession(resolvedPath, devstepsDir)` aufrufen; wenn offen+nicht abgelaufen → zurückgeben statt neue erstellen
5. **Session erstellen** — `createImportSession(resolvedPath, files)` aus TASK-404
6. **Session schreiben** — `writeImportSession(session, devstepsDir)` (überspringen wenn `dry_run`)
7. **next_steps-Text** — `"Found ${n} files. Call devsteps_docs_classify for EACH item in files[] — provide path, excerpt, session_id='${id}', and token. After all files are classified, call devsteps_docs_bom_status, then devsteps_docs_bom_commit."`

## Fehlerfälle

| Bedingung | Antwort |
|-----------|---------|
| Pfad existiert nicht | `{ success: false, error: "Path not found: {path}" }` |
| Keine `.md`-Dateien gefunden | `{ success: true, files: [], next_steps: ["No markdown files found..."] }` |
| Pfad außerhalb Workspace | `{ success: false, error: "Path traversal not allowed" }` |

## Sicherheit (Gate-Note #2)

`resolveWithin(cwd, userPath)`: `resolved.startsWith(cwd + path.sep)` — wirft wenn false.  
`lstatSync` vor `readFileSync` aufrufen — keine Symlinks folgen.

## Tests

`packages/mcp-server/src/handlers/docs-import.test.ts` (Filesystem mit `tmp`-Verzeichnis mocken):
1. Normaler Scan → Session erstellt, Dateien zurückgegeben
2. `dry_run: true` → kein Session-File auf Disk
3. Nicht existierender Pfad → Fehler
4. Symlink im Verzeichnis → übersprungen
5. Idempotenz → gleiche Session bei erneutem Aufruf mit selber Path

## Voraussetzungen

TASK-404 (Session-Utility) muss abgeschlossen sein.

## Referenz

`tmp/SPIKE-044-MCPDialog-Research-Brief.md` §3 Tool A (`devsteps_docs_import`)