## Context
VS Code 1.110 introduced Agent Plugins (experimental) — bundles of skills, agents, commands, hooks, MCP servers installable via `@agentPlugins` in the Extensions view. DevSteps already has `.agent.md`, `.prompt.md`, and hooks — only a `plugin.json` manifest is missing.

## Scope
- Create `plugin.json` at repo root or `packages/extension/` conforming to `chat.plugins.paths` spec
- Declare: plugin ID, display name, description, entry agent path, capability flags
- Wire into `package.json` contributes so DevSteps self-registers on install
- Document in README: `chat.plugins.paths` self-registration + `@agentPlugins` discovery
- Gate on Copilot availability at runtime: `vscode.extensions.getExtension('GitHub.copilot') !== undefined`

## Acceptance Criteria
- DevSteps installable via `chat.plugins.paths` setting
- Plugin manifest validates against VS Code agent plugin schema
- Copilot-free fallback: MCP-only mode when Copilot unavailable