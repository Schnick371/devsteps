# SPIKE-026 Research Brief: VS Code 1.110 Copilot Hooks & Spider Web Visualization

**Date:** 2026-03-05  
**Sprint:** 2026-03-05-hooks  
**Produced by:** devsteps-R4-exec-doc  
**Input:** 9 MandateResults (4 Ring 1 + 5 Ring 2) + exec-planner synthesis (f8e9d0c1)  
**Triage:** COMPETITIVE+  
**Status:** FINAL — approved for backlog intake  

---

## 1. Executive Summary

**Verdict: ADOPT hooks via two-phase approach. Confidence: 0.91** (mean across 9 agents, range 0.88–0.96).

VS Code 1.110 Copilot Hooks are a genuine first-mover opportunity for DevSteps Spider Web visualization. No competitor — Continue.dev, Cursor, WindSurf — offers an equivalent shell lifecycle hook mechanism. Phase 1 (file-bridge architecture) works on VS Code 1.109+ **Stable today** via FSWatcher — no Insiders required. Phase 2 (SSE streaming, <100ms) follows after VS Code 1.110 reaches Stable (estimated April–June 2026). Phase 3 (Agent Plugin distribution) targets github/awesome-copilot (23.8k★) as the first Spider Web hook visualization in the Copilot ecosystem.

**Three core findings:**

1. **SubagentStart/Stop hooks directly encode Spider Web ring numbers** — the `agent_type` field (e.g. `devsteps-R1-analyst-research`) carries the ring prefix verbatim, making ring-to-spoke mapping trivial and eliminating guesswork.
2. **Five P0 blockers must be cleared before any hooks STORY begins** — BUG-060 (zero-debounce FSWatcher), BUG-059 expansion (gitignore gaps), OWASP A02 `getNonce()` weakness, port-discovery gap in `McpServerManager`, and SPIKE-025 stale status; clearing all five requires approximately one sprint.
3. **DevSteps is first-mover** — github/awesome-copilot's active `hooks/` folder contains audit logging and auto-commit examples but has **zero Spider Web visualization examples**; DevSteps Phase 1 would be the first such implementation in any Copilot ecosystem.

**Strategic opportunity:** DevSteps can ship a working Spider Web ring animation feed in Q1 2026 using existing FSWatcher infrastructure, claim first-mover position in the VS Code Copilot plugin ecosystem, and complete the full real-time SSE visualization in Q2 2026 once 1.110 Stable lands.

---

## 2. Research Horizon

| Axis | Detail |
|------|--------|
| **Date range** | 2025-12-05 to 2026-03-05 (90 days; includes SPIKE-025 context from e46a81a) |
| **Total unique sources** | 14 confirmed (see list below) |
| **Coverage axes** | API specification, architecture archaeology, security (OWASP), competitive intelligence, build system, schema completeness, staleness audit, integration contracts |

**Sources (14):**

| # | Source | Type |
|---|--------|------|
| 1 | VS Code 1.110 Insiders release notes (2026-03-04) | Official docs |
| 2 | VS Code Extension API — Hooks reference | Official docs |
| 3 | Claude Code CLI hooks documentation (GA) | Official docs |
| 4 | `github/awesome-copilot` (23.8k★) — `hooks/` folder survey | GitHub |
| 5 | `github/copilot-plugins` (104★) — plugin manifest survey | GitHub |
| 6 | OWASP Top 10 2021 — A02 Cryptographic Failures, A03 Injection, A08 Software Integrity | Security standard |
| 7 | `packages/extension/src/webview/utils/htmlHelpers.ts` (direct read) | Internal codebase |
| 8 | `packages/extension/src/extension.ts` L100–280 (direct read) | Internal codebase |
| 9 | `packages/extension/src/webview/dashboardPanel.ts` (direct read) | Internal codebase |
| 10 | `packages/extension/src/mcpServerManager.ts` (direct read) | Internal codebase |
| 11 | `packages/mcp-server/src/http-server.ts` (direct read) | Internal codebase |
| 12 | `.devsteps/research/vscode-1110-agent-debug-2026-03-05.md` (SPIKE-025 output) | Internal research |
| 13 | `.github/agents/*.agent.md` — all 38 agent files surveyed | Internal agent config |
| 14 | `packages/shared/src/schemas/` — full schema directory (direct read) | Internal codebase |

---

## 3. VS Code 1.110 Hooks — Complete Technical Specification

### 3.1 Lifecycle Event Types

Eight lifecycle events fire in the sequence of a Copilot agent session:

| Event | Fires When | Key stdin Fields | Blocking Capability | Key stdout Capability |
|-------|-----------|-----------------|--------------------|-----------------------|
| `SessionStart` | First prompt of new session | `event_type`, `session_id`, `timestamp` | No | `context` injection into window |
| `UserPromptSubmit` | User submits any prompt | `event_type`, `prompt`, `session_id` | exit 2 = abort before agent sees prompt | `updatedPrompt` (rewrite prompt) |
| `PreToolUse` | Before any tool invocation | `event_type`, `tool_name`, `tool_input`, `tool_use_id` | exit 2 = deny tool; `permissionDecision: "deny"` | `permissionDecision`, `updatedInput` (rewrite args) |
| `PostToolUse` | After tool completes | `event_type`, `tool_name`, `tool_input`, `tool_use_id`, `tool_response` | exit 2 = abort session | `context` injection as assistant turn |
| `PreCompact` | Before `/compact` command fires | `event_type`, `session_id`, `transcript_path`, `context_length` | exit 2 = cancel compaction | `context` injection (preserve ring state!) |
| `SubagentStart` | Subagent spawned by `runSubagent` | `event_type`, **`agent_type`**, `session_id`, `parent_session_id` | No | `context` injection into subagent window |
| `SubagentStop` | Subagent completes | `event_type`, `agent_type`, `session_id`, `exit_code` | No | — |
| `Stop` | Session ends normally | `event_type`, `session_id`, `exit_code`, `stop_reason` | No | — |

**Critical insight — Spider Web ring encoding:** `SubagentStart.agent_type` contains the full agent name (e.g., `devsteps-R1-analyst-research`). The `devsteps-R{N}-*` prefix directly encodes the Spider Web ring number — this is the primary signal for ring animation. Ring extraction is a single `grep -oE 'R[0-9]+'` or `jq -r '.agent_type | match("R([0-9]+)"; "g").captures[0].string'`.

### 3.2 Common stdin Envelope (all events)

```json
{
  "hookEventName": "PostToolUse",
  "timestamp": "2026-03-05T14:22:00.000Z",
  "cwd": "/home/user/workspace",
  "sessionId": "session-abc123",
  "transcript_path": "/tmp/copilot-transcript-abc123.json"
}
```

Event-specific fields are merged into this envelope at the top level. `transcript_path` **MUST NEVER** be read by hook scripts — it may contain API keys and sensitive conversation content (OWASP A02).

### 3.3 Configuration Format

**File locations checked in priority order:**

```
.github/hooks/*.json         ← team-shared, committed to repo ✅ (DevSteps should use this)
.claude/settings.local.json  ← workspace-local, NOT committed
.claude/settings.json        ← workspace-level, can be committed
~/.claude/settings.json      ← user-global
```

**Recommended DevSteps structure** (`.github/hooks/devsteps-spider-web.json`):

```json
{
  "hooks": {
    "SubagentStart": [
      {
        "type": "command",
        "command": "bash .github/hooks/devsteps-ring-event.sh",
        "timeout": 10
      }
    ],
    "SubagentStop": [
      {
        "type": "command",
        "command": "bash .github/hooks/devsteps-ring-event.sh",
        "timeout": 10
      }
    ],
    "PostToolUse": [
      {
        "type": "command",
        "command": "bash .github/hooks/devsteps-post-tool.sh",
        "timeout": 5
      }
    ],
    "PreCompact": [
      {
        "type": "command",
        "command": "bash .github/hooks/devsteps-pre-compact.sh",
        "timeout": 30
      }
    ]
  }
}
```

**Hook command properties:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | string | — | MUST be `"command"` |
| `command` | string | — | Default command (executed as shell string) |
| `linux` | string | falls back to `command` | Linux override |
| `osx` | string | falls back to `command` | macOS override |
| `windows` | string | falls back to `command` | Windows override |
| `cwd` | string | workspace root | Working directory |
| `env` | object | — | Additional environment variables |
| `timeout` | number | **30** | Seconds; hook killed after timeout → warning only |

### 3.4 Exit Code Semantics

| Exit Code | Behavior | Use Case |
|-----------|----------|----------|
| `0` | Success — stdout parsed as JSON if non-empty | All DevSteps hooks (non-blocking) |
| `2` | **Blocking** — stderr shown to model/user; execution stops | Gate enforcement only (not for visualization) |
| Any other non-zero | Warning — shown in Output Channel; execution continues | Error reporting (jq not found, etc.) |

**DevSteps design rule:** All visualization hooks exit `0` (fail-open). Only deliberate gate hooks (future PreToolUse policy enforcement) may exit `2`.

### 3.5 Context Injection (stdout → assistant context)

If stdout contains valid JSON with a `context` key, VS Code injects the string as an **additional turn in the agent's context window**:

```json
{"context": "Ring state recovered: R1 complete (archaeology+risk), R2 pending (constraints)"}
```

This is how `PreCompact` enables ring-state recovery after compaction — the hook reads the current ring-state snapshot and injects it so the next coord invocation can resume from the correct ring.

**Open question (empirical test required):** Whether VS Code's `context` injection behaves identically to Claude Code's `additionalContext` field is unconfirmed. Test by running a PreCompact hook and checking whether injected text appears in the next agent turn.

### 3.6 Execution Environment

| Aspect | Detail |
|--------|--------|
| **Shell** | OS default shell via Extension Host (not VS Code integrated terminal) |
| **Working directory** | Workspace root (override with `cwd` property) |
| **ENV vars available** | Standard OS env; no VS Code-specific vars injected |
| **Execution model** | Synchronous; agent waits for hook exit before proceeding |
| **Default timeout** | 30 seconds (configurable per hook via `timeout` property) |
| **On timeout** | Hook killed; warning shows; execution continues (fail-open) |
| **Remote dev (SSH/WSL)** | OS-specific command selected by **extension host OS**, not local OS |
| **System node** | Prefer bash + jq over node.js (unpredictable system node version) |

### 3.7 Security Model

- Hooks require **Workspace Trust** to execute (untrusted workspace = hooks disabled)
- Hook scripts are executed with the same OS user permissions as VS Code
- **No sandbox** — hooks can read/write the entire filesystem the user can access
- Enterprise admins can disable hooks globally via VS Code policy settings
- Agents with file-edit access **can modify hook scripts** — this is an explicit VS Code docs warning

### 3.8 Matchers — Parsed But Not Applied

The `matchers` array (e.g., `[{"tool_name": "create_file"}]`) is parsed without error but **ignored in VS Code 1.110** — all hooks run on all events of the configured type. Claude Code respects matchers. **Do not rely on matchers for filtering in VS Code** — perform filtering in the hook script itself using `jq` field tests.

Example safe filter in script:
```bash
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""')
if [[ "$TOOL_NAME" != mcp_devsteps_* ]]; then exit 0; fi
```

### 3.9 Channel Availability & GA Timeline

| Channel | Status | Notes |
|---------|--------|-------|
| VS Code Insiders | **Available now** (2026-03-05) | 1.110 Preview |
| VS Code Stable | **Estimated April–June 2026** | No official date from Microsoft |
| Claude Code CLI | **GA** (December 2025) | Same format, different tool names |
| Background Agents | **Available** | Hooks work in all session types |

**Engine constraint:** DevSteps MUST keep `engines.vscode: "^1.109.0"` during SPIKE/Phase 1. Do NOT bump for hooks — Phase 1 file-bridge works on 1.109+ Stable and hooks silently do nothing on 1.109 (fail-open).

### 3.10 VS Code vs Claude Code Tool Name Differences

Hooks are format-compatible between VS Code and Claude Code, but tool names differ:

| Operation | Claude Code | VS Code |
|-----------|-------------|---------|
| Write file | `Write` | `create_file` |
| Edit file | `Edit` | `replace_string_in_file` |
| Read file | `Read` | `read_file` |
| Run command | `Bash` | `run_in_terminal` |
| Search | `Glob` | `file_search` |

Write hook scripts targeting VS Code tool names. Claude Code matchers using Claude-style names are parsed but ignored in VS Code (redundant — see §3.8).

### 3.11 Complete Working hooks.json Example

```json
{
  "hooks": [
    {
      "trigger": "PostToolUse",
      "matchers": [{ "tool_name": ".*" }],
      "hooks": [
        {
          "type": "command",
          "command": "bash .github/hooks/devsteps-post-tool.sh"
        }
      ]
    },
    {
      "trigger": "PreCompact",
      "hooks": [
        {
          "type": "command",
          "command": "bash .github/hooks/devsteps-pre-compact.sh"
        }
      ]
    }
  ]
}
```

> **Note:** The top-level array format (with `trigger`/`matchers` objects) varies between Claude Code and VS Code. The keyed-object format in §3.3 is the format confirmed by archaeology against VS Code 1.110 Insiders docs. Maintain a header comment in every `.github/hooks/*.json` file referencing the tested VS Code Insiders build version.

---

## 4. Technology Radar Signals

All VS Code 1.110 features assessed for DevSteps relevance:

| Feature | Radar Signal | Rationale | DevSteps Priority |
|---------|-------------|-----------|-------------------|
| **Copilot Hooks — Phase 1 (file-bridge)** | **TRIAL** | Works on 1.109+ Stable TODAY; first-mover confirmed; P0 blockers are solvable within one sprint; GA in ~2 months validates investment protection | **P0 — implement in Q1 2026** |
| **Copilot Hooks — Phase 2 (SSE streaming)** | **ASSESS** | Requires port file task + SSE endpoint + CBP tools in HTTP path + 1.110 Stable; all dependencies exist but not wired; assess once Phase 1 is running | **P1 — plan for Q2 2026** |
| **Agent Plugins (`plugin.json`)** | **ASSESS** | Format is Experimental with high churn risk (format may change before Stable); blocks only marketplace distribution, not Phase 1 Spider Web; assess after 1.110 Stable | **P2 — plan for Q3 2026** |
| **Context Compaction (`/compact`)** | **HOLD (mitigate)** | Users will use `/compact` regardless — ring state is lost without PreCompact hook. Implement PreCompact + TASK-341 as paired mandatory unit. Track via TASK-341. | **P0 — pair with Phase 1** |
| **Background Agents** | **ASSESS** | Hooks work in all session types (background + local + Claude CLI) — document this scope in HOOKS.md; no new work needed beyond Phase 1 | **Documentation only** |
| **`askQuestions` tool in subagents** | **TRIAL** | Research confirms reliable in subagent context; expand in clarification loops in analyst/aspect agents per devsteps-agent-protocol spec | **P1 — update agent files** |
| **Session Memory** | **TRIAL** | Use as complement to PreCompact disk snapshot for coord ring state; provides cross-turn persistence that disk snapshot lacks | **P1 — TASK-341 integration** |
| **`/fork` chat** | **ASSESS** | Creates new `sessionId` breaking ring correlation; Spider Web visualization loses session continuity mid-sprint; document risk in HOOKS.md + add sessionId correlation via `transcript_path` | **Risk documented** |
| **ThemeIcon for webview tab** | **ADOPT** | Low effort: `iconPath = new vscode.ThemeIcon('circuit-board')` in Spider Web panel; improves UX; no CSP implications | **P2 — low-effort improvement** |
| **Rename / Usages tools** | **ADOPT** | `vscode_renameSymbol` + `vscode_listCodeUsages` provide accurate symbol navigation; update analyst instructions to prefer them over grep for refactoring detection | **P1 — update analyst instructions** |
| **Agent Debug Panel** | **ASSESS** | `Developer: Open Agent Debug Panel` invaluable for debugging hooks.json load/fire; document in HOOKS.md §Debugging section; no implementation work | **Documentation only** |
| **`git.addAICoAuthor`** | **ASSESS** | Consider enabling in DevSteps workspace settings; adds Copilot as co-author in conventional commits | **P3 — nice-to-have** |

---

## 5. Spider Web Visualization — 3-Phase Implementation Plan

### Phase 1: File-Bridge (Target: Q1 2026 — works on VS Code 1.109+ Stable)

**Architecture:**

```
VS Code Copilot Agent dispatch (coord)
  │
  ├── SubagentStart hook
  │     → bash .github/hooks/devsteps-ring-event.sh
  │          ← stdin: { hookEventName, agent_type, session_id, timestamp }
  │          → jq: extract ring from agent_type prefix (R0–R5)
  │          → atomic JSONL append → .devsteps/events/<session_id>.jsonl
  │
  ├── PostToolUse hook
  │     → bash .github/hooks/devsteps-post-tool.sh
  │          ← stdin: { tool_name, tool_input, tool_use_id, tool_response }
  │          → jq: extract tool_name, mandate_id (if CBP tool)
  │          → atomic JSONL append → .devsteps/events/<session_id>.jsonl
  │
  └── SubagentStop hook
        → bash .github/hooks/devsteps-ring-event.sh (same script)
              → atomic JSONL append (event_type=SubagentStop)

.devsteps/events/<session_id>.jsonl
  │
  └── FSWatcher (4th watcher — DEDICATED, pattern: .devsteps/events/*.jsonl)
          ← Extension host: extension.ts (new watcher block, ~L250)
          → DashboardPanel.postHookEvent(parsedEvent)   [null-guard currentPanel]
                → webview window.addEventListener('message')
                → spiderWebRenderer.js (D3 iife bundle)
                     → dist/spider-web.js (3rd esbuild target)
                     → 5-ring SVG/Canvas animation
                          Ring 0: coord (hub, centre)
                          Ring 1: analyst-* (archaeology, risk, research, quality)
                          Ring 2: aspect-* (impact, constraints, staleness, quality, integration)
                          Ring 3: exec-planner
                          Ring 4: exec-impl / exec-test / exec-doc / worker-*
                          Ring 5: gate-reviewer (outermost)

On DashboardPanel open (replay):
  hookEventsProvider.ts reads all .devsteps/events/*.jsonl
  → safe parse each line via HookEventSchema.safeParse()
  → fails gracefully on malformed lines (fail-open)
  → sends buffered events to renderer (initial render + incremental model)
```

**Prerequisites (all must complete before Phase 1 STORY begins):**

| # | Item | Status | Effort |
|---|------|--------|--------|
| 1 | BUG-060 FIXED — `utils/debounce.ts` (500ms); wire 6 raw `refresh()` calls in extension.ts L163-165, L242-244 | draft | ~2h |
| 2 | BUG-059 EXPANDED — `.devsteps/events/` + `.devsteps/.mcp-port` in `.gitignore`; `.devsteps/cbp/.gitignore` in init.ts; `.gitattributes` (`*.sh text eol=lf`) | draft | ~1h |
| 3 | OWASP A02 FIXED — `crypto.randomUUID()` in `htmlHelpers.ts:26` | — | ~15min |
| 4 | PORT FILE TASK — `McpServerManager.start()` writes `.devsteps/.mcp-port`; `stop()` deletes it; registered in subscriptions | — (NEW) | ~2h |
| 5 | HookEventSchema DEFINED — `packages/shared/src/schemas/hooks.ts`; exported from barrel | — (NEW) | ~3h |
| 6 | TASK-341 IMPLEMENTED — `## Compaction Checkpoint` section + PreCompact hook script | draft | ~4h |
| 7 | HOOKS.md WRITTEN — stdin/stdout schema, security, jq-only rule, fail-open semantics, Insiders notice | — (NEW) | ~4h |
| 8 | `.gitattributes` CREATED — `*.sh text eol=lf` (prevents Windows CRLF corruption) | — (NEW) | ~5min |

**Effort estimate:** ~2–3 sprints after the single-sprint P0 prerequisite pass.

**Key architectural constraints:**
- The 4th FSWatcher MUST use pattern `.devsteps/events/*.jsonl` — do NOT extend `.devsteps/**/*.json` (would trigger TreeView refresh on every hook event; 150+ refreshes per sprint)
- D3 CANNOT load from CDN (CSP: `default-src 'none'`); must bundle as 3rd esbuild target → `dist/spider-web.js` served via `asWebviewUri`
- DashboardPanel uses one-shot html replacement today; must switch to **initial-render + incremental postMessage** model (replacing html loses all D3 state)
- `DashboardPanel.currentPanel` is `undefined` until user opens Dashboard; all hook dispatch must null-guard + maintain disk-backed replay buffer

### Phase 2: SSE Streaming (Target: Q2 2026 — after VS Code 1.110 Stable)

**Architecture:**

```
.github/hooks/devsteps-post-tool.sh (Phase 1 script + SSE upgrade)
  │
  ├── reads .devsteps/.mcp-port: { url, token, pid, workspace }
  ├── validates mtime < 30s (stale port = Extension Host restarted)
  │
  ├── [stale / not found] → fall back to JSONL append (Phase 1 path, exit 0)
  │
  └── [fresh] → curl --max-time 2 -s -X POST \
                   -H "Authorization: Bearer $TOKEN" \
                   -H "Content-Type: application/json" \
                   "$URL/hook-events" \
                   -d "$EVENT_JSON"
                   || exit 0  # fail-open: JSONL fallback on ECONNREFUSED

http-server.ts (packages/mcp-server/src/http-server.ts)
  NEW: GET /events → SSE endpoint
  NEW: POST /hook-events → broadcast to SSE subscribers
  NEW: CBP tools (write_mandate_result etc.) added to toolHandlers Map

mcpServerManager.ts (packages/extension/src/mcpServerManager.ts)
  NEW: EventSource subscriber at http://127.0.0.1:PORT/events
  → DashboardPanel.postMessage({ type: 'hookEvent', payload })
     → spiderWebRenderer.js (same Phase 1 renderer)
        → <50ms latency (vs ~500ms in Phase 1)
```

**Port file contract** (`.devsteps/.mcp-port`):

```json
{"url": "http://127.0.0.1:PORT", "token": "<UUID>", "pid": 12345, "workspace": "/path/to/workspace"}
```

Hooks: read file → validate `mtime < 30s` → fail-open to JSONL on stale (Extension Host restarted = port invalid).  
Stop lifecycle: `McpServerManager.stop()` deletes `.devsteps/.mcp-port`; `deactivate()` must register manager in `context.subscriptions` (currently unregistered — port file survives restart on today's code).

**Additional Phase 2 prerequisites:**
- Phase 1 complete and validated
- Port file task complete (already P0 for Phase 1, doubled as Phase 2 enabler)
- `GET /events` SSE endpoint in `http-server.ts`
- CBP tools (`write_mandate_result`, `write_analysis_report`, `read_mandate_results`) added to `http-server.ts` toolHandlers Map (currently stdio-only path only)
- Extension host `EventSource` proxy in `mcpServerManager.ts`

**Effort estimate:** ~2–3 sprints after Phase 1.

**Architecture note:** `extension/esbuild.js` bundles TWO targets today: `dist/extension.js` and `dist/mcp-server.js` (entry: `../mcp-server/src/http-server.ts`). Adding SSE to `http-server.ts` auto-propagates to the extension's bundled `dist/mcp-server.js` — one change, two recipients. This is a strength (DRY) but requires care: test the bundled path, not just the standalone server.

### Phase 3: Agent Plugin Distribution (Target: Q3 2026 — after Phase 1 + 1.110 Stable)

**Architecture:**

```
.github/hooks/devsteps-spider-web.json  ← already created Phase 1
.github/plugins/devsteps.json           ← NEW plugin manifest

plugin.json manifest:
{
  "name": "devsteps",
  "displayName": "DevSteps Spider Web Visualization",
  "version": "1.0.0",
  "hooks": "../hooks/devsteps-spider-web.json",
  "mcpServer": { "command": "npx", "args": ["@devsteps/mcp-server"] },
  "skills": "../../.github/agents/",
  "prompts": "../../.github/prompts/"
}

Distribution channels:
  github/awesome-copilot plugins/ folder (23.8k ★)
  github/copilot-plugins (104 ★, official)

First Spider Web visualization plugin in any Copilot ecosystem.
```

**Prerequisites:** Phase 1 complete + VS Code 1.110 Stable GA + `plugin.json` format exits Experimental status.

**Effort estimate:** ~1 sprint (plugin.json authoring + docs).

**Risk:** `plugin.json` format is currently Experimental — high churn probability before Stable. Do not invest in plugin manifest authoring until format exits Experimental.

---

## 6. Security & Risk Assessment

Synthesized from Ring 1 risk analyst (bb1b941f) + Ring 2 aspect-constraints (5f16f3c5) + Ring 2 aspect-quality (c1d2e3f4) + Ring 1 quality analyst (b8f3c2d1). All 7 risks identified; 7 OWASP mappings applied.

| ID | Risk | Severity | Probability | OWASP | Mitigation | Status |
|----|------|----------|-------------|-------|-----------|--------|
| **R1** | Command injection via hook scripts consuming `tool_input` fields | HIGH | 30% | A03 Injection, A01 Broken Access | `set -euo pipefail`; jq-only stdin parsing (never pipe to `eval` or `$()` unquoted); double-quote all vars; `jq -r '.field'` not `$(jq ...)` interpolation; shellcheck as mandatory CI gate; PR auto-fail on unquoted var expansion in `.sh` files | **Acceptance criterion** |
| **R2** | Supply chain — Agent Plugins auto-install hooks; malicious plugin exfiltrates `tool_input` + `transcript_path` | HIGH | 25% | A08 Software Integrity | Document: install plugins only from trusted sources; DevSteps hooks design = read-only (no `tool_input` modification); enterprise-disable fallback = polling-only mode; never read `transcript_path` in any DevSteps hook script | **Documented in HOOKS.md** |
| **R3** | Preview API format instability — each Insiders monthly release can silently break hook config | HIGH | 65% | A09 Security Logging (silent failures go undetected) | Pin hooks.json with header comment citing tested VS Code Insiders build; add BATS test: synthetic hook stdin → assert stdout format; treat `.github/hooks/*.json` as versioned documentation; monitor VS Code release notes every release | **Active risk** |
| **R4** | Port discovery — ephemeral port 0 in `McpServerManager` cannot be reached by hook shell processes | HIGH | CERTAIN (85%) | (architectural) | **NEW TASK (P0):** After `this.httpServer = await startHttpMcpServer(0, workspacePath)` in `McpServerManager.start()` (L152), write `.devsteps/.mcp-port` atomically via `atomicWriteJson`; delete in `stop()`; register manager in `context.subscriptions`; hooks validate mtime < 30s; fail-open to file-bridge on stale | **Unmitigated — blocks Phase 2** |
| **R5** | Performance — shell spawn per tool call + BUG-060 zero-debounce amplification | MED | 70% | (operational) | **BUG-060 fix is mandatory prerequisite.** Without debounce: 50 hook events × 3 watcher events = 150 rapid TreeView refreshes → UI unusable. With 500ms debounce: ~1 refresh per burst. Timeout: 5s for SubagentStart/Stop/PostToolUse, 30s for PreCompact only | **Critical path blocker** |
| **R6** | Insiders-only channel — VS Code 1.109 Stable users get silent no-hooks | MED | CERTAIN (100%) | (UX) | Do NOT bump `engines.vscode` during SPIKE/Phase 1; Phase 1 file-bridge works on 1.109+ (FSWatcher is stable); hooks silently do nothing on 1.109 (fail-open); ship `.github/hooks/` with explicit Insiders-only README banner; bump engine only when 1.110 reaches Stable | **Managed by design** |
| **R7** | Concurrent hook kill leaves `.tmp` CBP file stale (Windows NTFS locking) | LOW | 15% | A04 Insecure Design | Existing `atomicWriteJson()` uses `renameSync` after `.tmp` — already mitigated for JSON writes. JSONL hook events must use POSIX `O_APPEND` (safe for <4096 bytes) or `mktemp → write → mv` for larger payloads; BATS tests on ubuntu-only (no Windows test path today) | **Existing mitigation** |
| **BONUS A02** | `getNonce()` in `htmlHelpers.ts:26` uses `Math.random()` — not cryptographically secure CSP nonce | HIGH | CERTAIN (100%) | A02 Cryptographic Failures | **IMMEDIATE FIX:** `Math.random()` → `crypto.randomUUID().replace(/-/g, '')` in `htmlHelpers.ts:26`. One-line change. Confirmed by 3 independent agents (quality b8f3c2d1, impact c1d2e3f4, constraints 5f16f3c5). Must fix BEFORE any hook event data flows through webview HTML renderer | **P0 — fix this sprint** |

**Hard security rules for all DevSteps hook scripts:**

```bash
#!/usr/bin/env bash
set -euo pipefail                   # Mandatory first line of all hooks

# jq availability check — fail-open if not installed
if ! command -v jq >/dev/null 2>&1; then
  echo '{"context": "DevSteps hooks: jq not found, hook skipped"}' >&2
  exit 0  # fail-open
fi

# Safe stdin parse
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""')  # Always double-quoted
# NEVER: eval, $(), unquoted vars, reading transcript_path
```

---

## 7. Internal Fit Analysis

### Files to Modify (confirmed by archaeology agent e3f28a1c + staleness aspect)

| File | Location | Current State | Required Change |
|------|----------|--------------|----------------|
| [packages/extension/src/webview/utils/htmlHelpers.ts](../../packages/extension/src/webview/utils/htmlHelpers.ts) | L26 | `Math.random()` in `getNonce()` | `crypto.randomUUID().replace(/-/g, '')` — OWASP A02 fix (P0) |
| [packages/extension/src/extension.ts](../../packages/extension/src/extension.ts) | L104, L160, L238 | 3 FSWatchers, 6 raw `refresh()` calls, no debounce | (1) Wrap all 6 `refresh()` calls with 500ms debounce util; (2) add 4th FSWatcher for `.devsteps/events/*.jsonl` → `DashboardPanel.postHookEvent()` NOT `refresh()` |
| [packages/extension/src/webview/dashboardPanel.ts](../../packages/extension/src/webview/dashboardPanel.ts) | L51-55 `handleMessage` | Handles only 1 message type: `openItem`; `webview.postMessage()` NEVER called | Add `hookEvent` + `spiderWebInit` message cases; add `postHookEvent(data)` method with `currentPanel` null-guard |
| [packages/extension/src/mcpServerManager.ts](../../packages/extension/src/mcpServerManager.ts) | L152 (after `startHttpMcpServer`) | Never writes port file; `stop()` doesn't delete it; not in subscriptions | Write `.devsteps/.mcp-port` after `await startHttpMcpServer()`; delete in `stop()`; register in `context.subscriptions` |
| [packages/mcp-server/src/http-server.ts](../../packages/mcp-server/src/http-server.ts) | Routes | Only `POST /mcp` + `GET /health`; no SSE; CBP tools absent from HTTP path | Phase 2: add `GET /events` SSE endpoint; `POST /hook-events` broadcast; add CBP tools to `toolHandlers` Map |
| `.gitignore` (root) | — | Missing `.devsteps/events/` and `.devsteps/.mcp-port` entries | Add both entries; add `.devsteps/cbp/.gitignore` creation to `packages/cli/src/commands/init.ts` |
| `packages/shared/src/schemas/cbp-mandate.ts` | `DispatchEntrySchema` | Missing `parent_id` and `event_type` fields | Add both fields (TASK-339 scope); `duration_ms` already exists |

### Files to Create (all confirmed greenfield — none exist today)

| File | Purpose | Phase |
|------|---------|-------|
| `packages/extension/src/utils/debounce.ts` | 500ms debounce utility; Vitest unit tests included | P0 / BUG-060 |
| `packages/shared/src/schemas/hooks.ts` | `HookEventSchema`: `event_type` (8-event enum), `agent_name`, `ring` (0–5), `sprint_id`, `mandate_id?`, `timestamp`; exported from shared barrel | P1 |
| `packages/extension/src/webview/renderers/spiderWebRenderer.ts` | D3 Spider Web 5-ring renderer; bundled as 3rd esbuild target → `dist/spider-web.js`; initial-render + incremental postMessage model; D3 from npm (cannot CDN-load under CSP) | P1 |
| `packages/extension/src/webview/dataProviders/hookEventsProvider.ts` | JSONL file reader + replay buffer; `HookEventSchema.safeParse()` per line; fail-open on malformed; `hookEventsEmitter` for incremental feed | P1 |
| `.github/hooks/devsteps-spider-web.json` | Hook configuration (team-shared); Insiders-only notice header comment with tested build version | P1 |
| `.github/hooks/devsteps-ring-event.sh` | SubagentStart/Stop: jq-parse `agent_type` → ring number → atomic JSONL append; `set -euo pipefail`; jq availability check | P1 |
| `.github/hooks/devsteps-post-tool.sh` | PostToolUse: CBP tool monitoring events; Phase 2 upgrade adds port-file curl path | P1 |
| `.github/hooks/devsteps-pre-compact.sh` | PreCompact: write `.devsteps/cbp/<sprint_id>/ring-state.json` snapshot for coord recovery | P1 |
| `.gitattributes` | `*.sh text eol=lf` — prevents Windows CRLF corruption on clone | P0 |
| `HOOKS.md` | Required before any hooks PR: stdin schema, stdout contract, exit codes, jq-only rule, security, fail-open/closed config, Insiders notice, debugging with Agent Debug Panel | P1 |

### Absent Features Confirmed by Archaeology

- **Spider Web visualization does not exist** — must be built from scratch (no D3, no Chart.js, no ring chart anywhere in codebase)
- **`webview.postMessage()` is NEVER called** in the codebase today — the extension→webview direction is entirely unwired
- **No hooks references anywhere** in the 38 `.github/agents/*.agent.md` files — zero `onPreToolCall`, `onPostToolCall`, `PreCompact`, etc.
- **`HookEventSchema` does not exist** — shared barrel exports: analysis, cbp-loops, cbp-mandate, index-refs, project, relationships; no hooks schema
- **HOOKS.md does not exist** — required before any PR touching hook infrastructure

### The 5 Integration Contracts

| Contract | Rule | Verification |
|----------|------|-------------|
| **B1** — FSWatcher routing | 4th FSWatcher `.devsteps/events/*.jsonl` routes exclusively to `DashboardPanel.postMessage()`; NEVER to `treeDataProvider.refresh()` | Check: no `refresh()` call in JSONL watcher block |
| **B2** — Port file lifecycle | `McpServerManager.start()` writes; `stop()` deletes; registered in `context.subscriptions`; hooks validate mtime < 30s and fail-open | Check: port file absent after `deactivate()` |
| **B3** — Shared schema ownership | `HookEventSchema` lives in `packages/shared/src/schemas/hooks.ts`; both `extension` and `mcp-server` import from `@devsteps/shared` | Check: no duplicate schema definitions |
| **B4** — esbuild coupling | D3 Spider Web renderer is 3rd esbuild target in `extension/esbuild.js`; Spider Web uses initial-render + incremental postMessage (NOT full html replace) | Check: D3 state persists through hook event updates |
| **B5** — Replay buffer | `DashboardPanel.currentPanel` null-guarded on all hook dispatch; `hookEventsProvider` reads all existing JSONL on panel open; incremental from FSWatcher | Check: events from before panel-open are visible on first render |

---

## 8. Prioritized Recommendations

### P0 — Do This Sprint (prerequisite sprint — all must clear before any hooks STORY)

| # | Action | Owner | Rationale |
|---|--------|-------|-----------|
| 1 | **Fix BUG-060** — create `packages/extension/src/utils/debounce.ts` (500ms timeout, cancel on repeat); wrap all 6 raw `refresh()` calls in `extension.ts` L163-165 + L242-244; add Vitest tests | exec-impl | Without this: 50 hook events × 3 watcher events = 150 rapid TreeView refreshes; UI unusable; hooks amplify the burst 3–5× |
| 2 | **Expand BUG-059** — add `.devsteps/events/` + `.devsteps/.mcp-port` to root `.gitignore`; add `.devsteps/cbp/.gitignore` creation to `init.ts`; create `.gitattributes` (`*.sh text eol=lf`) | exec-impl | Runtime JSONL events and port file must not pollute git history; `.sh` CRLF on Windows breaks bash execution |
| 3 | **Fix OWASP A02 getNonce()** — `htmlHelpers.ts:26`: `Math.random()` → `crypto.randomUUID().replace(/-/g, '')` | exec-impl | Confirmed by 3 agents; exploitable once hook event data (attacker-controlled strings) flows through webview HTML; one-line fix |
| 4 | **NEW TASK — Write port file** — `McpServerManager.start()` writes `.devsteps/.mcp-port` after `startHttpMcpServer()` resolves (L152); `stop()` deletes it; register manager in `context.subscriptions` | exec-impl | R4 port-discovery is architecturally certain blocker for Phase 2; fix now to unblock Phase 2 planning |
| 5 | **Mark SPIKE-025 done** — `mcp_devsteps_update({id: 'SPIKE-025', status: 'done', append_description: 'Research output: .devsteps/research/vscode-1110-agent-debug-2026-03-05.md — committed e46a81a 2026-03-05. Research scope subsumed by SPIKE-026.'})` | coord | DevSteps item stale; output file confirmed by staleness agent; zero code changes needed |
| 6 | **Update TASK-341 description** — shift from "emit YAML before each ring transition" to "PreCompact hook fires before /compact → writes ring-state.json snapshot → coord checks for snapshot on session start → resumes from persisted ring position" | coord | Archaeology confirms current TASK-341 description is stale (wrong mechanism); fix prevents impl agent building the wrong thing |

### P1 — Next Sprint (required for Phase 1 implementation)

| # | Action | Owner | Rationale |
|---|--------|-------|-----------|
| 7 | **Create HookEventSchema** in `packages/shared/src/schemas/hooks.ts`; export from barrel; extend `DispatchEntrySchema` with `parent_id` + `event_type` (TASK-339 scope) | exec-impl | Schema must exist before any code writes or reads hook events; belongs in shared (extension + mcp-server both need it) |
| 8 | **Create `.github/hooks/` directory + all 3 shell scripts** — `devsteps-ring-event.sh` (SubagentStart/Stop), `devsteps-post-tool.sh` (PostToolUse), `devsteps-pre-compact.sh` (PreCompact); all with `set -euo pipefail` + jq availability check + fail-open | exec-impl | Hook scripts are the data source for Phase 1 visualization |
| 9 | **Create `.github/hooks/devsteps-spider-web.json`** — hooks.json config (team-shared); header comment with tested VS Code Insiders build version | exec-impl | Users must drop this file in their workspace to enable hooks |
| 10 | **Wire `dashboardPanel.ts` postMessage bridge** — add `hookEvent` + `spiderWebInit` cases to `handleMessage`; add `postHookEvent(data)` public method with `currentPanel` null-guard; add replay buffer | exec-impl | Extension→webview direction entirely unwired today; Phase 1 cannot work without this |
| 11 | **Add 4th FSWatcher** in `extension.ts` for `.devsteps/events/*.jsonl` → `DashboardPanel.postHookEvent()` (NOT refresh) | exec-impl | Separate watcher required (not extension of `.json`); routing to DashboardPanel not TreeView |
| 12 | **Implement TASK-341 + PreCompact hook pair** — `## Compaction Checkpoint` section in all coord agent files + `devsteps-pre-compact.sh` implementation | exec-doc + exec-impl | Neither works alone; paired mandatory unit |
| 13 | **Write HOOKS.md** — stdin schema, stdout contract, exit codes, jq-only rule, security guidelines, fail-open/closed config, Insiders notice, fallback UX, Agent Debug Panel debugging section | exec-doc | Required before any hooks PR merges; gate criterion for gate-reviewer |

### P2 — Important (Phase 1 completion)

| # | Action | Owner | Rationale |
|---|--------|-------|-----------|
| 14 | **Build spiderWebRenderer.ts** — D3 5-ring SVG animation; 3rd esbuild target → `dist/spider-web.js`; initial-render + incremental postMessage (no full html replace); served via `asWebviewUri` | exec-impl | Core Phase 1 visualization deliverable |
| 15 | **Create `hookEventsProvider.ts`** — JSONL parser + replay buffer; `HookEventSchema.safeParse()` per line; fail-open on malformed lines | exec-impl | Provides replay of pre-panel-open events on dashboard launch |
| 16 | **Fix 43 Biome lint errors** — `npm run format --write`; all auto-fixable format/import-sort; must be clean before any PR | exec-impl | Quality gate pre-condition; 43 errors currently block clean CI |
| 17 | **Add Zod safeParse to CRUD handlers** — `add.ts`, `get.ts`, `list.ts`, `update.ts`; match existing `cbp-mandate.ts` pattern | exec-impl | Runtime validation gap identified by quality agent; security-relevant (MCP tool input validation) |
| 18 | **Add shellcheck + test:hooks to CI** — `npm run lint:shell` + `npm run test:hooks` (BATS); both required as hooks PR gate criteria | exec-impl | A03 injection gate; BATS already in test suite — synthetic stdin → assert stdout/exit |

### P3 — Future (Phase 2 SSE + Phase 3 Plugin)

| # | Action | Owner | Rationale |
|---|--------|-------|-----------|
| 19 | **Phase 2 SSE endpoint** — `GET /events` SSE in `http-server.ts`; `POST /hook-events` broadcast; CBP tools in HTTP toolHandlers Map; extension `EventSource` proxy in `mcpServerManager.ts` | exec-impl | Upgrades from ~500ms file-poll to <100ms real-time; requires Phase 1 validated + port file task + 1.110 Stable |
| 20 | **STORY-199 plugin.json** — agent plugin manifest for github/awesome-copilot; deferred until hooks stable + plugin.json format exits Experimental | exec-impl | First Spider Web visualization plugin in any Copilot ecosystem; high strategic value but format churn risk |
| 21 | **Engine bump to `^1.110.0`** | exec-impl | After VS Code 1.110 Stable GA (est. April–June 2026) |
| 22 | **Node.js hook alternative for Windows** | exec-impl | bash/jq unavailable on Windows; Phase 1 is Linux/macOS only; TypeScript hook runner for Phase 3 cross-platform support |
| 23 | **Extension + mcp-server test infrastructure** — both packages today have 0 test files | exec-test | Required before any hooks PR merges; test runner setup is prerequisite |

---

## 9. New DevSteps Items Recommended

All 13 new items from planner synthesis, ordered by dependency chain:

| # | Type | ID Ref | Priority | Title | Depends-on | Tags |
|---|------|--------|----------|-------|-----------|------|
| A | `bug` | NEW | `urgent-important` | `fix(extension): getNonce() Math.random() → crypto.randomUUID() [OWASP A02]` | — | security, owasp-a02, webview, p0 |
| B | `task` | NEW | `urgent-important` | `fix(extension): write .devsteps/.mcp-port in McpServerManager.start() [R4 port-discovery]` | BUG-059 | hooks, infrastructure, p0 |
| C | `task` | BUG-060 | `urgent-important` | `fix(extension): create utils/debounce.ts + debounce all 6 FSWatcher refresh() calls (500ms)` | — | performance, bug, p0 |
| D | `task` | NEW | `not-urgent-important` | `feat(shared): create HookEventSchema + extend DispatchEntry with parent_id + event_type [TASK-339-ext]` | TASK-339 | hooks, schema, p1 |
| E | `task` | NEW | `not-urgent-important` | `feat(extension): wire extension→webview postMessage bridge in dashboardPanel.ts` | D | hooks, webview, p1 |
| F | `task` | NEW | `not-urgent-important` | `feat(extension): add 4th FSWatcher for .devsteps/events/*.jsonl → DashboardPanel [hooks Phase 1]` | BUG-060, D, E | hooks, fswatcher, p1 |
| G | `task` | NEW | `urgent-important` | `docs: create HOOKS.md — stdin/stdout schema, security, exit codes, Insiders notice` | SPIKE-026 | docs, hooks, security, p1 |
| H | `story` | STORY-198 evo | `not-urgent-important` | `feat(extension): Spider Web Phase 1 — file-bridge hook visualization` | BUG-060, BUG-059, A, B, D, E, F, G | hooks, spider-web, phase-1 |
| I | `task` | NEW | `not-urgent-important` | `chore(ci): add shellcheck lint + test:hooks BATS as hooks PR gate` | H | ci, security, testing |
| J | `task` | NEW | `urgent-not-important` | `fix(lint): resolve 43 Biome auto-fixable errors across CLI + extension` | — | lint, quality |
| K | `task` | NEW | `not-urgent-not-important` | `fix(mcp-server): add Zod safeParse to add/get/list/update handlers` | — | mcp, validation, quality |
| L | `story` | TASK-340 evo | `not-urgent-not-important` | `feat(mcp-server): Spider Web Phase 2 — SSE streaming hook events [TASK-340 evo]` | H, B | hooks, sse, phase-2 |
| M | `story` | STORY-199 evo | `not-urgent-not-important` | `feat: DevSteps Agent Plugin distribution — github/awesome-copilot [STORY-199 evo]` | H | plugin, distribution, phase-3 |

**Dependency links to add (via worker-devsteps):**
- STORY-198 → `depends-on` → TASK-339
- STORY-198 → `depends-on` → BUG-060
- STORY-199 → `depends-on` → Item H (Phase 1 story)
- TASK-341 → `relates-to` → Item H (PreCompact hook — paired unit)
- Items B, F, H, L → `depends-on` → BUG-060

**Staleness updates required (items that exist but have wrong state):**

| Item | Current State | Required Action |
|------|--------------|----------------|
| SPIKE-025 | `draft` | → `done` + append research output description |
| TASK-341 | description references per-ring-transition YAML approach | → update description: PreCompact hook + ring-state.json mechanism |
| BUG-059 | narrow scope (cbp/analysis gitignore) | → append scope expansion: `.devsteps/events/` + `.mcp-port` + `.gitattributes` |

---

## Appendix A: HookEventSchema Draft

```typescript
// packages/shared/src/schemas/hooks.ts
import { z } from 'zod';

export const HookEventTypeSchema = z.enum([
  'SessionStart',
  'UserPromptSubmit',
  'PreToolUse',
  'PostToolUse',
  'PreCompact',
  'SubagentStart',
  'SubagentStop',
  'Stop',
]);

export const HookEventSchema = z.object({
  event_type: HookEventTypeSchema,
  timestamp: z.string().datetime(),
  session_id: z.string(),
  agent_name: z.string().optional(),   // full agent name e.g. "devsteps-R1-analyst-research"
  ring: z.number().int().min(0).max(5).optional(), // extracted from agent_name prefix
  sprint_id: z.string().optional(),
  mandate_id: z.string().uuid().optional(),
  tool_name: z.string().optional(),    // PostToolUse / PreToolUse only
  parent_session_id: z.string().optional(), // SubagentStart only
  exit_code: z.number().int().optional(),   // SubagentStop / Stop only
});

export type HookEvent = z.infer<typeof HookEventSchema>;
export type HookEventType = z.infer<typeof HookEventTypeSchema>;
```

---

## Appendix B: Evidence Citations

All findings in this brief are supported by ≥2 independent analyst results:

| Claim | Supporting Agents |
|-------|------------------|
| SubagentStart.agent_type encodes ring | research (a4b2c3d4), archaeology (e3f28a1c), integration (c9d4e5f6) |
| BUG-060 zero-debounce confirmed | archaeology (e3f28a1c), impact (c1d2e3f4), risk (bb1b941f), constraints (5f16f3c5) |
| getNonce() uses Math.random() | quality (b8f3c2d1), impact (c1d2e3f4), constraints (5f16f3c5) |
| webview.postMessage() never called | archaeology (e3f28a1c), integration (c9d4e5f6), impact (c1d2e3f4) |
| R4 port-discovery blocker | risk (bb1b941f), constraints (5f16f3c5), integration (c9d4e5f6) |
| DevSteps first-mover (zero Spider Web examples) | research (a4b2c3d4), planner synthesis (f8e9d0c1) |
| Phase 1 works on 1.109+ Stable | research (a4b2c3d4), constraints (5f16f3c5), integration (c9d4e5f6) |
| GA estimate April–June 2026 | research (a4b2c3d4), risk (bb1b941f) |
| HookEventSchema does not exist | archaeology (e3f28a1c), quality (b8f3c2d1), integration (c9d4e5f6) |
| CBP tools absent from HTTP path | archaeology (e3f28a1c), integration (c9d4e5f6) |

---

*Brief synthesized from 9 MandateResults by devsteps-R4-exec-doc. Planner synthesis (mandate f8e9d0c1) is primary input; all other mandates provide depth and specific detail cited throughout.*
