## Context
The Spider Web ring visualization requires timing and parentage data in MandateResult to render Gantt-style ring timelines. Currently these fields do not exist in the schema.

## Changes
- `packages/shared/src/` — extend `MandateResultSchema` with:
  - `duration_ms: z.number().optional()` — wall-clock execution time in milliseconds
  - `parent_id: z.string().uuid().optional()` — originating mandate UUID (for Ring hierarchy)
  - `event_type: z.enum(['tool_call', 'analysis', 'synthesis']).optional()`
- Bump `schema_version` default from `'1.0'` to `'1.1'`
- Update TypeScript inferred types and re-export from shared index
- All fields optional — zero breaking changes to existing CBP files

## Acceptance Criteria
- Zod schema updated, types exported
- All existing CBP files parse without error (optional fields absent = valid)
- Unit tests cover new fields with and without values