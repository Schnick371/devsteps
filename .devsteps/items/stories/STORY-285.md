Implement the `get_atoms_by_intent` concept as an MCP tool. The AI asks:
"Give me all How-to atoms for the 'authentication' module."

## Tool Definition
Tool name: devsteps_doc_list
Input:
  - diataxis_type: enum (tutorial/how-to/reference/explanation/architecture/research)
  - tags: string[] optional (AND filter)
  - exclude_tags: string[] optional
  - version: string optional (future)
  - limit: number optional (default 20)

Output: fragments array [{id, title, diataxis_type, tags, excerpt}]

## Acceptance Criteria
- Tool uses new by-diataxis.json index (from Story A) — no full scan
- Returns excerpt (first 200 chars of description body, no frontmatter)
- MCP enum constraint prevents invalid type values (hard-block at schema boundary)
- Registered in server.ts + http-server.ts

## Depends on: STORY-A (diataxis_type first-class field)## Phase 3 — Version filter extension
Support version-qualified queries: "all how-to fragments for component 'Bremssystem' version 2.0"

Implementation: structured tag convention `version:2.0` (zero schema cost) parsed at query time.
- Query: `devsteps_doc_list({ tags: ['bremssystem', 'version:2.0'], diataxis_type: 'how-to' })`
- No new field needed — version is a structured tag prefix.
- AC: `listItems()` supports tag prefix filter `version:X.Y` in results.