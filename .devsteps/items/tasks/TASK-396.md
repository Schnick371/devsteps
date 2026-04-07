Create `packages/cli/src/commands/docs.ts` with `docs import` subcommand.

Implementation notes from SPIKE-043:
- Command pattern: `program.command('docs')` → `docsCmd.command('import')`
- heuristicClassify 9-pattern table (see research brief SPIKE-043 §2)
- Phase 1: recursive scan, path traversal guard (resolve + prefix assert + symlink skip)
- Phase 2: heuristicClassify per entry: analyst-*/aspect-*/*-session* → research; docs/architecture/ / ADR → architecture; imperative+to heading → how-to; Understanding/Overview/Why → explanation; Reference/API/Options → reference; numbered steps + "You will learn" → tutorial
- Phase 3: dry-run table (≤50 rows)
- Phase 4: DOC item creation via addItem() with metadata.diataxis_typeImplemented as part of STORY-236. Commit: 5d9c737