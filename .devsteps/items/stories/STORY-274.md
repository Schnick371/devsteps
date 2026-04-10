## Mission

A comprehensive documentation import prompt — the primary entry point for converting existing workspace Markdown files into DevSteps `doc` items. Wraps the existing 5-tool chain (already implemented in STORY-238) with Spider Web intelligence for large-scale import operations.

## What the prompt does

### Mode A: Directory Import (batch)
- Accepts a `path` parameter (directory to scan)
- Runs `devsteps_docs_import` → `devsteps_docs_classify` → `devsteps_docs_classify_confirm` (human-in-the-loop) → `devsteps_docs_bom_status` → `devsteps_docs_bom_commit`
- Spider Web R1 (context) runs BEFORE import to understand existing BOM structure and avoid duplicates

### Mode B: Single File Import (via ingestion mode)
- Accepts a `file` parameter pointing to a single `.md` file
- Uses `devsteps_docs_new content_markdown=<file_content>` (STORY-268 ingestion mode)
- Extracts YAML frontmatter, splits at H1 boundary, creates N doc items in one call
- Returns created item IDs

### Mode C: Inline Content Import
- Accepts `content_markdown` directly (copy-paste from another tool or project)
- Same as Mode B but no file read needed

## Frontmatter Auto-Detection
- If file has `related_items: [STORY-XXX]` in frontmatter → auto-link via `documents` relation
- If file has `status: approved` → set doc item status to `done`
- If file has `diataxis:` → use as diataxis type, skip heuristic classification

## Spider Web Dispatch
- **R1:** `analyst-context` (existing BOM coverage + duplicate detection)
- **R4:** `worker-devsteps` (link operations after creation)

## Acceptance Criteria

- [ ] Prompt file created at `.github/prompts/devsteps-58-doc-import.prompt.md`
- [ ] Mode A (directory), Mode B (single file), Mode C (inline) all documented
- [ ] Frontmatter auto-detection rules documented
- [ ] Duplicate-avoidance: checks existing BOM before creating
- [ ] Entry Point Routing table entry added to copilot-instructions.md