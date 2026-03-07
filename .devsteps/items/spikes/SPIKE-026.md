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

Structured Research Brief with Technology Radar signals, prioritized recommendations, and DevSteps follow-up items.## Research Result (2026-03-08)

Gate: PASS WITH NOTES (0.93) — GO decision confirmed.

### Key Findings
- VS Code 1.110 Hooks (Stable GA March 4, 2026): 8 event types (SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, PreCompact, SubagentStart, SubagentStop, Stop)
- Interface: stdin JSON → stdout JSON (continue, stopReason, systemMessage, hookSpecificOutput)
- Ring detection trivial: extract R[0-9]+ from SubagentStart.agent_type — zero agent code changes needed
- Hooks strictly superior to JSONL TraceLogger approach

### Technology Radar
- Hooks Phase 1 (file-bridge): TRIAL
- PreCompact ring-state hook: TRIAL
- Hooks Phase 2 (SSE): ASSESS
- PreToolUse security enforcement: ASSESS

### Use Case Feasibility
- Live Spider Web ring visualization: HIGH (0.91)
- Security policy enforcement: HIGH (0.89)
- CBP mandate ingestion signal: MEDIUM (0.78)
- Context injection for coord agents: MEDIUM (0.72)

### Gate Notes (N1-N3)
- N1: hooks.json format — use VS Code keyed-object format (§3.3), NOT Claude Code trigger/matchers format
- N2: VS Code 1.110 Stable confirmed GA March 4, 2026 (not Insiders-only)
- N3: SPIKE-017 superseded by this spike — hooks approach superior to passive API tracing

### Follow-up
- STORY: Hooks Phase 1 file-bridge implementation (supersedes STORY-183 TraceLogger)
- SPIKE-026 supersedes SPIKE-017