## Goal

`read_escalations` und `resolve_escalation` als MCP-Tools in `cbp.ts` definieren und registrieren.

## Tool 1: `read_escalations`

```typescript
export const readEscalationsTool: Tool = {
  name: 'read_escalations',
  description:
    'Read escalation signals for a sprint_id from .devsteps/cbp/[sprint_id]/escalations/. ' +
    'Returns pending escalations with decision_needed and blocking_items. ' +
    'Called by T1 at session start — HALT if pending_count > 0 and surface to user. ' +
    'Missing directory returns empty array (not error).',
  inputSchema: {
    type: 'object',
    properties: {
      sprint_id: { type: 'string', description: 'Sprint context ID (required)' },
      status_filter: {
        type: 'string',
        enum: ['open', 'resolved', 'all'],
        description: 'Filter by escalation status. Default: open'
      }
    },
    required: ['sprint_id']
  }
};
```

## Tool 2: `resolve_escalation`

```typescript
// Marks an escalation as resolved after human provides decision
export const resolveEscalationTool: Tool = {
  name: 'resolve_escalation',
  description: 'Mark an escalation as resolved after human decision. ' +
    'Updates escalation JSON with resolution + resolved_at. ' +
    'Required before T1 can continue blocked items.',
  inputSchema: {
    type: 'object',
    properties: {
      escalation_id: { type: 'string' },
      sprint_id: { type: 'string' },
      resolution: { type: 'string', maxLength: 1000 },
      resolved_at: { type: 'string', description: 'ISO 8601' }
    },
    required: ['escalation_id', 'sprint_id', 'resolution', 'resolved_at']
  }
};
```

## Handler

`packages/mcp-server/src/handlers/escalations.ts`:
- `handleReadEscalations` — scannt Verzeichnis, parst JSONs, filtert nach Status
- `handleResolveEscalation` — liest JSON, fügt `resolution` + `resolved_at` hinzu, schreibt atomic

## Acceptance Criteria
- [ ] `read_escalations(sprint_id, 'open')` returniert `{ escalations: [], pending_count: 0 }` wenn keine offen
- [ ] `resolve_escalation` updatet `.json` Datei atomic (.tmp → rename)
- [ ] Beide Tools registriert in `tools/index.ts`
- [ ] Beide Tools erscheinen in `mcp_devsteps_context` Katalog