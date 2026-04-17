Implement write-time and generation-time enforcement of Diataxis type compliance for DOC items. Closes the content-erosion gap identified in the CCMS theoretical analysis.

## Context
The CCMS/PIM analysis confirmed DevSteps has the correct assembly-layer architecture (BOM rollup). The write path lacks:
1. Write-time heuristic cross-check (add.ts + update.ts)
2. YAML frontmatter injection in bom_commit (read-path broken)
3. Missing MCP prompts for explanation + architecture types
4. UX nudge for diataxis_type on ad-hoc doc creation

## Scope
packages/shared/src/core/add.ts, update.ts
packages/mcp-server/src/handlers/devsteps_docs_bom_commit.ts
packages/mcp-server/src/handlers/prompts.ts

## Success Criteria
- AI-authored DOC items carry correct diataxis_type 
- Content erosion produces a warning (not a silent write)
- All 6 Diataxis types have MCP template prompts
- Imported docs have YAML frontmatter in .md file

## Research Basis
- tmp/analysis-context-diataxis-ccms-session1.md
- tmp/analysis-internal-diataxis-ccms-session1.md
- tmp/analysis-research-diataxis-ccms-session1.md