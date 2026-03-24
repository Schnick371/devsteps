## Problem

R0 coordinators dispatch R1 subagents as a single-instance-per-type fan-out. When large analysis tasks could be split by scope (e.g. two analyst-internal instances scanning different package subtrees), or when web research benefits from simultaneous multi-angle queries, coordinators assign the entire problem to one agent — creating a bottleneck.

## Goal

Update all coordinator agent files and protocol documents to explicitly mandate:
1. Same-type multi-instance dispatch when a task can be partitioned by scope, path, or angle
2. Concrete scope-split strategies for analyst-internal (package split), analyst-web (topic split), analyst-context (concern split)
3. Protocol guidance distinguishing "single broad mandate" from "parallel narrow mandates"

## Affected Paths
- .github/agents/devsteps-R0-coord.agent.md
- .github/agents/devsteps-R0-coord-sprint.agent.md
- .github/agents/AGENT-DISPATCH-PROTOCOL.md
- .github/instructions/devsteps-agent-protocol.instructions.md
- .github/copilot-instructions.md
- packages/*/*/.github/ copies of the above## Result (2026-03-23)

Implemented scope-split fan-out for R0 coordinators. All 8 tasks completed:
- ADP: added DPF §2 section + I-13 scope-split invariant with Scope-Split Fan-Out subsection
- coord.agent.md: compressed 208→150 lines; DPF migrated to ADP §2 reference; fan-out subsection added
- coord-sprint.agent.md: compressed 218→150 lines; same pattern
- devsteps-agent-protocol.instructions.md: invariant #9 added (scope-split)
- copilot-instructions.md: Scope-split fan-out row added to behavioral rules table
- All 6 package copies synced (mcp-server + cli)

Merged to main via story/STORY-213 (--no-ff). Commit: c6f27b8