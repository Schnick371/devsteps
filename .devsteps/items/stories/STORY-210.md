## Goal

(a) Fix VS Code \"Unknown agent\" compiler errors in `devsteps-R0-coord-ishikawa.agent.md` caused by `handoffs:` referencing agents with `user-invocable: false`, and (b) enrich worker agent files (worker-documenter, worker-doc, analyst-research, exec-doc) with richer mandate formats, missing aspects, and corrected output contracts.

## Root Cause

`handoffs:` is a VS Code UI navigation feature that validates referenced agents against the user-invocable picklist. All referenced analysts/aspects have `user-invocable: false`, causing all 8 `handoffs:` entries to fail as \"Unknown agent\".

## Scope

- `.github/agents/devsteps-R0-coord-ishikawa.agent.md` — remove `handoffs:` block
- `.github/agents/devsteps-R0-coord.agent.md` — remove `handoffs:` block  
- `.github/agents/devsteps-R4-worker-documenter.agent.md` — enrich mandate format, add TSDoc, add write_mandate_result
- `.github/agents/devsteps-R4-worker-doc.agent.md` — clarify planner role, add version/hash
- `.github/agents/devsteps-R1-analyst-research.agent.md` — add aspect-constraints to agents:, fix t3_recommendations
- `.github/agents/devsteps-R2-aspect-quality.agent.md` — fix blank mission statement
- `.github/agents/devsteps-R2-aspect-impact.agent.md` — fix blank mission statement