## Mission

A comprehensive documentation review and gap-analysis prompt. Entry point for the DocAudit workflow — discovers what is documented, what is missing, and creates placeholder doc-items for all gaps so the user can see the full documentation coverage in the BOM.

## What the prompt does

### Phase 1: BOM Coverage Scan
- Reads all existing `doc` items from DevSteps index
- Maps them against the known codebase structure (package structure, MCP tools, CLI commands, agent files)
- Builds a "coverage matrix": what exists vs. what should exist

### Phase 2: Gap Detection
- For each known subsystem / API / concept that has no doc-item → flag as gap
- Categories: MCP tools, CLI commands, agent protocol, data model, configuration, deployment, architecture decisions
- Computes a coverage score per Diataxis type (tutorial/how-to/reference/explanation/architecture)

### Phase 3: Placeholder Creation
- For each gap: creates a stripped `doc` item with:
  - `title` = proposed chapter title
  - `description` = "TODO: [one-line rationale for why this chapter is needed]"
  - `tags` = ["placeholder", diataxis-type, "gap"]
  - `status` = draft
- Links placeholder to the relevant backlog item (story/epic) if identifiable

### Phase 4: Coverage Report
- Renders a structured coverage table: ✅ written | 🔲 placeholder | ❌ not tracked
- Output: inline in chat + optionally to `docs/DOC-COVERAGE.md`

## Spider Web Dispatch

- **R1:** `analyst-internal` (codebase structure) + `analyst-context` (existing docs inventory)
- **R2:** `aspect-quality` (completeness gaps) + `aspect-staleness` (outdated vs codebase)
- **R4:** `worker-devsteps` (create placeholder items)

## Entry Point

```
/devsteps-57-doc-review
```

## Related Agents

Uses `devsteps-R4-worker-doc-gap` (new — see STORY-276) for placeholder item creation batch.

## Acceptance Criteria

- [ ] Prompt file created at `.github/prompts/devsteps-57-doc-review.prompt.md`
- [ ] Spider Web dispatch structure documented (R1/R2/R4 agents)
- [ ] Coverage scan covers: MCP tools, CLI commands, agent protocol, data model
- [ ] Placeholder creation with `gap` + `placeholder` tags
- [ ] Coverage report format documented
- [ ] Entry Point Routing table entry added to copilot-instructions.md