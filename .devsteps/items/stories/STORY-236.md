Implement `devsteps docs import <path>` CLI command that scans a directory recursively, applies the 9-pattern heuristic classifier, and creates DOC items with metadata.diataxis_type populated.

Key design decisions from SPIKE-043:
- 4-phase approach: scan → heuristicClassify → dry-run display (≤50 items table) → create
- Path traversal guard: `resolve()` + prefix assert + `lstatSync` symlink skip (FIRST action)
- Flags: `--yes` (skip dry-run confirm), `--dry-run` (never write), `--heuristic-only`
- `--import-docs` flag integration via `devsteps init`

File: `packages/cli/src/commands/docs.ts`

Depends-on: TASK-397, TASK-401
## Architecture Revision (2026-04-03 — post ADR)

Three architectural decisions supersede parts of the SPIKE-043 brief:

### ADR-001: Scoring-Vector statt Binary-Decision in heuristicClassify
heuristicClassify returns a SCORE VECTOR { tutorial: 0.0–1.0, howTo: 0.0–1.0, ... }
- winner = argmax(scores)
- if second-highest score ≥ 0.4 → set mixed flag (not a hard boundary: team may tune threshold)
- No longer: binary if/else decision table

### ADR-002: Dialog = MCP Prompt, kein CLI readline
- `--interactive` flag does NOT implement readline/Inquirer loop in CLI
- Mixed-type files are collected into a mixed-items list in dry-run output
- User invokes devsteps-docs-classify MCP prompt for each flagged file
- Copilot conducts the 3-question interview; result feeds back as --type override flags
- CLI stores `classification_signals` array on DOC item (for future devsteps docs split)

### ADR-003: Composite Rendering per nav.tabs (MkDocs Material)
- Each file has exactly ONE diataxis_type
- Rendered navigation: each Diataxis type = top-level nav tab/chapter
- New task: devsteps docs generate-nav → emits mkdocs.yml nav block from DOC items
- Note: MkDocs 2.0 (Feb 2026) incompatible with Material for MkDocs — pin MkDocs <2.0

These ADRs are linked via relates-to to DOC-001, DOC-002, DOC-003 once created.
## Done

- heuristicClassify() with 9 patterns, scoring vector, 6 Diataxis types
- devsteps docs import CLI command (scan → classify → dry-run → create)
- 16 unit tests for classifier
- Commit: 5d9c737