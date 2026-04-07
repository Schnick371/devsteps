Research brief for five interconnected documentation architecture decisions:

1. **Story callout boxes**: How can DevSteps Stories (and other work item types) be rendered as standalone callout boxes embedded in TSD flowing prose — as technical literature uses "Note", "Caution", "Example" boxes? What markdown-it plugin approach enables this?

2. **Doc subtypes + Diataxis alignment**: The `doc` ItemType needs subtypes: Research, SPIKE (embeds), Analysis, Aspect, Tutorial, Architecture. Diataxis (documentation system by Daniele Procida) defines 4 types: Tutorials, How-Tos, Reference, Explanation. How do DevSteps doc subtypes map to Diataxis? REMARC Insight is a related tutorials learning platform. Research output files (e.g., `tmp/analyst-research-SPIKE-039-session1.md`) must NOT stay in `tmp/` — they need a proper home.

3. **Research chapter vs. classification**: Should the documentation system use a separate "Research" chapter in the overall document structure, or multiple classified structures with "purpose" metadata? Is it better to have a classification system or a purpose-first hierarchy?

4. **Markdown preview for DevSteps items**: When viewing DevSteps work items (`.devsteps/` files), use Markdown preview instead of text editor. Currently there is no dedicated viewer. This also relates to the SPIKE-039 finding that ReferenceProvider opens `.md` in text editor mode, not preview.

5. **No code in docs policy**: Code should NOT appear in documentation prose except as special callout boxes (like code examples in technical books). What is the best practice for maintaining this separation?

Key related items: SPIKE-036 (TSD + BOM), SPIKE-038 (previewScripts), SPIKE-039 (code-to-doc navigation)## Research Output — Gate PASS (0.97)

Research brief: `docs/research/SPIKE-040/SPIKE-040-DocArch-II-Research-Brief.md`

### 5 Binding Decisions

1. **Story callout boxes** → `::: story STORY-NNN`, `::: task`, `::: spike`, `::: code-example` via `markdown-it-container` (markdownItPlugin); static embed via `embeds-cache.json` (Node.js `fs.readFileSync` — markdownItPlugin CAN use fs)

2. **Doc subtypes** → Extended Diataxis: `tutorial | how-to | reference | explanation | architecture | research` + `generated?: boolean` on `DocsMapNode`. Research = 5th non-Diataxis intelligence category.

3. **Research preservation** → `docs/research/{item_id}/` permanent archive, `docs/research/{item_id}/agents/` for agent-generated output. `tmp/` is EPHEMERAL — add README warning. URGENT: 28+ files at deletion risk.

4. **Item viewer** → `devsteps-item://` TextDocumentContentProvider + `devsteps.previewItem` command → `markdown.showPreview`. Repurposes STORY-220 scope.

5. **Code in docs policy** → NO code in prose. SOLE exception: `::: code-example` callout box (C4/arc42 principle).

**Silent BUG found:** `onLanguage:markdown` missing from extension activationEvents — all Phase C contributions silently inactive.

8 new work items to create via devsteps-10-plan-work.