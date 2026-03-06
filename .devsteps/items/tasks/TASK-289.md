## Aufgabe

Leichtgewichtiger Index-Tool: `list_log_entries` — gibt Metadaten ohne Eintrag-Content zurück.

## Parameter

```typescript
{
  scope: 'project' | 'epic' | 'all',
  since?: string   // ISO-Datum, default: alles
}
```

## Return

```typescript
{
  entries: Array<{
    id: string,
    scope: 'project' | 'epic',
    epic_id?: string,
    date: string,
    session_type: string,
    items_count: number,
    has_open_threads: boolean,
    decisions_count: number
  }>,
  total: number
}
```

## Logik

- Scan `.devsteps/logs/project/` und (optional) `.devsteps/logs/epic/***/`
- Jede JSON-Datei lesen, nur Metadaten extrahieren (kein `observations` Text)
- Nach `created_at` desc sortieren
- `since`-Filter anwenden

## Zweck

Gibt Agents einen schnellen Überblick ohne den Context Window zu belasten. Typischer Aufruf bei Session-Start: "Gibt es Log-Einträge für EPIC-031 der letzten Woche?" → dann gezielte `read_log` für relevante Einträge.