Research scope:
1) Ensure DevSteps doc item types have a well-defined YAML frontmatter schema (incl. support for mixed documentation standards such as Diataxis) and clarify how metadata is stored/validated.
2) Define export behavior when composing many partial documents into one larger result document: frontmatter from partial chapter documents must be stripped in the composed output.
3) Define heading-level offset rules based on document level (L1/L2...), e.g. H1 in L2 becomes H3, H3 in L2 becomes H5, while L1 root heading remains H1.

Expected output: evidence-based recommendations, internal-fit analysis, and actionable follow-up implementation items.

---
## Research Findings (2026-05-12, sprint close)

**Confidence:** 0.88 · **Report:** `tmp/spike-060-frontmatter-research.md` · **MandateResult:** `.devsteps/cbp/SPIKE-060/a3f7b2c1-9d4e-4a82-b6f0-1e5c8d0a7f3b.result.json`

### Q1 — Frontmatter schema
Current `DocFrontmatterSchema` (packages/shared/src/core/frontmatter.ts, STORY-278) has 5 fields. Cross-ref with MkDocs Material / Docusaurus / Pandoc shows gaps: `title`, `description`, `keywords`, `audience`, `slug`.

**Recommendation:** Extend with optional `title`, `description`, `keywords`, `audience` (enum: developer/user/operator/architect), `slug`. Change `.strict()` → `.passthrough()` for SSG forward-compat. Keep warning behaviour via `KNOWN_FIELDS`. Do NOT put frontmatter on `ItemMetadata.metadata` — wrong layer.

### Q2 — Frontmatter stripping on assembly
No `docs_assemble` handler exists yet — greenfield.

**Recommendation (hybrid b+c):** strip all chapter frontmatter from body output; root frontmatter is canonical; merge `tags[]` union-deduplicated from chapters into root; emit per-chapter HTML comment `<!-- devsteps:chunk doc_id="DOC-NNN" diataxis="reference" -->` for tooling. Only `tags[]` merges; all other root-only.

### Q3 — Heading-level offset
Formula `output_level = source_level + depth` (where `depth` = `DocsMapPositionEntry.depth`, 0-based). Validated against Pandoc `--shift-heading-level-by`. **H6 overflow policy: FAIL LOUDLY** with `AssemblyError` (DOC ID + depth + max heading); do NOT silently cap. Pre-flight check required.

### Follow-up implementation items (to be created separately)
1. STORY — extend `DocFrontmatterSchema` (Q1)
2. STORY — implement `docs_assemble` MCP tool (Q2+Q3 combined)
3. TASK — `shiftHeadingLevels` + `validateHeadingLevelCap(cap=6)` utility
4. SPIKE — CLI surface for assemble (`devsteps docs assemble --bom-root ARCH-001 --output dist/handbook.md`)

Sources: pandoc.org/MANUAL.html, squidfunk.github.io/mkdocs-material, docusaurus.io plugin-content-docs (all live-confirmed).