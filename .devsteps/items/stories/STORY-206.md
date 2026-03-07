## Context
Research from SPIKE-026 (Gate PASS, 2026-03-08): VS Code 1.110 Copilot Hooks provide a deterministic event stream for Spider Web ring visualization — strictly superior to the JSONL TraceLogger approach (STORY-183) requiring zero agent code changes.

## Goal
Implement Hooks Phase 1: a file-bridge that writes ring events to .devsteps/events/ on SubagentStart/Stop hook invocations, consumed by the extension FSWatcher → webview postMessage → D3 Spider Web ring diagram.

## Architecture (from SPIKE-026)
- hooks.json config at .github/hooks/devsteps-spider-web.json (VS Code keyed-object format — NOT Claude Code trigger/matchers format)
- Events: SubagentStart → ring activation; SubagentStop → ring completion; Stop → session end
- Ring detection: extract R[0-9]+ from agent_type field (trivial regex)
- Output: append JSONL to .devsteps/events/spider_events.jsonl
- Extension: FSWatcher on .devsteps/events/ → debounced postMessage → D3 update

## Hooks.json Format (N1/N2 Gate Note — CRITICAL)
Use VS Code 1.110 keyed-object format:
```json
{
  "SubagentStart": [{ "type": "command", "command": ".github/hooks/spider-ring-start.sh" }],
  "SubagentStop": [{ "type": "command", "command": ".github/hooks/spider-ring-stop.sh" }],
  "Stop": [{ "type": "command", "command": ".github/hooks/spider-session-end.sh" }]
}
```
Do NOT use Claude Code trigger/matchers format.

## Prerequisite
- BUG-060 (debounce) must be fixed first
- VS Code 1.109+ required (engine already enforced in package.json)

## Acceptance Criteria
- .github/hooks/devsteps-spider-web.json deployed and documented
- Shell scripts write ring events as JSONL with ring number, agent_name, timestamp, session_id
- Extension FSWatcher picks up .devsteps/events/spider_events.jsonl
- Spider Web D3 ring diagram activates/deactivates rings on events
- Tests: unit test for ring number extraction regex; integration test for JSONL write

## Supersedes
Replaces the TraceLogger approach from STORY-183 (agent-instrumented JSONL). Hooks Phase 1 makes STORY-183 Tasks 303-307 partially obsolete — coordinate with STORY-183 owner before starting.