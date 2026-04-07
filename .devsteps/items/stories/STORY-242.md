Introduce a well-defined YAML frontmatter schema for DOC work-item `.md` description files using the 6-type Diátaxis model (tutorial | how-to | reference | explanation | architecture | research) established in SPIKE-043. Frontmatter is stored in the `.md` file (YAML `---` delimiter), with key fields also reflected in `ItemMetadata.metadata.doc` for JSON-side retrieval. No new external YAML libraries — extend the existing regex pattern from `packages/mcp-server/src/handlers/init.ts:206` into a shared utility.

Depends-on: SPIKE-043 (done). Required-by: STORY-236 (docs import), STORY-237 (Diátaxis Copilot context delivery).

## Acceptance Criteria
- `DocFrontmatterSchema` Zod schema validates all required and optional fields; per-type discriminated variants for each Diátaxis type
- `stripFrontmatter()` removes `---` block and returns clean body; `parseFrontmatter()` returns typed object
- `add.ts` injects frontmatter stub when `type === 'doc'` (diataxis, status, last_verified, related_items)
- `mcp_devsteps_get` response includes parsed frontmatter for DOC items; `mcp_devsteps_update` validates frontmatter fields
- All unit tests pass (schema roundtrip, edge cases: missing fence, empty body, multiline values)