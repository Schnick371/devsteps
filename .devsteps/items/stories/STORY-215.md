Restructures devsteps-05-research.prompt.md to provide two dispatch profiles:

**FOCUSED profile:** 2-3 agents (analyst-research → aspect-constraints). For bounded API/library/pattern questions. Gate criteria: ≥5 sources, direct answer required. Does NOT require all 5 coverage axes.

**DEEP profile:** Existing 9-agent full Spider Web dispatch. For architecture decisions, ecosystem comparisons, cross-cutting audits. Gate criteria: ≥10 sources, all 5 coverage axes (unchanged from current).

**Triage logic:** coord determines profile autonomously based on question type — no askQuestions needed. FOCUSED signals: bounded scope, single technology, yes/no or how-to answer. DEEP signals: 'which approach should we adopt', cross-package impact, community consensus.

**ATOMICITY REQUIREMENT:** FOCUSED dispatch profile addition and tier-conditional gate criteria MUST land in one commit. A FOCUSED profile without updated gate criteria causes every FOCUSED-tier gate to FAIL (current criteria require all 5 axes + 10 sources, which FOCUSED intentionally skips).

Note: devsteps-R5-gate-reviewer.agent.md requires NO changes — it reads acceptance_criteria parametrically from its dispatch mandate at runtime.

## Acceptance Criteria
1. Research prompt has FOCUSED profile section (3-agent dispatch table)
2. Research prompt has DEEP profile section (existing content, renamed)
3. Prompt contains dispatch-profile selector logic (triage criteria)
4. Ring 5 gate section uses tier-conditional criteria (FOCUSED: ≥5 sources; DEEP: ≥10 sources + all 5 axes)
5. gate-reviewer.agent.md unchanged
6. All three prompt copies in sync (mcp-server canonical, root, cli)