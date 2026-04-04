---
applyTo: "docs/**/*.md,.devsteps/docs/**"
description: "Diataxis documentation framework rules for doc authoring and classification"
---

# Diataxis Documentation Framework

## Quadrant Definitions

- **Tutorial**: Learning-oriented, guides the reader through steps to complete a project. Uses "you will…" language, baby-steps progression, concrete outcomes.
- **How-to**: Task-oriented, solves a specific real-world problem. Numbered steps, imperative verbs ("Run…", "Add…"), assumes working knowledge.
- **Reference**: Information-oriented, describes the machinery. Tables, signatures, parameter lists, exhaustive coverage. No opinions, no tutorials.
- **Explanation**: Understanding-oriented, explains why and how things work. Discusses alternatives, trade-offs, history, design rationale.

## Extended Types (DevSteps)

- **Architecture**: ADRs, system diagrams, layer descriptions. Subset of Explanation with decision focus. Use MADR 4.0 template for ADRs.
- **Research**: Investigation reports, competitive analysis, spike findings. Subset of Explanation with evidence focus.

## Authoring Rules

- Each document belongs to exactly ONE primary quadrant
- Title and H1 must signal the quadrant (e.g. "How to…", "Reference: …", "Why we chose…")
- Do NOT mix tutorial steps into reference pages or vice versa
- Cross-reference between quadrants with relative links instead of duplicating content
- Keep how-to guides under 200 lines; split longer procedures into linked parts
- Reference pages: prefer tables over prose for parameter/option listings
- Tutorials: include expected output after each step
- Explanations: state the question being answered in the first paragraph

## Classification Signals

| Signal | Quadrant |
|--------|----------|
| Path contains `architecture/` or `adr-` | Architecture |
| Path contains `research/` or `analyst-` | Research |
| Numbered steps with imperative verbs | How-to |
| "you will learn" / baby-steps / project-based | Tutorial |
| Tables of parameters, signatures, options | Reference |
| "Why", "Background", "Trade-offs", "Design" headings | Explanation |

## File Naming

- How-to: `how-to-<verb>-<noun>.md` (e.g. `how-to-add-mcp-tool.md`)
- Reference: `reference-<subject>.md` (e.g. `reference-cli-commands.md`)
- Tutorial: `tutorial-<goal>.md` (e.g. `tutorial-first-item.md`)
- Explanation: `explanation-<topic>.md` or free-form for architecture/research
- ADR: `adr-NNN-<slug>.md` with MADR 4.0 template
