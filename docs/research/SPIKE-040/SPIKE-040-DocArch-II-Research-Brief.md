# SPIKE-040 Research Brief — Documentation Architecture II
## Story Callout Boxes · Doc Subtypes · Research Preservation · Diataxis-Aligned Classification

**Item:** SPIKE-040  
**Date:** 2026-04-03  
**Status:** research complete, plan ready  
**Gate:** pending  
**Related:** SPIKE-036 (TSD+BOM), SPIKE-038 (previewScripts), SPIKE-039 (code navigation)

---

## 1. Executive Summary (4–5 sentences)

Five interconnected documentation architecture questions were researched. The answers establish: (1) Story/Task/Bug callout boxes via `::: story` markdown-it-container syntax (not GFM alerts — custom types are impossible without a plugin); (2) an Extended Diataxis taxonomy with 5 doc_subtypes + a 5th "research" category; (3) a permanent `docs/research/{item_id}/` archive that replaces the ephemeral `tmp/` convention (URGENT: 28+ critical files at deletion risk); (4) a lightweight `devsteps-item://` TextDocumentContentProvider pattern for opening DevSteps items in Markdown preview (lighter than CustomEditorProvider); (5) an explicit "no code in prose" policy with `::: code-example` as the sole exception for code illustrations. A `onLanguage:markdown` missing from extension activationEvents was identified as a silent bug affecting all Phase C markdown contributions. Research confidence: 0.95.

---

## 2. Research Horizon

**90-day window:** 2026-01-03 to 2026-04-03  
**Sources:** Internal codebase analysis (SPIKE-036 brief, SPIKE-038 findings, extension package.json, DocsMapNode schema), diataxis.fr framework specification, VS Code Markdown Extension API, markdown-it-container npm, GitHub GFM Alerts specification, arc42 architecture documentation template, C4 model documentation approach.

---

## 3. Five Research Decisions

### Decision 1: Story Callout Boxes — Syntax Choice

**Decision:** Use `markdown-it-container` plugin with `::: story` / `::: task` / `::: spike` / `::: code-example` blocks.

**Selected:** `::: story STORY-042 :::` (markdown-it-container)

**Why not GFM Alerts (`> [!NOTE]`):**
- VS Code ≥1.87 supports GFM alerts natively WITHOUT a plugin
- BUT: only 5 types are supported: `NOTE`, `TIP`, `WARNING`, `CAUTION`, `IMPORTANT`
- Custom types like `[!STORY]`, `[!TASK]`, `[!SPIKE]` require a markdownItPlugin override
- If we need a plugin anyway, markdown-it-container (`::: type`) is the more expressive choice

**How callout boxes work technically:**

```
::: story STORY-042
Authentication Flow — The main user login sequence that validates credentials
through the OAuth provider. Spans 3 sprints.
:::
```

Rendered in VS Code preview as a styled box with the STORY icon, ID badge, and content.

**Static embed architecture (critical):**
- `markdownItPlugins` run in the **Node.js extension host** — can use `fs.readFileSync` ✅
- `previewScripts` run in the **browser webview** — cannot use `fs` ❌
- Solution: at extension `activate()`, component `embedsCache.ts` reads all DevSteps items and writes `.devsteps/index/embeds-cache.json`
- `embedPlugin.ts` calls `fs.readFileSync(embedsCachePath)` synchronously at plugin registration time → renders `STORY-042` title + status in the box
- FSW watches `.devsteps/items/` for changes → invalidates and rewrites cache

**Five container types to support:**

| Syntax | Rendered as | Use case |
|--------|-------------|----------|
| `::: story STORY-NNN` | Work item callout box | Embedded story/feature reference in prose |
| `::: task TASK-NNN` | Task callout box | Referenced sub-task or implementation note |
| `::: spike SPIKE-NNN` | Research callout box | Embedded investigation reference |
| `::: code-example` | Code listing box | The ONLY way code appears in documentation (example/illustration callout) |
| `::: note` | General note box | Equivalent to GFM `[!NOTE]` |

**Code in docs policy:**
> **RULE:** Source code MUST NOT appear in TSD documentation prose. Exception: `::: code-example` callout boxes, which explicitly frame code as an illustration (like O'Reilly technical book code listings). This is an editorial boundary, not a technical restriction.

---

### Decision 2: Extended Diataxis Doc Subtype Taxonomy

**Diataxis Framework (Daniele Procida, diataxis.fr):**
Diataxis defines documentation on two axes: practical↔theoretical and learning↔doing. This produces 4 quadrants:
- Tutorial (learning + doing)
- How-To Guide (practical + doing)
- Reference (practical + theoretical)
- Explanation (learning + theoretical)

**DevSteps Extended Diataxis — added 5th category: Research/Investigation:**

The 5th category "Research" does NOT fit the 2×2 Diataxis axes because research output is neither clearly practical nor theoretical, and neither clearly learning nor doing — it is *intelligence synthesis*. It warrants its own category.

**`doc_subtype` enum for `DocsMapNode`:**

| Subtype | Diataxis equivalent | Description | Example docs |
|---------|--------------------|---------|----|
| `tutorial` | Tutorial | Hands-on learning, step-by-step | REMARC Insight-style tutorial docs |
| `how-to` | How-To Guide | Goal-oriented, task completion | "How to add a new MCP tool" |
| `reference` | Reference | Technical descriptions, schemas, APIs | MCP tool reference, CLI reference |
| `explanation` | Explanation | Background, concepts, rationale, "why" | Why DevSteps uses TSD format |
| `architecture` | Explanation (specialized) | System design, structural decisions, ADRs | TSD architecture docs |
| `research` | **5th (non-Diataxis)** | SPIKE outputs, investigation briefs, analyst/aspect reports | SPIKE-040 brief, analyst reports |

**DocsMapNode schema addition:**

```typescript
doc_subtype?: 'tutorial' | 'how-to' | 'reference' | 'explanation' | 'architecture' | 'research'
generated?: boolean  // true = AI-generated agent output, false = human-authored
```

**Mixed-subtype TSD:** A single TSD file CAN have sections of different subtypes. The `doc_subtype` is per-DocsMapNode, not per-file.

---

### Decision 3: Research Document Preservation Architecture

**URGENT finding:** 28+ critical research files currently in `tmp/` are at deletion risk from `scripts/complete-cleanup.sh`. These include:
- `tmp/SPIKE-036-TSD-BOM-Research-Brief.md` — foundation of TSD architecture
- `tmp/SPIKE-039-CodeToDoc-Research-Brief.md` — code navigation research
- All analyst/aspect session reports (`tmp/analyst-*`, `tmp/aspect-*`, `tmp/analysis-*`)

**Selected architecture: `docs/research/{item_id}/`**

```
docs/
  research/
    SPIKE-036/
      brief.md                    ← human-authored research brief
      agents/
        analyst-research-session1.md
        analyst-internal-session1.md
        aspect-constraints-session1.md
        ...
    SPIKE-039/
      brief.md
      agents/
        analyst-research-session1.md
        aspect-impact-session1.md
        ...
    SPIKE-040/
      SPIKE-040-DocArch-II-Research-Brief.md  ← this file
```

**Rules:**
1. `docs/research/` is git-tracked (NOT ignored)
2. Sub-folder per work item (by item ID)
3. Human-authored briefs go directly in `docs/research/{item_id}/`
4. Agent-generated files go in `docs/research/{item_id}/agents/`
5. `tmp/` is EPHEMERAL — add `README.md` with warning: "⚠️ ALL FILES IN THIS DIRECTORY ARE EPHEMERAL — DO NOT CREATE PERMANENT FILES HERE"
6. `scripts/complete-cleanup.sh` MUST be updated to exclude `docs/research/`

**ADP report_path convention update:**
Coord agents must use `docs/research/{item_id}/agents/` instead of `tmp/` for analyst/aspect output paths.

---

### Decision 4: DevSteps Item Viewer via Markdown Preview

**Selected:** `TextDocumentContentProvider` for `devsteps-item://` URI scheme

The user wants DevSteps items (viewing `.devsteps/items/{id}.json`) to open in Markdown preview, not a text editor. Since items are JSON, a custom TextDocumentContentProvider that renders JSON as formatted Markdown is the cleanest solution.

**Architecture:**

```typescript
// packages/extension/src/providers/DevStepsItemProvider.ts
class DevStepsItemProvider implements TextDocumentContentProvider {
  provideTextDocumentContent(uri: Uri): string {
    const itemId = uri.path.replace(/^\//, '');
    const item = itemCache.get(itemId);  // from STORY-225 item cache
    return renderItemAsMarkdown(item);
  }
}
// Registered in extension.ts:
workspace.registerTextDocumentContentProvider('devsteps-item', new DevStepsItemProvider());
// Opening:
vscode.commands.executeCommand('markdown.showPreview', 
  Uri.parse(`devsteps-item://item/${itemId}`));
```

**Rendered Markdown includes:**
- Title + ID + status badge
- Type, priority, eisenhower quadrant
- Full description
- Linked items as clickable links (→ open their own preview)
- Tags, commits, affected paths

**STORY-220 Update:** STORY-220 was originally titled "VS Code Depth View — TextDocumentContentProvider" for TSD depth filtering. ADR-S2-01 (SPIKE-036) replaced TSD depth with previewScripts (STORY-227). STORY-220's description must be updated to: **DevSteps Item Viewer via `devsteps-item://` TextDocumentContentProvider** — a completely repurposed use of the same VS Code API.

---

### Decision 5: Code Documentation Policy

> **Explicit rule:** No source code SHALL appear in TSD documentation prose — not even short snippets, type signatures, or variable names in code font.
>
> **Exception:** `::: code-example` callout boxes are the ONLY permitted place for code. These are equivalent to "Code 1.1" listings in O'Reilly books — explicitly framed as examples, visually distinct from prose.

**Rationale:**
- Architecture documentation describes BEHAVIOR and INTENT, not implementation
- C4 model: code (Level 4) is separate from architecture (Levels 1–3) — code only at the deepest implementation level
- arc42 template: explicitly warns against embedding code in architecture docs (creates maintenance burden)
- AI + human benefit: Copilot can reason about architecture descriptions without code confusing context

---

## 4. Technology Radar Signals

| Technology | Signal | Rationale |
|-----------|--------|-----------|
| Diataxis framework | ADOPT | Widely adopted (Django, Kubernetes, PyPA) — proven for tech docs |
| markdown-it-container | ADOPT | The correct tool for custom callout types, active maintenance |
| GFM Alerts (`> [!NOTE]`) | TRIAL | Use for NOTE/TIP/WARNING only; NOT for custom DevSteps types |
| TextDocumentContentProvider | ADOPT | Established VS Code API, lighter than CustomEditorProvider |
| arc42 doc structure | ASSESS | Reference model for architecture docs without code in prose |

---

## 5. Silent Bug Found

**BUG: `onLanguage:markdown` missing from extension `activationEvents`**

All Phase C markdown contributions (`contributes.markdown.markdownItPlugins`, `contributes.markdown.previewScripts`) are silently inactive outside `.devsteps/` workspaces because `onLanguage:markdown` is not in `packages/extension/package.json` `activationEvents`. The contributions are DECLARED but the extension never activates on `.md` file events.

**Fix:** Add `"onLanguage:markdown"` to `activationEvents` in `packages/extension/package.json`.  
**Guard:** Add `hasDevStepsRoot()` check in `embedPlugin.ts` registration to avoid activating in non-DevSteps workspaces.

---

## 6. Work Items to Create (from devsteps-10-plan-work)

| Type | Title | Priority |
|------|-------|----------|
| BUG | `onLanguage:markdown` missing from activationEvents | urgent-important |
| TASK | `docs/research/` archive folder + `tmp/README.md` + cleanup script guard | urgent-important |
| TASK | Migrate 28+ research files from `tmp/` → `docs/research/{id}/` | urgent-important |
| TASK | Add `doc_subtype` + `generated` to `DocsMapNode` schema | not-urgent-important |
| TASK | `DevStepsItemProvider.ts` (`devsteps-item://`) + `devsteps.previewItem` command | not-urgent-important |
| TASK | `embedsCache.ts` — generate `.devsteps/index/embeds-cache.json` at activate() | not-urgent-important |
| STORY | `embedPlugin.ts` — `::: story`, `::: task`, `::: spike`, `::: code-example` container types | not-urgent-important |
| STORY | Update ADP report_path convention (coordinator instructions) | not-urgent-important |

---

## 7. Open Questions

1. Should `:::` container syntax in docs-map.yaml be validated? Or is it author-enforced convention?
2. What CSS framework is used in the depthSlider previewScript — does it have callout box styles built in?
3. REMARC Insight: is there a plan to cross-reference DevSteps tutorial docs into REMARC Insight presentations? (Currently: no coupling planned)
4. Should analyst/aspect reports in `docs/research/{item_id}/agents/` be included in docs-map.yaml? (Recommendation: NO — they are research artifacts, not TSD prose sections)

---

## 8. Decision Log

| Decision | Selected | Rejected | Key Reason |
|----------|----------|----------|-----------|
| Callout syntax | `::: container` (markdown-it-container) | GFM Alerts | GFM alerts: max 5 predefined types, no extension without plugin; container is more expressive |
| Code in docs | `::: code-example` boxes only | Inline code blocks | C4/arc42 principle: architecture docs describe behavior not implementation |
| Doc subtype taxonomy | Extended Diataxis (5 subtypes + research) | Pure 4-quadrant Diataxis | Research/Investigation output is a 5th intelligence category, doesn't fit 2×2 |
| Research preservation | `docs/research/{id}/` permanent archive | `tmp/` ephemeral | `tmp/` is deletion-risk; permanent knowledge requires git-tracked path |
| Item viewer | `devsteps-item://` TextDocumentContentProvider | CustomEditorProvider, raw JSON | Lighter API, existing markdown preview integration, no editor conflicts |