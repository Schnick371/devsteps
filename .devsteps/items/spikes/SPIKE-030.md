## Context
The Spider Web Dispatch protocol relies on `runSubagent` — currently an Experimental VS Code Copilot API. All coord agents dispatch Ring 1–5 agents via `runSubagent`. If this API is removed, changed, or gated behind a different extension manifest permission, the entire agent orchestration system breaks.

The devsteps-agent-protocol instructions contain a fallback (`devsteps-R0-coord-solo`) but this is a significant capability downgrade — solo mode cannot parallelize Ring 1 fan-out.

## Research Questions
1. What is the current stability status of `runSubagent`? (experimental / proposed / stable)
2. Is there a GitHub issue/roadmap item tracking stabilization?
3. What breaking changes are expected between current API and stable version?
4. Are there API surface changes planned (different call signature, capability flags, nesting rules)?
5. Is there an alternative to `runSubagent` for coordinated multi-agent execution (e.g., agent chaining via participant handoff)?
6. What is Microsoft's public commitment (if any) to this API?

## Tracking Sources
- VS Code stable release notes (1.109, 1.110 — check for `runSubagent` mentions)
- `vscode.proposed.chatParticipantAddToContext.d.ts` and related proposed API files
- Microsoft GitHub Copilot Chat extension changelog
- VS Code discord / issue tracker

## Success Definition
Written briefing (LessonsLearned doc) covering:
- Current API status and stability guarantee
- Expected breaking changes before stabilization
- Recommended mitigation strategy if API becomes unavailable
- Go/no-go: should Spider Web protocol be redesigned to not depend on experimental API?## Resolution (2026-03-30)

**VS Code 1.113 (March 25, 2026) answers all research questions:**

### Q1: API Stability Status
**STABLE** — `runSubagent` is confirmed stable. VS Code 1.113 release notes explicitly mention it as a general-availability feature, not experimental.

### Q2–Q6: Additional Findings from 1.113
- **New capability:** `chat.subagents.allowInvocationsFromSubagents` — nested sub-agent dispatch enabled
- **New capability:** `chat.subagents.maxDepth` — recursion depth hard limit (recommended: 3)
- **No breaking API surface changes** between experimental and stable version
- **No alternative needed** — runSubagent is the correct mechanism confirmed long-term
- **Microsoft commitment confirmed** via stable release + extension capability

### Decision
Spider Web protocol dependency on `runSubagent` is VALIDATED — the fallback `devsteps-R0-coord-solo` remains as emergency fallback only.

### Follow-Up Item
EPIC-042 (Spider Web v2.0) builds on this stability confirmation to add Selective Nesting.

### LessonsLearned
Published to `LessonsLearned/research/SPIKE-030-runsubagent-stabilization.md` (pending TASK-370 implementation)