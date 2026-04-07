Update the Agent Dispatch Protocol (ADP) to require coord agents to use `docs/research/{item_id}/agents/` as the `report_path` for analyst and aspect output files, replacing the current informal `tmp/` convention.

**Current problem:** Analyst output files are written to `tmp/` with paths like `tmp/analyst-research-SPIKE-039-session1.md`. These are ephemeral — `scripts/complete-cleanup.sh` would delete them. Research intelligence is permanently lost.

**Changes required:**
1. Update `.github/agents/AGENT-DISPATCH-PROTOCOL.md` — add canonical `report_path` convention section:
   - `docs/research/{item_id}/agents/{analyst-type}-session{N}.md` for analysis reports
   - `docs/research/{item_id}/{brief-name}.md` for human-authored briefs (exec-doc output)
2. Update coordinator agent files (`.github/agents/devsteps-R0-coord.agent.md` etc.) — add note that report_path should use `docs/research/` not `tmp/`
3. Update the Ring 1 DPF dispatch prompt templates — example report_path values

**Depends on:** TASK-382 + TASK-383 (archive structure + migration must exist before convention is enforced)