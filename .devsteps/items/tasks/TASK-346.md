## Problem
The `'think'` tool is listed in the VS Code Copilot agent spec as "always recommended for analysis" but is missing from 37/38 agent files. Without it, analytical agents (coord, exec-planner, analysts, aspects) cannot use structured reasoning before producing outputs.

## Affected Agent Rings
Add `think` to `tools[]` in:
- `devsteps-R0-coord*.agent.md` (all coord variants)
- `devsteps-R3-exec-planner.agent.md`
- `devsteps-R4-exec-impl.agent.md`
- `devsteps-R4-exec-test.agent.md`
- `devsteps-R4-exec-doc.agent.md`
- `devsteps-R1-analyst-*.agent.md` (archaeology, risk, research, quality)
- `devsteps-R2-aspect-*.agent.md` (impact, constraints, quality, staleness, integration)
- `devsteps-R5-gate-reviewer.agent.md`

## Fix
For each file, add `"think"` (or `think` without quotes, per VS Code YAML convention) to the `tools[]` array in YAML frontmatter.

Example:
```yaml
tools:
  - think
  - readFile
  - runCommands
  ...
```

## Acceptance Criteria
- All coord, planner, impl, test, doc, analyst-*, aspect-*, and gate-reviewer agents have `think` in `tools[]`
- Worker leaf nodes (worker-coder, worker-tester, etc.) evaluated individually — `think` optional for simple workers
- Verified by grep across all listed files

## Notes
Can be batched with TASK-345 (stale tool name update) in a single sweep for efficiency.Implemented: 'think' added to tools[] in all 36 agent files (33 double-quoted, 3 already single-quoted). Gate-PASS. Merged 2026-03-06.