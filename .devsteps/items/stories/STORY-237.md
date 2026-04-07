Deliver Diataxis context to GitHub Copilot via TWO channels:
1. `devsteps-diataxis.instructions.md` — always-on instructions file (≤150 lines, YAML frontmatter, bullet rules, NO code examples, applyTo: "docs/**/*.md,.devsteps/docs/**")
2. 4 on-demand MCP prompts: `devsteps-docs-diataxis-explain`, `devsteps-docs-write-howto`, `devsteps-docs-write-reference`, `devsteps-docs-classify`

Constraints: Copilot-Files-Standards-Specification.instructions.md rules are mandatory.

Depends-on: TASK-398, TASK-399## Done
- devsteps-diataxis.instructions.md (48 lines, applyTo docs/**/*.md)
- 4 MCP prompts: diataxis-explain, write-howto, write-reference, classify
- Commit: ea6f2f8