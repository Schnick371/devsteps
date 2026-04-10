## Background

The prompt numbering convention `devsteps-NN-name` serves as the logical ordering and navigation aid. Current state after rename of 90→01:

| Range | Purpose |
|-------|---------|
| 01 | Session init (load context) |
| 05-15 | Discovery (research, planning, meta-hierarchy) |
| 20-25 | Execution (start-work, review) |
| 30-45 | Workflow cycles (rapid, guide, sprint, classify) |
| 48-59 | Maintenance & docs (refactor, rename, git, context-sync, doc-system) |
| 60-70 | Release management |
| 80 | Health diagnostics (ishikawa) |
| 90 | FREE (formerly project-context) |
| 95-98 | Meta (item-cleanup, adapt-copilot-files) |

## Problem

The 57-58-59 slots are claimed for the doc system but currently empty. The 90 slot is now free. The Entry Point Routing table in `copilot-instructions.md` must be updated with the new doc-system entries AND reflect the rename (done in `fix` commit). REGISTRY.md should reference the numbering convention explicitly.

## Acceptance Criteria

- [ ] `copilot-instructions.md` Entry Point Routing table updated: `devsteps-01-project-context` (already done), + 3 new doc-system rows
- [ ] `REGISTRY.md` includes the numbering convention table (ranges 01–98) as reference for future additions
- [ ] REGISTRY.md lists new doc-system prompts (57, 58, 59)
- [ ] No prompt uses number 90 (it is reserved-free for future use)