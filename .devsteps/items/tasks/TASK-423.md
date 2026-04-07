The existing "Use AI Tools via MCP" walkthrough step (id: `devsteps.gettingStarted.mcp`) shows low-level examples ("List my open tasks") but does not mention the primary entry point for users: typing `/dev` in Copilot chat to access prepared DevSteps prompts. Update this step to:
- Mention `/dev` in Copilot chat as the main way to invoke DevSteps workflows
- Mention available agent modes (e.g. `devsteps-R0-coord` for planning and implementation)
- Keep message compact and actionable

**Affected files:** `packages/extension/package.json` — walkthrough step `devsteps.gettingStarted.mcp`Implemented: MCP walkthrough step updated with /dev entry point and devsteps-R0-coord agent mode hint. Merged in same commit as TASK-422.