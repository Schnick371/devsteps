Research deeply: How should DevSteps help Copilot/AI agents understand and navigate project documentation?

**Core research questions:**

1. **Diataxis framework** — What is Diataxis (Divio) and how does the tutorial/how-to/reference/explanation split transform Copilot context quality? Evidence from real projects? Adoption stats?

2. **Docs import tooling** — What is the best approach for `devsteps docs import` in an existing project with 50+ markdown files? Options:
   - Recursive scan + auto-create DOC items with AI-generated keywords + diataxis_type
   - Interactive CLI prompt per file
   - AI-assisted bulk classification (LLM sees title + first 3 lines → assigns diataxis_type)
   - Integration INTO `devsteps init --import-docs` (one-shot for new adopters)

3. **Diataxis SPLITTING** — When a monolithic document contains multiple Diataxis types (tutorial + reference mixed), should `devsteps docs import` suggest splitting? How do other tools handle this (Backstage TechDocs, Diátaxis-based tooling)?

4. **Copilot context delivery** — How should DevSteps explain Diataxis to Copilot?
   - MCP `prompts/` resource (served via MCP protocol)?
   - New `.github/instructions/devsteps-diataxis.instructions.md`?
   - Both?
   - What content is most useful to Copilot during doc creation/review tasks?

5. **AI doc quality gates** — Are there existing tools/linters that validate Diataxis classification quality? What signals can DevSteps surface to Copilot?

6. **Research preservation** — When analyst reports (tmp/analyst-*.md) are promoted to docs, what Diataxis type are they? (explanation? reference?) And should the import detect this pattern automatically?

**Target outputs for research brief:**
- Decision: `devsteps docs import` design (command shape, flags, interactive vs automated)
- Decision: how Copilot learns Diataxis (instructions file? MCP resource? both?)
- Metadata schema extensions for diataxis_type field
- 5+ concrete examples of Diataxis in well-known OSS projects
- Competitive landscape: Backstage TechDocs, Mintlify, Docusaurus Diataxis support
- Recommended implementation path (which STORY/TASK to create)

**Reference:** See SPIKE-041 for existing DOC item architecture. See BUG-075 (done) for infrastructure state. See `.github/instructions/Copilot-Files-Standards-Specification.instructions.md` for Copilot file standards (≤150 lines, YAML frontmatter required).## Gate Result — PASS (0.91)

Ring 5 gate-reviewer iteration 2 passed all 10 acceptance criteria. Research brief at `tmp/SPIKE-043-DiataxisImport-Research-Brief.md`.

**Key Decisions:**
- `devsteps docs import`: hybrid auto-scan + 9-pattern heuristic classification + dry-run (no LLM dependency)
- Split detection: flag-and-suggest (NOT auto-split)
- Copilot context: `devsteps-diataxis.instructions.md` (always-on) + 4 MCP prompts (on-demand)
- Auto-detect: `analyst-*`, `aspect-*` → `doc_subtype: research, generated: true`

**Implementation items created:** STORY-236, STORY-237, TASK-397–401