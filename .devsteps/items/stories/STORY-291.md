## Context
Phase 4 of the CCMS orchestration pipeline: given a new/updated DOC fragment, suggest WHERE
it belongs within an existing docs-map.json BOM structure.

This is orthogonal to `devsteps_generate_rollup_manifest` (which generates a whole new manifest).
This tool PLACES one fragment into an EXISTING manifest.

## v1 — Tag-based proxy (scope cap: tag matching ONLY)
Input: `{ item_id: 'DOC-123', docs_map_path: '.devsteps/docs-map.json' }`
Output: `{ suggestions: [{ section: 'Hydraulik Maintenance', confidence: 0.85, matched_tags: ['hydraulik', 'maintenance'] }] }`

Algorithm (v1):
1. Read fragment tags + diataxis_type
2. For each BOM section node, count matching tags
3. Sort by match score, return top-3 suggestions
4. If no BOM structure found: return error (constraint B3)

## v2 — BM25 scored recommendations (SEPARATE STORY or upgrade)
- Soft-blocked on: STORY-284 (diataxis_type field) + dependency-approval gate for string similarity lib
- Not included in v1 scope

## Implementation notes
- Use `readDocsMap()` directly (NOT `devsteps_docs_bom_status` which is import-session-scoped)
- Handle absent docs-map.json gracefully with informative error message

## Acceptance Criteria
- [ ] Tool `devsteps_suggest_bom_location` registered in MCP server
- [ ] Returns top-3 BOM sections with tag match confidence
- [ ] Error case: docs-map.json absent → informative MCP error (not empty array)
- [ ] Unit test: fragment with tags [hydraulik, how-to] → matches 'Hydraulik Maintenance' section
- [ ] v1 scope: tag-matching only (BM25 explicitly excluded)## Epic-context fast-path (Semantic Anchor amendment)

When the fragment has a `related_items` link to an Epic/Story:
1. Resolve parent Epic → extract Epic title as "anchor keyword"
2. BOM section matching: boost sections whose title/tags overlap with Epic title keywords
3. Epic-context fast-path is tried BEFORE tag-matching fallback
4. Result confidence field gets `source: 'epic-context'` vs `source: 'tag-match'`

Example: fragment `related_items: [STORY-45]` → Epic "Setup & Deployment"
→ BOM "Installation" section gets +0.30 confidence bonus from title keyword "setup|deployment|installation"

Depends on: SA-NEW-1 (auto-link frontmatter) must ship before this path has data to use.
AC addition: test vector with Epic-context path produces higher confidence than tag-only path.