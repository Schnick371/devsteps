Write the Diataxis instructions file for GitHub Copilot.

Hard constraints (Copilot-Files-Standards-Specification.instructions.md):
- ≤150 lines
- YAML frontmatter required: description (one-sentence), applyTo: "docs/**/*.md,.devsteps/docs/**"
- Bullet rules > prose
- NO code examples (WHY and WHAT, not HOW)

Content (6 sections, ≤25 lines each):
1. What is Diataxis (4-quadrant compass)
2. DevSteps extensions (architecture + research types)
3. Tutorial vs. How-To decision rules (3 signals each)
4. Reference vs. Explanation decision rules
5. Frontmatter for DOC items (diataxis_type field)
6. Cross-type navigation (readers follow compass, not folders)