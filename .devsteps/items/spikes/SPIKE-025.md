## Purpose
Persist R1+R2 Spider Web dispatch research results for VS Code 1.110 as a structured reference document.

## Document content
- Agent Debug Panel API status: confirmed UI-only, no programmatic access, no persisted data
- Correct integration path: MCP handler instrumentation → CBP trace fields → webview ring visualization
- Agent Plugin (`@agentPlugins`) format: plugin.json spec, `chat.plugins.marketplaces`, `chat.plugins.paths`
- Context compaction risk and guard strategy for Spider Web coord agents
- FileSystemWatcher debounce findings: 3 watchers, 0 debounce, fix strategy
- Privacy finding: cbp/ + analysis/ not gitignored

## Output
File: `.devsteps/research/vscode-1110-agent-debug-2026-03-05.md`

## Acceptance Criteria
- Research document written and committed
- Key findings summarized for future reference