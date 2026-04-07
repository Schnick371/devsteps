Update the `mcp_devsteps_get` response handler to parse and include frontmatter fields in the tool response for DOC-type items: add a `frontmatter` field to the returned object containing the `parseFrontmatter()` result (or `null` if absent). Update the `mcp_devsteps_update` handler to validate frontmatter-specific fields when `type === 'doc'` and the update payload contains a `description` field — validate against `DocFrontmatterSchema` and return a structured error if fields are malformed.

Pre-condition: TASK-428 (schema) and TASK-429 (utilities) must be complete.

## Acceptance Criteria
- `mcp_devsteps_get` on a DOC item returns `frontmatter: { diataxis, status, ... }` in response
- `mcp_devsteps_get` on non-DOC item returns `frontmatter: null`
- `mcp_devsteps_update` with invalid `diataxis` type returns error with Zod validation message
- No regression in existing `mcp_devsteps_get`/`mcp_devsteps_update` MCP integration tests