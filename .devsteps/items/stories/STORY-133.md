## Ziel

Implementiert die 3 MCP-Tools die das Log-System als Option C+ (MCP-mediated structured logs) realisieren. Logs werden als JSON in `.devsteps/logs/` gespeichert — konsistent mit der bestehenden `.devsteps/` file-protection-Regel: Agents schreiben **nie direkt** in `.devsteps/`, sondern immer via MCP-Tools.

## Tools

### `write_log_entry`
Validierter Schreibzugriff mit Zod-Pflichtfeldern.
- `scope: 'project' | 'epic'`
- `epic_id?: string` (Pflicht wenn scope = 'epic')
- `entry: { session_type, date, items_worked[], decisions[], open_threads[], observations? }`

### `read_log`
Intelligenter Lesezugriff mit server-seitiger Filterung, Kompression und Traversierung.
- `scope: 'project' | 'epic'`
- `id?: string` (Item-ID für Filterung)
- `depth: 'last-3' | 'last-week' | 'summary' | 'full'`
- `traversal?: 'direct' | 'trace' | 'ancestors' | 'referenced'`
  - `direct` — nur dieses Item
  - `trace` — Item + alle Descendants (implemented-by rekursiv)
  - `ancestors` — Item + alle Ancestors bis zum Epic
  - `referenced` — alle Items die via blocks/depends-on/relates-to auf dieses Item zeigen
- `max_tokens?: number` — server-seitig truncaten

### `list_log_entries`
Leichtgewichtiger Index ohne Content.
- `scope: 'project' | 'epic' | 'all'`
- `since?: string` (ISO-Datum)
- Returns: `[{ date, session_type, scope, items_count, has_open_threads }]`

## Packages

- **`packages/shared`:** Zod-Schemas (LogEntry, LogScope, TraversalMode, LogEntryContent)
- **`packages/mcp-server/src/tools/logbook.ts`:** Tool-Definitionen
- **`packages/mcp-server/src/handlers/logbook/`:** 3 Handler-Dateien
- **Atomic writes** (.tmp → rename) — wie CBP-Tools

## Acceptance Criteria

- [ ] Alle 3 Tools via Zod validiert, Required-Fields erzwingen Mindeststruktur
- [ ] `read_log` mit `traversal: 'trace'` nutzt bestehenden Link-Graph (implemented-by rekursiv)
- [ ] `read_log` mit `traversal: 'ancestors'` folgt implements-Links aufwärts
- [ ] `read_log` mit `traversal: 'referenced'` findet alle blocks/depends-on/relates-to Verweise
- [ ] `read_log(depth: 'summary')` komprimiert ältere Einträge server-seitig
- [ ] Atomic writes: .tmp → rename wie CBP-Tools
- [ ] Units tests für alle 3 Handler
- [ ] `devsteps_context(level: 'standard')` enthält `log_summary` Feld