---
applyTo: ".github/prompts/devsteps-57-*.prompt.md,.github/prompts/devsteps-58-*.prompt.md,.github/prompts/devsteps-59-*.prompt.md,.github/agents/devsteps-R4-worker-doc-gap.agent.md"
description: "Doc-System governance — H1 authoring invariant, split rules, ingestion/assembly contracts, and placeholder lifecycle"
---

# Doc-System Governance

## 1. Authoring Invariant — Always H1

Every `doc` item's `description` field **must** begin with an H1 heading:

```markdown
# Fragment Title

## Background
Content here...
```

H2–H5 sub-headings inside the description are **inline prose content** — they are NOT separate doc items. Do not create one doc item per sub-heading; one H1 block = one doc item.

**Tool:** `devsteps add type=doc --title "…" --description "# …"` (or via MCP `mcp_devsteps_add`). The removed `devsteps_docs_new` tool no longer exists — always use the generic `add` path.

## 2. Ingestion — No Heading Rewrite

When splitting a document into doc items, **store content verbatim**. Do not shift headings at write time.

```
Input authored:    Stored in doc-item:
# Main Title  →   # Main Title         ← unchanged
## Section A      ## Section A
```

Heading normalization happens **only** at assembly time (see §4).

## 3. Split Rules — `split_at_level`

> **Status:** `parseDocumentFragments(content, splitLevel)` is planned (TASK-537, `draft`). Until implemented, splitting is done manually per fragment.

| Value | Splits at | Default? | Use case |
|-------|-----------|----------|---------|
| `1` | H1 boundaries | ✅ Yes | All standard authored docs |
| `2` | H2 boundaries | — | Reference docs with many H2 chapters |
| `3` | H3 boundaries | — | Legacy docs pre-dating this standard |

Default is **`split_at_level: 1`** — one H1 block per doc item.

## 4. Assembly — BOM Offset Formula

> **Status:** `adjustHeadingLevels(content, offset)` is planned (TASK-436, `draft`). Until implemented, assembly is manual or skipped.

At render/export time, shift all headings by `offset = bom_level − 1`, hard cap at H6:

| BOM depth | offset | H1 in source → output |
|-----------|--------|------------------------|
| 1 (root)  | +0     | `# Title` → `# Title` |
| 2 (chapter) | +1   | `# Title` → `## Title` |
| 3 (section) | +2   | `# Title` → `### Title` |
| 4 (subsection) | +3 | `# Title` → `#### Title` |

Never produce H7+ output. Protect fenced code blocks from heading detection.

## 5. Placeholder Lifecycle

`worker-doc-gap` creates placeholder doc items with `status: draft` and empty `description`. Lifecycle:

1. **Created** — `status: draft`, description = `<!-- placeholder: <subsystem> <diataxis-type> -->`
2. **Filled** — author replaces description with real H1-content block
3. **Approved** — `status: done` (or frontmatter `status: approved`)
4. **Stale** — placeholder older than 30 days with no description change → flag in `doc-review`
5. **Cap** — `worker-doc-gap` creates at most **20** placeholders per run to prevent backlog flood

Placeholders render as `<!-- placeholder -->` comments in assembled output (do not block assembly).

## 6. Anti-Patterns

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| `### Fragment Title` as first heading | `# Fragment Title` always |
| One doc item per H4/H5 | One doc item per H1 block |
| Rewrite headings on ingestion | Store as-is; shift at assembly |
| Use `devsteps_docs_new` | Use `devsteps add type=doc` |
| `split_at_level: 3` for new docs | `split_at_level: 1` (default) |
