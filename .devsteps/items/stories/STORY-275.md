## Mission

The assembly prompt — triggers rendering of a complete document from the BOM tree. This is the "publish" step: takes all `doc` items under a BOM root, applies H-level normalization via `adjustHeadingLevels` (TASK-436), and produces a single coherent Markdown file.

## What the prompt does

### Phase 1: BOM Selection
- User specifies a BOM root (doc item ID, or title search)
- OR: prompts with list of available document roots

### Phase 2: Pre-Assembly Check
- Counts total / filled / placeholder fragments in the selected tree
- Reports coverage: "32/40 fragments have content — 8 are placeholders"
- Options: assemble with placeholders (shows TODO markers) OR wait + fill gaps first

### Phase 3: Assembly
- Calls `devsteps_docs_assemble` (STORY-268 + TASK-436 + TASK-437)
- Strips frontmatter from each fragment
- Applies `offset = bom_level - 1` heading normalization per fragment
- Concatenates with `\n\n---\n\n` separators between H1-level fragments
- Outputs to `docs/<diataxis-type>/<title-slug>.md`

### Phase 4: Post-Assembly Report
- Lists output path
- Shows table of contents (H2/H3 heading tree extracted from output)
- Flags any fragments with "TODO" content still present
- Optionally opens the assembled file

## Heading Normalization Example (in prompt)

```
Fragment at BOM level 3 (authored as H1):
  offset = 3 - 1 = 2
  # Title      → ### Title
  ## Section   → #### Section
  ### Detail   → ##### Detail  (capped at H6)
```

## Spider Web Dispatch
- **R1:** `analyst-context` (BOM inventory + coverage check)
- **R4:** `exec-doc` with `worker-documenter` (writes the assembled file)

## Acceptance Criteria

- [ ] Prompt file created at `.github/prompts/devsteps-59-doc-assemble.prompt.md`
- [ ] BOM selection (by item ID or title search) documented
- [ ] Pre-assembly coverage check documented
- [ ] Heading normalization formula documented with example
- [ ] Placeholder handling (assemble with TODOs) documented
- [ ] depends-on STORY-268 (ingestion) + TASK-436 (adjustHeadingLevels) + TASK-437 (exportHandler)
- [ ] Entry Point Routing table entry added to copilot-instructions.md