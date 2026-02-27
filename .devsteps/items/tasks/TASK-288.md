## Aufgabe

Das komplexeste der 3 Log-Tools: `read_log` mit server-seitiger Filterung, Kompression und 4-Modus-Traversierung.

## Parameter

```typescript
{
  scope: 'project' | 'epic',
  id?: string,           // Item-ID zum Filtern oder Epic-ID
  depth: 'last-3' | 'last-week' | 'summary' | 'full',
  traversal?: 'direct' | 'trace' | 'ancestors' | 'referenced',
  max_tokens?: number    // Server-seitige Truncation (Default: 4000)
}
```

## Traversal-Logik

Die Traversierung nutzt den bestehenden DevSteps Item-Link-Graph:

- **`direct`** — nur Logs für das angegebene Item/Epic
- **`trace`** — Item + alle `implemented-by` Descendants (rekursiv, BFS bis max depth 5)
- **`ancestors`** — Item + alle `implements` Ancestors aufwärts (bis zum Epic)
- **`referenced`** — alle Items die via `blocks`, `depends-on` oder `relates-to` auf dieses Item zeigen

## Depth-Logik

- `last-3` — die 3 neuesten Einträge (by `created_at`)
- `last-week` — alle Einträge der letzten 7 Tage
- `full` — alle Einträge (Vorsicht: kann context window füllen)
- `summary` — Rolling-Summary: letzte 3 vollständig, ältere komprimiert zu 1 Zeile pro Eintrag (`{ date, items_count, key_decision }`)

## max_tokens Enforcement

Wenn `summary` nicht reicht: Nach Depth-Filter + Traversal-Merge tokens schätzen (ca. 4 chars/token), älteste Einträge truncaten bis unter Budget.

## Return

```typescript
{
  entries: LogEntry[],
  total_found: number,
  truncated: boolean,
  traversal_path?: string[]   // Item-IDs die traversiert wurden
}
```

## Abhängigkeit

Muss TASK-286 (Schemas) fertig sein.