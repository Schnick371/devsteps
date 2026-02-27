## Aufgabe

Tool-Definition + Handler für `write_log_entry` — das primäre Schreib-Interface für alle Agents ins Log-System.

## Tool-Signatur

```typescript
// Tool-Definition in packages/mcp-server/src/tools/logbook.ts
{
  name: 'write_log_entry',
  description: 'Write a validated session log entry...',
  inputSchema: WriteLogEntryInputSchema  // aus packages/shared
}
```

## Handler-Logik

1. Zod-Validierung des Inputs (schlägt fehl → MCP-Error mit klarer Message)
2. Storage-Pfad ermitteln:
   - scope=project → `.devsteps/logs/project/`
   - scope=epic + epic_id → `.devsteps/logs/epic/{epic_id}/`
3. Entry-ID generieren: `YYYY-MM-DD-<6 random chars>`
4. JSON-Datei **atomic** schreiben: `.tmp` → `fs.rename()` (wie CBP-Tools)
5. Erfolg: `{ id, scope, epic_id?, created_at }` zurückgeben

## Validierungsregeln (Zod)

- `decisions[]` min 0 items, aber wenn scope='epic' mind. 1
- `open_threads[]` darf leer sein
- `epic_id` required wenn scope='epic'

## Pattern

Orientiert an `packages/mcp-server/src/handlers/cbp/write-mandate-result.ts` — atomic write Pattern übernehmen.