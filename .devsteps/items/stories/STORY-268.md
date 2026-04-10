
## Problem

`devsteps_docs_new` currently only generates empty markdown skeleton files. It does NOT:
- Accept existing content
- Parse a real document into multiple doc-items
- Extract YAML frontmatter metadata
- Create N doc-items in one call

The result: agents must manually call `devsteps add doc` + `devsteps update` for each section. For a 7-section document, that is 14+ tool calls.

## Desired Behavior: Document Ingestion Mode

When `content_markdown` is provided, `devsteps_docs_new` operates in **ingestion mode**:

1. Extract YAML frontmatter (title, diataxis, related_items, author, status)
2. Find all H-level N breakpoints (default N=3 for H3, configurable via `split_at_level`)
3. For each H3 block: create one `doc` item with `description` = full content incl. H4/H5/tables/code
4. diataxis_type: from frontmatter.diataxis OR heuristicClassify() (existing function)
5. Auto-link created items to `link_to` IDs via `documents` relation (optional)
6. Return: `{ created: ["DOC-064", "DOC-065"], count: 2, dry_run: false }`

## New Parameters

```typescript
content_markdown?: string  // full markdown document to ingest
split_at_level?: 2 | 3    // default: 3 (H3 boundary)
link_to?: string[]        // auto-link created items via 'documents' relation
dry_run?: boolean         // preview: return what WOULD be created, no write
```

## YAML Frontmatter Mapping

| YAML field    | → doc-item field            |
|---------------|-----------------------------|
| title         | item title (replaces H3 text if single-section doc) |
| diataxis      | diataxis_type               |
| related_items | linked_items.documents      |
| author        | author                      |
| status: approved | item status = done       |

## Backwards Compatibility

Existing behavior (title + diataxis_type + output_path → skeleton file) is UNCHANGED. `content_markdown` is optional — existing callers are unaffected.

## Relation to STORY-250

STORY-250 proposed `create_item: true` flag (single-item atomic creation). The ingestion mode is a strict superset — N-item ingestion subsumes the 1-item case. STORY-250 is superseded by this story.

## Acceptance Criteria

- [ ] `parseDocumentFragments(content, level)` pure function in `packages/shared` — splits markdown at heading level, returns array of `{ title, description, headingRange }`
- [ ] `extractFrontmatter(content)` pure function in `packages/shared` — parses YAML frontmatter, returns typed object
- [ ] `devsteps_docs_new` handler: when `content_markdown` present, invokes splitter + creates N doc-items + returns created IDs
- [ ] `docsNewTool` schema updated with new optional parameters
- [ ] `dry_run=true` returns preview of what would be created (no writes)
- [ ] `link_to` auto-links created items via `documents` relation
- [ ] ≥8 unit tests: empty frontmatter, no H3 sections (full doc = 1 item), H3 with H4+H5 children, multiple H3s, split_at_level=2, dry_run, link_to
- [ ] STORY-250 marked superseded-by this story

## Authoring Invariant (added 2026-04-10)

**Authors always start at H1.** The natural Copilot (and human) writing convention is `# Title` as the root heading. The ingestion tool must accept this and store the content with H1 as-is:

```markdown
# Kerberos RBCD — UNC-Delegation im Bootstrap   ← stored internally as H1

## Hintergrund — Das Double-Hop-Problem          ← stored as H2 content within fragment
...
```

**Heading level normalization happens at assembly time**, not at ingestion time. The `devsteps_docs_assemble` step (TASK-436: `adjustHeadingLevels`, TASK-437: `exportHandler`) computes `offset = bom_position_level - 1` and shifts all headings in the fragment before concatenation.

**`split_at_level` applies to the SOURCE document level** (where H1 is the root). Default `split_at_level: 1` means: split the document at H1 boundaries → each H1 block = one doc-item. The stored fragment includes all subordinate H2/H3/H4/H5 content verbatim at their original levels.

**Example flow:**
```
Input (authored):          Stored in doc-item:    Assembled (BOM pos=3):
# Main Title       →      # Main Title      →    ### Main Title
## Section A              ## Section A            #### Section A
### Detail 1              ### Detail 1            ##### Detail 1
```

**No heading normalization during ingestion** — parsers must NOT change heading levels on write. Only the assembler (export path) adjusts levels.

## Updated Acceptance Criteria addition
- [ ] `split_at_level` defaults to 1 (H1 boundary = one doc-item per H1 block)
- [ ] Ingested content stored with original heading levels unchanged
- [ ] Tool description documents the "always H1" authoring convention

## CORRECTION — split_at_level type and default (2026-04-10 audit)

The parameter block above incorrectly defines `split_at_level?: 2 | 3`.

**Corrected definition:**
```typescript
split_at_level?: 1 | 2 | 3   // default: 1 (H1 boundary)
```

Since authors always write documents starting at H1, the default split boundary is H1. Each H1 block becomes one doc-item containing all subordinate H2/H3/H4/H5/code content unchanged.

**Use cases:**
- `split_at_level: 1` (default) — one H1 block = one doc-item. Normal case for all authored docs.
- `split_at_level: 2` — one H2 block = one doc-item. For reference docs with many small H2 chapters.
- `split_at_level: 3` — one H3 block = one doc-item. Only for legacy docs that were already structured at H3 level (e.g., the RBCD example before correction).

AC update: `split_at_level` must accept 1, 2, and 3; default is 1.

## Ergebnis (2026-04-10)

- `devsteps_docs_new` MCP-Tool komplett entfernt (Handler, Tool-Definition, Server-Registration)
- `generateSkeleton()` → `packages/shared/src/templates/diataxis.ts` mit `generateDiataxisSkeleton()` + `detectDiataxisType()`
- `addItem()` in `add.ts` erkennt Diataxis-Type aus Tags/Titel und generiert Skeleton automatisch
- `addTool` Beschreibung aktualisiert (Diataxis-Skeleton-Dokumentation)
- STORY-250 → obsolete, STORY-274 → aktualisiert (Mode B/C nutzen `add`)
- Commit: `8543daf`"