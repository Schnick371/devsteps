## Problem

DOC-059 defines "One Fragment = One Heading" — each sub-heading is its own separate `doc` item with a BOM parent-child relationship. This creates 9+ doc-items for a single conceptual knowledge unit (e.g. a 2000-word explanation document with 7 H4 sections under one H3 title).

**Research finding (SPIKE-063):** Optimal RAG retrieval chunks are 300–1500 tokens. H4-level splitting produces 50-200 word chunks — far too small. H3-level splitting produces 300-2000 word chunks — ideal.

## New Model: H3-Block as Retrieval Unit

> **"One Fragment = One H3 Block"** — an H3 heading plus ALL subordinate content (H4, H5, tables, code blocks) is ONE doc-item. H4/H5 headings inside the H3 block are NEVER separate doc-items; they are content *within* the fragment.

The BOM tree becomes flat:
```
DOC-001 (H1/H2: document root / chapter)
  DOC-003 (H3: content fragment, full content including H4/H5)
  DOC-004 (H3: content fragment, full content including H4/H5)
```

**Old model (too granular):**
```
DOC-001 (H1)
  DOC-002 (H2)
    DOC-003 (H3)
      DOC-004 (H4) ← separate item (WRONG)
        DOC-005 (H5) ← separate item (WRONG)
```

## Authoring Pattern

Copilot (and human technical writers) naturally structure documents as:
```
### Topic Title          ← H3 = domain label, no body text before first H4
#### Background          ← H4 = actual content
#### How It Works        ← H4 = actual content  
  ##### Edge Case        ← H5 = detail within H4
#### References          ← H4 = actual content
```
This entire block maps to ONE doc-item.

## Acceptance Criteria

- [ ] DOC-059 description updated to reflect H3-block granularity rule
- [ ] DOC-028 description updated (remove H4/H5 as separate items)
- [ ] copilot-instructions.md `doc` type description updated (H4/H5 = content-within, not separate items)
- [ ] BOM tree depth = 2 (document root → H3 fragments), not 5
- [ ] Existing DOC items not retroactively changed (forward-only: new items follow new rule)

## Heading Level Authoring Convention (added 2026-04-10)

> **Authoring Invariant:** Content Fragments are always authored starting at H1. Never author at H3 or any other level directly.

The Copilot (and human writer) naturally starts a document with `# Title`. This is correct and must be preserved. The BOM position dictates the final heading level in assembled documents — NOT the author.

**Why this works:**

The assembler (`adjustHeadingLevels` in TASK-436) computes `offset = bom_position_level - 1` at render time:

| Authored | BOM position | Offset | Assembled output |
|----------|-------------|--------|-----------------|
| `# Title` | L1 | +0 | `# Title` |
| `# Title` | L2 | +1 | `## Title` |
| `# Title` | L3 | +2 | `### Title` |
| `## Section` (in same fragment) | L3 | +2 | `#### Section` |

Hard cap at H6 — never produces H7+.

**DOC-059 must document this invariant** (covered by TASK-535):
- Input heading = always H1 (root)
- BOM stores heading level implicitly via `parent_id` depth
- Assembly computes offset per fragment, applies `adjustHeadingLevels`

**What this story must clarify in tool description:** "Write your document starting with `# Title`. DevSteps automatically adjusts heading levels when assembling the full document."