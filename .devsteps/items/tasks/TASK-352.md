## Problem
The coord agent currently starts dispatching Ring 1 agents without verifying that DevSteps MCP tools are accessible. If the MCP server is down, misconfigured, or the `devsteps-mcp-tsx` binary is not found, tool calls fail silently with generic "tool not found" errors. The user has no actionable information.

## Fix
Add an MCP preflight health check step at the start of `devsteps-R0-coord.agent.md` execution, before Ring 1 dispatch:

```markdown
## Step 0 — MCP Preflight
Call `mcp_devsteps_status` with no arguments. 
- If it returns successfully: proceed to triage and Ring 1 dispatch.
- If it fails or times out: STOP. Report to user:
  > "DevSteps MCP server is unreachable. Cannot dispatch agents. Please verify:
  > 1. MCP server is running: `node packages/mcp-server/dist/index.js`
  > 2. `.vscode/settings.json` has correct `devsteps-mcp` server config
  > 3. Run `devsteps status` in terminal to test connectivity"
```

## Acceptance Criteria
- coord always calls `mcp_devsteps_status` as first action
- If preflight fails: coord outputs clear error message with remediation steps and stops (does not dispatch Ring 1)
- If preflight passes: existing dispatch flow continues unchanged
- No performance impact when MCP is healthy (status call is ~5ms)

## Notes
This is a 5-line addition to the coord agent instruction — cost is minimal, payoff (clear error messages vs. cryptic tool failures) is high.