Update the default description template in `packages/shared/src/core/add.ts` (line ~113): when `args.type === 'doc'`, write a YAML frontmatter stub at the top of the `.md` file instead of the bare `# Title` template. The stub must include: `doc_id` (set to the generated `itemId`), `title` (from `args.title`), `diataxis: ''` (empty, requires author to fill), `status: draft`, `last_verified: ''` (empty ISO date placeholder), `related_items: []`. Body following the `---` fence remains `# Title\n\n<!-- Add detailed description here -->\n`.

Pre-condition: TASK-428 (DocFrontmatterSchema) must be created first so `DiataxisType` enum is available for JSDoc.

## Acceptance Criteria
- `devsteps add doc "My Title"` creates `.md` with valid `---\n...\n---\n` frontmatter prefix
- Non-doc types are unaffected (existing behavior unchanged)
- `stripFrontmatter(description)` on the generated output returns the bare body
- Integration test via existing BATS suite (test in `tests/integration/`)