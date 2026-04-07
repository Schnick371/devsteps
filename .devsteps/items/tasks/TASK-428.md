Create `packages/shared/src/schemas/docs.ts` with `DocFrontmatterSchema` using Zod. Schema supports the 6-type Diátaxis model via a discriminated union on `diataxis` field. Common required fields: `doc_id` (string matching `DOC-\d+`), `title` (string), `diataxis` (enum: `tutorial | how-to | reference | explanation | architecture | research`), `status` (enum: `draft | review | published | deprecated`), `last_verified` (ISO date string), `related_items` (string array). Per-type optional fields: `tutorial` adds `difficulty?: 'beginner' | 'intermediate' | 'advanced'`; `reference` adds `api_version?: string`; `architecture` adds `decision_status?: 'proposed | accepted | deprecated'`; `research` adds `spike_id?: string`.

Export `DocFrontmatterSchema`, `DocFrontmatter` type, and `DiataxisType` enum. Re-export from `packages/shared/src/schemas/index.ts`.

## Acceptance Criteria
- Zod parse succeeds for all 6 Diátaxis types with minimal required fields
- `DiataxisType` enum exported and used by downstream consumers
- `doc_id` field validated against pattern `/^DOC-\d+$/`
- `related_items` accepts empty array and string array
- Schema file ≤ 120 lines (no docstrings on schema fields)