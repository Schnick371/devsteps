## Context

The user identified a semantic inconsistency in the Spider Web ring numbering:
- `exec-planner` is R3 (Planning phase)
- `exec-impl`, `exec-test`, `exec-doc` are R4 (Execution phase)

However, all \"exec-*\" agents are conductors (they orchestrate workers). The cleaner architecture is:
- R3 = ALL exec conductors (planner, impl, test, doc)
- R4 = ALL worker leaf nodes (worker-impl, worker-test, etc.)
- R5 = gate-reviewer

## Goals

1. Rename `devsteps-R4-exec-impl.agent.md` → `devsteps-R3-exec-impl.agent.md`
2. Rename `devsteps-R4-exec-test.agent.md` → `devsteps-R3-exec-test.agent.md`
3. Rename `devsteps-R4-exec-doc.agent.md` → `devsteps-R3-exec-doc.agent.md`
4. Update all references in coord agents, prompts, and protocol docs
5. Determine if domain-specific exec planners are needed (e.g., R3-exec-planner-code, -test, -doc)
6. Update AGENT-DISPATCH-PROTOCOL.md and devsteps-agent-protocol.instructions.md ring tables

## Result (2026-03-04)

**Decision:** Do NOT rename R4→R3. Ring = phase semantics preserved.
**Fix applied:** Role clarity via Conductor/Leaf Node labels (Option C).
**Commit:** `41ede7f` — 9 files, 12 insertions, 9 deletions

**What changed:**
- exec-impl/test/doc: `**Role** | Conductor ... NOT a leaf node`
- worker-impl/test/doc: `**Leaf Node**: NEVER dispatches subagents` + fixed `Dispatched by`
- Ring 4 row in AGENT-DISPATCH-PROTOCOL, copilot-instructions, devsteps-agent-protocol: split Conductors vs Workers

**Domain-specific exec planners:** Rejected (premature — R1+R2 unanimous).