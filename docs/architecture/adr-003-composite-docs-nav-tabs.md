# ADR-003 — Composite docs rendered as nav.tabs chapters (MkDocs Material)

**Status:** Accepted  
**Date:** 2026-04-03  
**Supersedes:** None  
**Relates to:** STORY-236, SPIKE-043

---

## Context

The senior architect proposed: each Diataxis type has its own hierarchy; at render time they appear as separate top-level chapters. Research confirmed this is the standard pattern for **MkDocs Material with `navigation.tabs`** — Tutorials, How-to Guides, Reference, and Explanation each get their own top-level tab.

This is preferable to a single flat doc tree because Diataxis types serve different reader intents and should not be intermixed in navigation.

## Decision

- Each DOC item has exactly **one** `metadata.diataxis_type` — no composite file types are stored as a single DOC item.
- At render time, docs are organised by `diataxis_type` in the nav block → top-level tabs/chapters.
- Pattern:
  - `nav.tab "Tutorials"` → all tutorial DOC items
  - `nav.tab "How-to Guides"` → all how-to items
  - `nav.tab "Reference"` → all reference items
  - `nav.tab "Explanation"` → all explanation items
- DevSteps provides `devsteps docs generate-nav` to emit an `mkdocs.yml` nav block from the DOC index.

## Consequences

- New CLI command needed: `devsteps docs generate-nav` (tracked as a follow-up after STORY-236).
- **MkDocs version constraint:** pin `MkDocs < 2.0` — the MkDocs 2.0 release (Feb 2026) breaks Material for MkDocs.
- Composite documents must be split **before** import (or flagged per ADR-002 for Copilot-assisted classification).
- DevSteps extensions (architecture, research) become their own nav tabs — they sit alongside the four Diataxis tabs, not nested inside them.
