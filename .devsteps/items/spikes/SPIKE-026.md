## Research Goal

Deep investigation of VS Code 1.110 Copilot Hooks feature (https://code.visualstudio.com/docs/copilot/customization/hooks) and its potential for DevSteps Spider Web live visualization.

## Hypothesis

Hooks can execute shell commands at agent lifecycle events — pre/post tool calls, session start/end, message events. This creates a deterministic event stream that could power:
1. Live Spider Web ring-phase visualization in the DevSteps webview dashboard
2. Automated CBP mandate file ingestion and display
3. Security policy enforcement (block dangerous tool calls)
4. Context injection for coord agents (sprint state, checkpoint YAML)

## Scope

- Full VS Code 1.110 hooks API analysis (all event types, shell command interface, context injection format)
- Integration with existing DevSteps MCP server and webview (d3 + chart.js available)
- Comparison vs. current MandateResult file polling approach
- Additional VS Code 1.110 features review and rating

## Deliverable

Structured Research Brief with Technology Radar signals, prioritized recommendations, and DevSteps follow-up items.