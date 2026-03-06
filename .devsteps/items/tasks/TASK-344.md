## Problem
Approximately 19 agent files are missing the `user-invokable: false` frontmatter field. Without this field, VS Code's agent picker surfaces them as directly invokable by users. These agents are orchestration/execution ring agents that should only be dispatched by `coord-*` via `runSubagent` — they must NOT appear in the user-facing agent picker.

## Affected Agents (19 files)
- `exec-planner`
- `exec-impl`
- `exec-test`
- `exec-doc`
- `worker-coder`
- `worker-tester`
- `worker-documenter`
- `worker-devsteps`
- `worker-refactor`
- `worker-integtest`
- `worker-workspace`
- `worker-guide-writer`
- All `aspect-*` agents (impact, constraints, quality, staleness, integration) — 5 files
- All `analyst-*` agents (archaeology, risk, research, quality) — 4 files

## Fix
Add to the YAML frontmatter of each affected file:
```yaml
user-invokable: false
```

Per the VS Code Agent Plugin spec, omitting this field defaults to `true` (user-invokable), which is incorrect for ring agents.

## Affected File Pattern
`.github/agents/devsteps-R[1-5]-*.agent.md` — all except `devsteps-R0-coord*.agent.md`

## Acceptance Criteria
- All ring 1–5 agent files have `user-invokable: false` in frontmatter
- Verified by: `grep -rL "user-invokable: false" .github/agents/devsteps-R[1-5]-*.agent.md` returns empty
- coord agents (`devsteps-R0-*`) retain `user-invokable: true` (or omit, accepting default)
- Frontmatter CI validation (separate task) covers this field