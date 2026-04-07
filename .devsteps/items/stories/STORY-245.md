## Problem
When multiple MCP servers register tools with the same name (e.g. 'search'), VS Code's tool picker activates ALL matching tools. Our generic names (search, list, add, get, status, link, trace) collide with GitHub, Azure, Google Search MCPs.

## Research Summary
- VS Code Issue #260134: open, no fix ETA
- VS Code Copilot Issue #11480: open
- MCP Spec SEP #1395: naming framework proposed but not ratified
- VS Code creates FQN `mcp_<servername>_<toolname>` internally for LLM calls
- Tool picker UI groups by bare tool name — collision happens there

## Acceptance Criteria
- [ ] Analyze FQN behavior in Agent Mode vs Tool Picker
- [ ] Define tool-name-prefix strategy (ADR)
- [ ] If prefix needed: refactor tool names + update all .github/agents and .github/instructions
- [ ] Verify no double-prefixing (mcp_devsteps_devsteps_*)

Pre-create gate decision (planning-2026-04-05): implementation is explicitly blocked until all three blocker tasks are completed: TASK-442, TASK-443, TASK-444.