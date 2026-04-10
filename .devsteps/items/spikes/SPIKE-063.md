## Research Brief — Content Fragment Granularity & devsteps_docs_new Ingestion Design

**Date:** 2026-04-10 | **Triage:** FOCUSED | **Researcher:** coord-solo (runSubagent unavailable)

### Executive Summary

The current "one heading per doc-item" model (DOC-059) is pathologically fine-grained. A natural Copilot-authored document uses H3 as document identity (title-only, no body text) and H4 as actual content sections. Under the current schema, a single conceptual knowledge unit explodes into 9+ doc-items. The right retrieval unit is the **H3-block** — H3 heading plus all subordinate H4/H5/code/table content included verbatim. Confidence: HIGH. `devsteps_docs_new` should be redesigned to accept a full markdown document, split at H3 boundaries, and create N doc-items in one call.

### Source: Kerberos RBCD Sample Document (External Project)

Structure observed:
```
YAML frontmatter ← document metadata (title, diataxis, related_items, author)
### Main Title   ← H3 = doc-item identity — no body text, pure container title
#### Section 1  ← H4 = actual content (200-400 words each)
#### Section 2  ← content within the doc-item
  ##### Sub 2.1 ← H5 = detail within H4 section
#### Section N  ← all of this = ONE doc-item
```

### Granularity Analysis

| Split level | RBCD example → items | Chunk size | RAG optimal? |
|---|---|---|---|
| H4 (current model applied) | 7-8 items | 50-200 words | ❌ too small, loses context |
| H3 (proposed) | 1 item | 300-2000 words | ✓ ideal retrieval unit |

RAG literature consensus: optimal retrieval chunks = 300–1500 tokens (~200–1000 words). H4-level splitting produces chunks far below that threshold, destroying semantic coherence.

### Key Structural Pattern (Copilot's Natural Invariant)

**Main heading → immediate subheading, zero prose between them.** The H3 is the knowledge domain label; the H4s are the knowledge payload. This is not an aberration — it is how all good technical documentation is structured.

### New Granularity Rule

> **"One Fragment = One H3 Block"** — an H3 heading plus ALL subordinate content (H4, H5, tables, code) is ONE doc-item. H4/H5 are NEVER separate doc-items; they are content within the fragment.

BOM tree is flatter: H1/H2 document root → H3 content fragments (2 levels, not 5).

### devsteps_docs_new Redesign

New mode: *document ingestion*. Proposed parameters:
- `content_markdown: string` — full markdown doc to ingest
- `split_at_level?: 2 | 3` — default: 3 (H3 boundary)
- `link_to?: string[]` — auto-link via `documents` relation
- `dry_run?: boolean` — preview without creating

Parser algorithm:
1. Extract YAML frontmatter → title, diataxis, related_items, author
2. Find all H3 breakpoints
3. For each H3 block: title = H3 text; description = full content incl. H4/H5/tables/code
4. diataxis_type = frontmatter or heuristicClassify (existing function)
5. Create N doc-items; return { created: ["DOC-064", "DOC-065", ...] }

### Impact on STORY-250

STORY-250 proposed `create_item: true` flag (single-item creation). The ingestion mode is a superset — STORY-250 becomes a simple specialisation (1-item case). STORY-250 should be superseded.

### Follow-up Items Created
- STORY: Revise Content Fragment granularity model (H3-block as retrieval unit)
- STORY: devsteps_docs_new — document ingestion mode (content_markdown parameter)