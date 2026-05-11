## Status: Accepted (2026-04-03)

> **Note:** This item should be re-typed to `doc` once the MCP server is rebuilt (crud.ts already includes `doc` enum — server needs restart after `npm run build`).

## Context
Senior architect proposed: each Diataxis type has its own hierarchy; at render time they appear as separate top-level chapters. Research confirmed this is the standard pattern for MkDocs Material with `navigation.tabs`.

## Decision
- Each DOC item has exactly ONE `metadata.diataxis_type` — no composite file types
- At render time: docs are organized by diataxis_type in nav → top-level tabs/chapters
- Pattern: nav.tab "Tutorials" → all tutorial DOC items; "How-to Guides" → all how-to items; etc.
- DevSteps provides `devsteps docs generate-nav` to emit mkdocs.yml nav block from DOC index

## Consequences
- New task needed: `devsteps docs generate-nav` (TASK-new, post-STORY-236)
- MkDocs version constraint: pin MkDocs <2.0 (MkDocs 2.0 Feb 2026 breaks Material for MkDocs)
- Composite documents must be split BEFORE import (or flagged per ADR-002)
- DevSteps extensions (architecture, research) become their own nav tabs

---
**Done 2026-05-11**: ADR file created at `docs/architecture/adr-003-composite-docs-nav-tabs.md`. Status: Accepted. Implements: TASK-403.