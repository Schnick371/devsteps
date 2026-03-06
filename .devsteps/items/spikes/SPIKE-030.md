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
- Go/no-go: should Spider Web protocol be redesigned to not depend on experimental API?