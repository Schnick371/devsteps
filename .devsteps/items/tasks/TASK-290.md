## Aufgabe

`devsteps_context(level: 'standard' | 'deep')` soll automatisch einen `log_summary` enthalten — sodass jede Session ohne expliziten `read_log`-Aufruf einen Narrative-Kontext bekommt.

## Erweiterung des Context-Schemas

```typescript
// In StandardContextSchema (packages/shared)
log_summary?: {
  last_session_date: string,
  last_session_type: string,
  open_threads: string[],
  recent_decisions: string[],
  entry_count_last_week: number
}
```

## Logik

- Bei `level: 'quick'` — kein `log_summary` (zu langsam)
- Bei `level: 'standard'` — letzten 1 Projekt-Log-Eintrag lesen, Summary extrahieren
- Bei `level: 'deep'` — letzte 3 Einträge, offene Threads aus allen aggregieren

## Fallback

Wenn `.devsteps/logs/project/` nicht existiert oder leer: `log_summary: null` — kein Error.

## Abhängigkeit

Muss TASK-286 (Schemas) + TASK-287 (write_log_entry) fertig sein, damit Logs vorhanden sind zum Testen.