## Ziel

MCP-Tool zum Abfragen der Execution-Trail eines Plans.

### Tool: get_trail

Query-Parameter:
- `item_id` + `plan_type` (required)
- `event_types[]` — Filter nach Event-Typ
- `step_number` — Filter auf bestimmten Step
- `since` — ISO 8601 Timestamp-Filter

### Features

- Pagination für große Trails (>100 Events)
- Aggregierte Statistiken (completed_count, failed_count, retry_count, average_duration_ms)
- Timeline-View: chronologische Event-Liste
- Step-View: Events gruppiert nach Step-Nummer

### Acceptance Criteria

- [ ] Filter funktionieren korrekt einzeln und kombiniert
- [ ] Pagination mit cursor-basiertem Approach
- [ ] Aggregierte Statistiken in Response
- [ ] Performance bei 500+ Events akzeptabel (<200ms)