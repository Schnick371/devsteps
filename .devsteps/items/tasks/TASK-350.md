## Problem
0 of 34 agent files have any automated YAML frontmatter validation. Invalid frontmatter is only caught at runtime (when VS Code parses the agent file), not at commit time. This creates high risk of protocol violations going undetected until agents are invoked.

## Missing Validations
1. **Required fields**: Each agent file must have: `id`, `name`, `description`, `tools`, `user-invokable`
2. **Line count**: Each agent file must be ≤150 lines
3. **user-invokable correctness**: R0 coord agents → `true`; R1–R5 all others → `false`
4. **No `agents:` in leaf nodes**: R1–R5 files must NOT contain an `agents:` key
5. **No `"agent"` in leaf node tools[]**: R1–R5 tools[] must not include the `agent` tool

## Implementation Options
- **Option A (preferred)**: Bats test script (`tests/integration/cli/validate-agent-frontmatter.bats`) using `yq` or `python-yaml` for YAML parsing
- **Option B**: Vitest test in `packages/shared/src` that reads all `.github/agents/*.agent.md` files via Node.js `fs` and validates frontmatter
- **Option C**: GitHub Actions workflow step using `actionlint` + custom Python script

## Acceptance Criteria
- CI fails on any agent file with:
  - Missing required frontmatter field
  - Line count > 150
  - `user-invokable: true` on R1–R5 agent
  - `agents:` key present on R1–R5 agent
  - `"agent"` in `tools[]` of R1–R5 agent
- Validation runs on every PR touching `.github/agents/`
- Test report shows which file and which rule failed