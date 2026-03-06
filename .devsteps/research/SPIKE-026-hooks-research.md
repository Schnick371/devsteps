# SPIKE-026: VS Code 1.110 Copilot Hooks — Spider Web Visualization Integration

**Date:** 2026-03-05  
**Sprint:** 2026-03-05-hooks  
**Analyst:** devsteps-R1-analyst-research  
**Triage:** COMPETITIVE+  
**Status:** COMPLETE  
**Verdict:** PROCEED — High confidence, 3 phased integration opportunities identified  

---

## Executive Summary

VS Code 1.110 (released March 4, 2026) introduces **Agent Hooks** in Preview — a shell-command lifecycle system compatible with Claude Code's hook format. This feature is **uniquely positioned** for DevSteps Spider Web real-time visualization: hooks fire on every agent tool call with structured JSON including `tool_name`, `tool_use_id`, `sessionId`, and `timestamp` — exactly the signal data needed to animate ring progression. No other major AI coding tool (Continue.dev, Cursor, WindSurf) offers an equivalent server-side shell hook mechanism.

**Recommended approach:** Implement a 3-phase integration:
1. `PostToolUse` hook writes structured events to `.devsteps/cbp/<sprint_id>/hook-events/` (file-based, zero new infrastructure)
2. Add SSE `/hook-events` endpoint to existing HTTP MCP server; hook POSTs via curl
3. Extension host bridges SSE → webview `postMessage` for real-time Spider Web ring animation

---

## Axis 1: Hooks API — Complete Technical Specification

### 1.1 Lifecycle Events (8 total)

| Event | Fires When | Key Input Fields | Key Output Capabilities |
|---|---|---|---|
| `SessionStart` | First prompt of new session | `source: "new"` | `additionalContext` injection |
| `UserPromptSubmit` | User submits any prompt | `prompt` (text) | Common output only |
| `PreToolUse` | Before any tool invocation | `tool_name`, `tool_input`, `tool_use_id` | `permissionDecision: allow/deny/ask`, `updatedInput`, `additionalContext` |
| `PostToolUse` | After tool completes | `tool_name`, `tool_input`, `tool_use_id`, `tool_response` | `additionalContext`, `block` |
| `PreCompact` | Before context compaction | `trigger: "auto"` | Common output only |
| `SubagentStart` | Subagent spawned | `agent_id`, `agent_type` | `additionalContext` injection |
| `SubagentStop` | Subagent completes | `agent_id`, `agent_type`, `stop_hook_active` | `block` (prevent stop) |
| `Stop` | Session ends | `stop_hook_active` | `block` (prevent end) |

### 1.2 Common Input (all hooks receive via stdin)

```json
{
  "timestamp": "2026-03-05T10:30:00.000Z",
  "cwd": "/path/to/workspace",
  "sessionId": "session-identifier",
  "hookEventName": "PreToolUse",
  "transcript_path": "/path/to/transcript.json"
}
```

### 1.3 Hook Configuration Format

**File locations (checked in priority order):**
1. `.github/hooks/*.json` — team-shared, committed to repo ✅ **DevSteps should use this**
2. `.claude/settings.local.json` — workspace-local (not committed)
3. `.claude/settings.json` — workspace-level
4. `~/.claude/settings.json` — user-global

**Config schema:**
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "type": "command",
        "command": "./scripts/devsteps-hook.sh",
        "linux": "./scripts/devsteps-hook.sh",
        "osx": "./scripts/devsteps-hook.sh",
        "windows": "powershell -File scripts\\devsteps-hook.ps1",
        "timeout": 10,
        "env": {
          "DEVSTEPS_HOOK_VERSION": "1"
        }
      }
    ]
  }
}
```

**Hook command properties:**

| Property | Type | Description |
|---|---|---|
| `type` | string | MUST be `"command"` |
| `command` | string | Default command (cross-platform) |
| `linux` | string | Linux override |
| `osx` | string | macOS override |
| `windows` | string | Windows override |
| `cwd` | string | Working dir (relative to repo root) |
| `env` | object | Additional environment variables |
| `timeout` | number | Seconds (default: 30) |

### 1.4 Exit Codes and Blocking

| Exit Code | Behavior |
|---|---|
| `0` | Success — parse stdout as JSON |
| `2` | Blocking error — stop processing, show stderr to model |
| Other | Non-blocking warning — show to user, continue |

**Three blocking mechanisms (priority order — most restrictive wins):**
1. `exitCode 2` — simplest block, stderr shown to model
2. `continue: false` in JSON output — stops entire session
3. `permissionDecision: "deny"` in `hookSpecificOutput` — blocks single tool call only

### 1.5 PreToolUse Output (for DevSteps gate enforcement)

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "DestructiveCommand blocked by DevSteps policy",
    "updatedInput": {},
    "additionalContext": "See .devsteps policy for allowed operations"
  }
}
```

### 1.6 SubagentStart/Stop — Critical for Spider Web

```json
// SubagentStart input
{
  "agent_id": "subagent-456",
  "agent_type": "devsteps-R1-analyst-research"
}

// SubagentStop input
{
  "agent_id": "subagent-456",
  "agent_type": "devsteps-R1-analyst-research",
  "stop_hook_active": false
}
```

**`agent_type` maps directly to DevSteps Ring nomenclature** — `devsteps-R1-*` = Ring 1, `devsteps-R2-*` = Ring 2, etc.

### 1.7 VS Code vs Claude Code Tool Names

| Operation | Claude Code Tool Name | VS Code Tool Name |
|---|---|---|
| Write file | `Write` | `create_file` |
| Edit file | `Edit` | `replace_string_in_file` |
| Read file | `Read` | `read_file` |
| Run command | `Bash` | `run_in_terminal` |

**Critical:** Hook scripts must use VS Code tool names. Claude Code matchers (e.g., `"Edit\|Write"`) are **parsed but ignored** in VS Code — all hooks run on all events.

### 1.8 Execution Model

- **Synchronous** — agent waits for hook to complete before proceeding
- Default timeout: **30 seconds** (configurable per hook)
- Hook executed by Extension Host — same OS user permissions as VS Code
- No stdout buffering limit documented; JSON parsing is lenient
- Remote development (SSH, WSL, Containers): OS-specific command selected by **extension host OS**, not local OS

### 1.9 UI and Discovery

- `/hooks` slash command in chat → opens hook configuration UI
- `Chat: Configure Hooks` command palette
- `/create-hook <description>` → AI generates hook JSON
- `Developer: Open Agent Debug Panel` → shows hook load/execution events in real-time
- `chat.hookFilesLocations` setting for custom paths

---

## Axis 2: Spider Web Visualization Integration

### 2.1 Tool Name → Ring Mapping

DevSteps tool calls map directly to Spider Web rings:

| Tool Name | Ring | Agent Type | Spoke |
|---|---|---|---|
| `mcp_devsteps_list`, `mcp_devsteps_get` | Ring 1 | analyst-* | Research/Code |
| `mcp_devsteps_write_analysis_report` | Ring 2 | aspect-* | Risk/Quality |
| `mcp_devsteps_write_mandate_result` | Ring 1/3 | analyst-*/exec-planner | Research |
| `mcp_devsteps_update` (status=in-progress) | Ring 0 | coord | Work Items |
| `mcp_devsteps_update` (status=done) | Ring 5 | gate-reviewer | Quality |
| `mcp_devsteps_add` | Ring 0 | coord | Work Items |

SubagentStart/Stop hooks additionally yield `agent_type` which directly encodes the ring: `devsteps-R1-analyst-archaeology` → Ring 1, `devsteps-R2-aspect-impact` → Ring 2, etc.

### 2.2 Integration Architecture — Three Options

**Option A: Hook → File → FileSystemWatcher (Zero Infrastructure)**

```
PostToolUse hook
  → writes JSON to .devsteps/cbp/<sprint_id>/hook-events/<uuid>.json
  ← VS Code FileSystemWatcher triggers
  → Extension host reads event file
  → webview.postMessage(event)
  → Spider Web canvas updates
```
- **Latency:** ~250–500ms (filesystem poll interval)
- **Infrastructure:** None needed
- **Risk:** Low — pure file I/O, no network
- **Limitation:** No ordering guarantee between concurrent subagents

**Option B: Hook → HTTP POST → MCP Server SSE → Webview (Real-time)**

```
PostToolUse hook
  → curl http://localhost:$DEVSTEPS_MCP_PORT/hook-events (POST)
  ← HTTP MCP server receives
  → broadcast to SSE client connections
  ← Extension host SSE listener receives
  → webview.postMessage(event)
  → Spider Web canvas updates in <100ms
```
- **Latency:** <100ms
- **Infrastructure:** Add `/hook-events` POST + GET (SSE) endpoints to existing `http-server.ts`
- **Risk:** Medium — port discovery needed for hook script
- **Port discovery:** Server writes port to `.devsteps/.mcp-port` on start

**Option C: SubagentStart/Stop Hooks (Highest Fidelity)**

```
SubagentStart hook (agent_type = "devsteps-R1-analyst-research")
  → determine ring from agent_type prefix
  → emit ring-activation event via curl POST
  → Spider Web ring 1 spoke lights up

SubagentStop hook (same agent_type)
  → emit ring-completion event
  → Spider Web ring 1 spoke pulses → complete
```
This provides the most accurate visualization: actual agent lifecycle, not tool calls.

**Recommended: Implement Options A + C sequentially:**
1. **Phase 1 (SPIKE-026 output):** Option A — file-based events, FileSystemWatcher, zero infrastructure change
2. **Phase 2 (STORY-198):** Option B SSE endpoint + SubagentStop hook for ring animation
3. **Phase 3 (TASK-340):** Combine with MCP tool handler tracing for fully instrumented Spider Web

### 2.3 Current Codebase Integration Points

- [packages/mcp-server/src/http-server.ts](../../packages/mcp-server/src/http-server.ts) — Add `/hook-events` SSE endpoint here (Express 5, already running)
- [packages/extension/src/mcpServerManager.ts](../../packages/extension/src/mcpServerManager.ts) — Add SSE `EventSource` listener here, bridge to webview
- [packages/extension/src/webview/dashboardPanel.ts](../../packages/extension/src/webview/dashboardPanel.ts) — Add `onDidReceiveMessage` handler for `spiderWebEvent` type
- `.github/hooks/devsteps-spider-web.json` — New hook config file to create

### 2.4 CSP Constraint for Webview

Current CSP: `default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'`

This **disallows** `EventSource` from webview directly. The extension must proxy:
```
MCP server SSE → Extension host EventSource → vscode.postMessage → webview JS handler
```
No CSP changes required. The extension host is not subject to webview CSP.

### 2.5 Hook Script for Phase 1

`.github/hooks/devsteps-spider-web.json`:
```json
{
  "hooks": {
    "SubagentStart": [
      {
        "type": "command",
        "command": "./scripts/devsteps-ring-event.sh",
        "timeout": 5
      }
    ],
    "SubagentStop": [
      {
        "type": "command",
        "command": "./scripts/devsteps-ring-event.sh",
        "timeout": 5
      }
    ],
    "PostToolUse": [
      {
        "type": "command",
        "command": "./scripts/devsteps-tool-event.sh",
        "timeout": 5
      }
    ],
    "PreCompact": [
      {
        "type": "command",
        "command": "./scripts/devsteps-save-ring-state.sh",
        "timeout": 10
      }
    ]
  }
}
```

`scripts/devsteps-ring-event.sh`:
```bash
#!/bin/bash
set -euo pipefail

INPUT=$(cat)
EVENT_NAME=$(echo "$INPUT" | jq -r '.hookEventName')
AGENT_TYPE=$(echo "$INPUT" | jq -r '.agent_type // ""')
SESSION_ID=$(echo "$INPUT" | jq -r '.sessionId')
TIMESTAMP=$(echo "$INPUT" | jq -r '.timestamp')
SPRINT_ID=$(date -u +"%Y-%m-%d")

# Determine ring from agent_type prefix
RING=0
if echo "$AGENT_TYPE" | grep -qE '^devsteps-R1-'; then RING=1
elif echo "$AGENT_TYPE" | grep -qE '^devsteps-R2-'; then RING=2
elif echo "$AGENT_TYPE" | grep -qE '^devsteps-R3-'; then RING=3
elif echo "$AGENT_TYPE" | grep -qE '^devsteps-R4-'; then RING=4
elif echo "$AGENT_TYPE" | grep -qE '^devsteps-R5-'; then RING=5
fi

EVENTS_DIR=".devsteps/cbp/${SPRINT_ID}/hook-events"
mkdir -p "$EVENTS_DIR"

EVENT_FILE="${EVENTS_DIR}/$(date -u +%s%N)-${EVENT_NAME}.json"
cat <<EOF > "$EVENT_FILE"
{
  "event": "$EVENT_NAME",
  "timestamp": "$TIMESTAMP",
  "sessionId": "$SESSION_ID",
  "agentType": "$AGENT_TYPE",
  "ring": $RING,
  "sprintId": "$SPRINT_ID"
}
EOF

# Non-blocking: always continue
echo '{"continue": true}'
```

---

## Axis 3: VS Code 1.110 Additional Features — DevSteps Impact

### 3.1 High Priority Items

**Agent Plugins (Experimental)** — `chat.plugins.enabled`
- Default marketplaces: `copilot-plugins` (104 ⭐) + `awesome-copilot` (23.8k ⭐)
- DevSteps can publish as an **agent plugin** bundling: hooks, skills, custom agents, MCP server registration
- Structure: `.github/plugin/` directory with `plugin.json` manifest
- **Action:** Create `STORY-xxx` for DevSteps plugin package

**Background Agents + /slash commands**
- Hooks now also run in background agent sessions
- `/compact`, `/agents`, `/hooks` slash commands available in background sessions
- Spider Web monitoring therefore spans ALL session types (local + background + Claude)
- **Impact:** DevSteps hook-based visualization works across session boundaries

**PreCompact Hook — Critical for Spider Web State Preservation**
- When `/compact` fires, conversation history (including agent dispatch records) is summarized
- Spider Web ring state (which agents dispatched/completed) exists only in conversation history
- **PreCompact hook MUST save current ring state** to `.devsteps/cbp/<sprint_id>/ring-state.json`
- Without this: after compaction, coord loses track of which Ring 1/2 agents completed
- **Action:** Implement `devsteps-save-ring-state.sh` PreCompact hook as Phase 1 priority

**Agent Debug Panel (Preview)**
- `Developer: Open Agent Debug Panel` shows real-time chat events, tool calls, hook load/execution
- Invaluable for debugging the `devsteps-spider-web.json` hook
- Shows exactly which hooks loaded and fired
- **Action:** Document in CONTRIBUTING.md for DevSteps contributors

### 3.2 Medium Priority Items

**Session Memory for Plans**
- Plans from Plan agent persist across conversation turns via session memory
- coord sprint plans can leverage this for multi-turn sprint continuity
- **Impact:** STORY-198 implementation benefits from persistent sprint plan memory

**`/fork` Chat Session Risk**
- Fork creates independent session with NEW `sessionId`
- All hook events have `sessionId` — forked session events are unlinked from parent
- Spider Web visualization may lose continuity if users fork mid-sprint
- **Mitigation:** Include `transcript_path` in hook event to correlate; note in docs

**`rename` and `usages` Tools**
- New language-server–backed tools for precise symbol navigation
- Analysts should prefer `#rename` and `#usages` over grep for codebase search
- **Action:** Update analyst instructions to mention these tools

### 3.3 Lower Priority Items

| Feature | Impact | Action |
|---|---|---|
| `ThemeIcon` for webview tab | Spider Web tab can use radial icon | `TASK-xxx`: add `iconPath = new vscode.ThemeIcon('circle-filled')` |
| `askQuestions` in core | Reliable in subagents now | Update DevSteps agents to use it in clarification loops |
| Agentic browser tools | `readPage`, `screenshotPage`, etc. | Not core to DevSteps; may help agents verify webview rendering |
| Kitty graphics in terminal | High-quality images in terminal | Not relevant to DevSteps |
| `git.addAICoAuthor` | Auto-adds Copilot as co-author | Consider enabling in DevSteps projects |

---

## Axis 4: Competitive Intelligence

### 4.1 Tool Comparison Matrix

| Tool | Shell Hooks | Lifecycle Events | Tool-Call Interception | Hook Config Location | Status |
|---|---|---|---|---|---|
| **VS Code + GitHub Copilot** | ✅ Yes | 8 events | ✅ PreToolUse/PostToolUse | `.github/hooks/*.json` | Preview (1.110) |
| **Claude Code CLI** | ✅ Yes | Same 8 events | ✅ Same | `.claude/settings.json` | GA |
| **Continue.dev** | ❌ No | None | ❌ No | `.continuerules` | N/A |
| **Cursor** | ❌ No | None | ❌ No | `.cursorrules` | N/A |
| **WindSurf** | ❌ No | None | ❌ No | Cascade rules | N/A |
| **Copilot CLI** | ✅ Yes | Same format | ✅ Same | `.claude/settings.json` | GA |

**Key finding:** VS Code hooks are a **first-mover advantage**. Only VS Code and Claude Code CLI support this pattern. Continue.dev, Cursor, and WindSurf have no equivalent.

### 4.2 Community Examples (awesome-copilot)

The `github/awesome-copilot` repo (23.8k ⭐) has a `hooks/` folder with community implementations including:
- **Audit logging** — SessionStart/PreToolUse → append to audit.log
- **Auto-commit** — PostToolUse editFiles → git commit
- **Code formatting** — PostToolUse → run prettier/biome
- **Security policies** — PreToolUse → block dangerous commands

**No known examples** exist for real-time visualization or Spider Web–style ring progress tracking. This is a novel use case.

### 4.3 Claude Code Compatibility

VS Code hooks **are compatible with Claude Code hook format** with these differences:
- VS Code uses camelCase tool names; Claude Code uses PascalCase (`Write` vs `create_file`)
- VS Code ignores matcher values (Claude Code respects them)
- VS Code maps `preToolUse` (Claude camelCase) to `PreToolUse` (VS Code PascalCase)
- `bash` Claude Code command maps to VS Code `linux`/`osx` commands

DevSteps hooks should target VS Code tool names and ignore matchers for cross-platform safety.

### 4.4 GA Timeline Signals

- Hooks marked as **"Preview"** in VS Code 1.110 docs (March 4, 2026)
- Claude Code hooks are **GA** — same format
- No official GA date from Microsoft
- Format is stable enough for production use (Claude Code GA validates format stability)
- **Risk estimate: Preview → GA within 2-3 VS Code releases** (April–June 2026)
- DevSteps should implement against current spec with a `chat.hookFilesLocations` guard for graceful fallback

### 4.5 Plugin Ecosystem (github/copilot-plugins — 104 ⭐)

- Official plugin collection, very early stage
- Hooks listed as "coming soon" in plugin structure
- `awesome-copilot` plugin format is mature (23.8k ⭐, 1,371 commits)
- DevSteps should target `awesome-copilot` as primary publication channel

---

## Axis 5: Security Analysis

### 5.1 Critical Risks

**OWASP A03 — Shell Injection via Tool Input**
- Hook scripts receive `tool_input` JSON; may contain user-controlled or agent-generated values
- Assigning tool_input fields to shell variables without quoting enables injection:
  ```bash
  # DANGEROUS — Do NOT do this
  TOOL=$(echo "$INPUT" | jq -r '.tool_name')
  eval "handle_$TOOL"  # Injection via crafted tool_name
  ```
- **DevSteps mitigation:** Always use `jq` filters to extract specific fields; never `eval`; validate field values against allowlists

**Sensitive Data in transcript_path**
- `transcript_path` points to session transcript containing conversation history
- May contain API keys, internal paths, sensitive code mentioned in conversation
- **DevSteps mitigation:** Hook scripts MUST NOT read or log `transcript_path` contents; use only `tool_name`, `tool_input`, `sessionId`

**Agent Modification of Hook Scripts**
- VS Code docs explicitly warn: agents with file edit access can modify hook scripts
- Modified hook = arbitrary code execution on extension host
- **DevSteps mitigation:** 
  - Add `.github/hooks/` to project `chat.tools.edits.autoApprove` exclusion list
  - Document in README: hook scripts require manual review before changes
  - Consider adding a `PreToolUse` hook that blocks edits to `.github/hooks/`

**Port Discovery for SSE Bridge (Phase 2)**
- Hook scripts need MCP server port (dynamic port 0)
- **Mitigation:** Extension writes port to `.devsteps/.mcp-port` on start; hook reads with `cat .devsteps/.mcp-port`
- Validate port is numeric and in valid range before using in curl

**Enterprise Policy Disable**
- Org admins can disable hooks via VS Code enterprise policies
- Hooks silently won't execute — no error to user
- **DevSteps mitigation:** Document that visualization features require hooks; implement file-polling fallback

**MandateResult Integrity**
- Phase 1 hook writes JSON to `.devsteps/cbp/` — same directory as MandateResults
- Malicious hook (or compromised agent) could write fake MandateResults
- **DevSteps mitigation:** MandateResult validation should check `mandate_id` UUID format and `analyst` field against known agent names

### 5.2 Security Checklist for DevSteps Hook Implementation

- [ ] All shell variables quoted: `"$VAR"` not `$VAR`
- [ ] `jq -r` extracts only specific fields, never pipes full input to commands
- [ ] `transcript_path` never read or forwarded
- [ ] Exit code 0 always returned (non-blocking) unless explicitly blocking
- [ ] Timeout ≤ 10 seconds for event-writing hooks
- [ ] Port number validated before curl
- [ ] Hook script directory write-protected from agent edits
- [ ] No hardcoded secrets in hook scripts
- [ ] Test with `jq` not available (install check)

---

## Recommendations (Prioritized)

### P0 — Immediate (This Sprint)

1. **Create `.github/hooks/devsteps-spider-web.json`** with `SubagentStart`, `SubagentStop`, `PreCompact`, `PostToolUse` hooks and corresponding shell scripts. This is the Phase 1 visualization foundation.

2. **Implement `PreCompact` hook** (`devsteps-save-ring-state.sh`) — write current ring state to disk before context compaction. This prevents loss of Spider Web dispatch state during long sprints.

3. **Add `FileSystemWatcher` to extension** for `.devsteps/cbp/<sprint_id>/hook-events/` directory — forward new JSON event files to webview via `postMessage`. This completes Phase 1 real-time visualization.

### P1 — Phase 2 (STORY-198 / TASK-340)

4. **Add SSE `/hook-events` endpoint** to `packages/mcp-server/src/http-server.ts`. Extension subscribes, bridges to webview. Drops file-polling latency from ~500ms to <100ms.

5. **Add Spider Web radial panel** to webview that responds to `spiderWebEvent` messages from extension host. Use D3 for arc animation on ring activation.

6. **Publish DevSteps as Agent Plugin** to `awesome-copilot` — bundle hooks, skills, MCP server registration as installable plugin package.

### P2 — Phase 3 (Future)

7. **`PreToolUse` policy enforcement hook** — block dangerous operations (DROP TABLE, rm -rf) when DevSteps agents are running. Prevents accidental data loss during Spider Web execution.

8. **`UserPromptSubmit` context injection** — `SessionStart` hook injects DevSteps sprint context (active items, current ring state) into every new session automatically.

9. **Investigate Continue.dev hooks roadmap** — monitor for equivalent hooks feature; DevSteps hook scripts are shell-based and potentially portable.

---

## Sources

1. VS Code Docs: Agent Hooks (Preview) — https://code.visualstudio.com/docs/copilot/customization/hooks (March 4, 2026)
2. VS Code February 2026 Release Notes — https://code.visualstudio.com/updates/v1_110 (March 4, 2026)
3. VS Code Agent Plugins (Preview) — https://code.visualstudio.com/docs/copilot/customization/agent-plugins (March 4, 2026)
4. github/awesome-copilot — https://github.com/github/awesome-copilot (23.8k ⭐, active hooks/ folder)
5. github/copilot-plugins — https://github.com/github/copilot-plugins (official plugin collection)
6. DevSteps codebase — `packages/mcp-server/src/http-server.ts` (existing HTTP MCP server)
7. DevSteps codebase — `packages/extension/src/mcpServerManager.ts` (in-process HTTP server mgmt)
8. DevSteps codebase — `packages/extension/src/webview/dashboardPanel.ts` (existing webview)
9. DevSteps codebase — `packages/extension/src/webview/renderers/traceabilityRenderer.ts` (SVG graph)
10. DevSteps codebase — `packages/extension/src/webview/utils/htmlHelpers.ts` (CSP/nonce pattern)
11. DevSteps SPIKE-002 — Webview performance investigation (D3 force-sim bottleneck at 1K nodes)
12. DevSteps SPIKE-005 — Dashboard visualization strategy (esbuild/CSP patterns)
13. Claude Code Hooks documentation (Anthropic) — format origin, GA status
14. VS Code Security docs — workspace trust, hook permissions

**Coverage:** 14 sources across Official docs (3), GitHub repos (2), Internal codebase analysis (7), Related spikes (2). All sources within 90-day window (Dec 2025 – March 2026) or are current live documentation.
