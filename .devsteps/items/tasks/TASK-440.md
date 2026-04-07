Create `packages/shared/src/schemas/docs.ts` (new file) with a Zod discriminated union schema for YAML frontmatter of DOC items.

## Schema Design

### Universal fields (all 6 types):
- `doc_id`: kebab-case string (`^[a-z0-9-]+$`)
- `title`: non-empty string (max 200 chars)
- `diataxis`: enum `tutorial | how-to | reference | explanation | architecture | research`
- `status`: enum `draft | active | deprecated`
- `last_verified`: ISO date string `YYYY-MM-DD`, must not be future-dated
- `related_items`: string[] (each matches DevSteps ID pattern)

### Per-type required fields:
- `tutorial`: `prerequisites: string[]`, `learning_outcomes: string[]` (>=1)
- `how-to`: `goal: string`
- `reference`: `scope: string`
- `explanation`: `answers: string[]` (>=1)
- `architecture`: `context: string`
- `research`: `questions: string[]` (>=1)

## Deliverables
- New file: `packages/shared/src/schemas/docs.ts`
- Updated: `packages/shared/src/schemas/index.ts` (re-export `DocFrontmatterSchema`, `DiataxisType`)
- Zod `.parse()` and `.safeParse()` must handle all edge cases