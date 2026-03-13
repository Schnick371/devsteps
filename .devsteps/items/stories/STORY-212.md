Two interrelated problems visible in production sessions:

1. STOP PROTOCOL BREACH: R1/R2 agents ask \"What should happen next?\" after completing their MandateResult. They violate the leaf-node behavioral invariant. Root cause: \"Return in chat (nothing else)\" is not strong enough; models continue generating after the result block.

2. R3 BOTTLENECK + CONTEXT-POOR QUESTIONS: When the coordinator needs human input (before or during R3), questions arrive one-at-a-time with minimal context (~\"Research complete. What next?\"), potentially contradicting each other. Users cannot make good decisions from context-free questions.

Solution design needed:
- Mandatory STOP protocol for ALL R1/R2/R3/R4 leaf agents
- Coordinator-Synthesized Pre-Planning Gate (CSPG): coord reads ALL R1+R2 results, composes ONE rich batched #askQuestions if clarification needed, THEN dispatches R3 with answers embedded
- New exec-planner verdict: NEEDS_CLARIFICATION + clarification_needed[] field in findings
- Document R1-R2 iterative cycle for contradiction resolution

affected_paths: .github/agents/, .github/instructions/devsteps-agent-protocol.instructions.md
## Result

Implemented STOP protocol + CSPG (Coordinator-Synthesized Pre-Planning Gate) across all Spider Web agents.

**Changes (36 files, 266 insertions):**
- `devsteps-R0-coord.agent.md` (×3): Step 3 restructured — 3a synthesis gate, 3b pre-planning clarification gate (fires BEFORE exec-planner, displays structured overview + ONE batched #askQuestions with multiple-choice options, skip if clear), 3c exec dispatch, 3d post-sprint gate. #askQuestions boundary updated.
- `devsteps-R3-exec-planner.agent.md` (×3): NEEDS_CLARIFICATION verdict + clarification_needed[] schema + STOP rule
- R1 analysts (×4 agents × 3 mirrors = 12): explicit STOP rules in Behavioral Rules
- R2 aspects (×5 agents × 3 mirrors = 15): STOP directive appended
- `devsteps-CSPG.instructions.md`: new file (89 lines) — Gate A/B/C protocol
- `devsteps-agent-protocol.instructions.md`: trimmed to 146 lines; CSPG loop bounds
- `Copilot-Files-Standards-Specification.instructions.md`: 2 new PERMITTED entries

Gate-reviewer: PASS (0.95) after ishikawa trim fix. All 417 tests pass.
