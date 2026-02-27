## Aufgabe

Zod-Schemas für das gesamte Log-System in `packages/shared` — Source of Truth für MCP-Tools und CLI.

## Schemas

```typescript
// LogScope
const LogScopeSchema = z.enum(['project', 'epic'])

// TraversalMode
const TraversalModeSchema = z.enum(['direct', 'trace', 'ancestors', 'referenced'])

// DepthMode
const DepthModeSchema = z.enum(['last-3', 'last-week', 'summary', 'full'])

// LogEntryContent (Payload innerhalb eines Eintrags)
const LogEntryContentSchema = z.object({
  session_type: z.enum(['planning', 'implementation', 'review', 'bugfix', 'research', 'sprint']),
  date: z.string().datetime(),
  items_worked: z.array(z.string()), // Item IDs
  decisions: z.array(z.string()),    // Pflichtfeld: getroffene Entscheidungen
  open_threads: z.array(z.string()), // Pflichtfeld: offene Punkte für nächste Session
  observations: z.string().optional(), // Freitext: Lessons Learned, Auffälligkeiten
})

// LogEntry (gespeicherte Datei)
const LogEntrySchema = z.object({
  id: z.string(),        // SHA-ähnlicher Hash: YYYY-MM-DD-<6chars>
  scope: LogScopeSchema,
  epic_id: z.string().optional(),
  created_at: z.string().datetime(),
  entry: LogEntryContentSchema,
})

// WriteLogEntry Input
// ReadLog Input
// ListLogEntries Input
```

## Storage-Struktur

```
.devsteps/logs/
  project/
    2026-02-27-a3f9bc.json   # Atomic write (.tmp → rename)
    2026-02-28-x7k2mn.json
  epic/
    EPIC-031/
      2026-02-27-q1w2e3.json
```

## Export

Alle Schemas + Types nach `packages/shared/src/index.ts` exportieren.