Copilot koordinatoren fragen den User selbst wie die Spider Web Ringe ausgeführt werden sollen — das ist die exklusive Aufgabe des coordinators und sollte niemals als Frage an den User gehen. Ursache: #askQuestions wird zu undifferenziert in Prompt- und Agent-Dateien verwendet.

Scope: 
- devsteps-30-rapid-cycle.prompt.md — #askQuestions zu breit/häufig referenziert
- devsteps-10-plan-work.prompt.md — "#askQuestions before ANY dispatch" zu aggressiv
- Copilot-Files-Standards-Specification.instructions.md — fehlt explizite #askQuestions-Grenze für Koordinatoren
- copilot-instructions.md — fehlt explizites Verbot: Triage/Ring-Entscheidungen sind autonom

Fix: Explizite Verwendungsgrenze für #askQuestions definieren. Nur erlaubt bei: (1) fehlende Item-Selektion, (2) ESCALATED/HIGH_RISK, (3) Abschluss-Bestätigung im iterativen Modus, (4) Guide Cycle: Tester-Feedback.

affected_paths: .github/prompts/, .github/instructions/, .github/copilot-instructions.md## Implementation Result (STORY-211)

**Root cause confirmed:** `devsteps-40-sprint.prompt.md` "Triage override — force QUICK/STANDARD/FULL" in #askQuestions block invited users to configure internal ring mechanics. This violated the Spider Web autonomy model and the Never Act Alone invariant.

**8 files fixed (root + package mirrors):**
1. `devsteps-40-sprint.prompt.md` (×3) — removed triage override from Pre-Sprint Clarification; added explicit autonomy note 
2. `devsteps-R0-coord-sprint.agent.md` (×3) — removed "triage override" from #askQuestions prompt; added NEVER ask about ring selection
3. `devsteps-R0-coord.agent.md` — added `#askQuestions boundary` rule to Operational Rules (PERMITTED/PROHIBITED)
4. `Copilot-Files-Standards-Specification.instructions.md` — added `### #askQuestions Usage Boundaries` section (141 lines, within 150-line budget)

**Gate-reviewer verdict:** GO (0.95 confidence)
**Merged:** main / branch story/STORY-211 deleted