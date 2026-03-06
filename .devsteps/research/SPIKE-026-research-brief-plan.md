# SPIKE-026 Research Brief Plan
<!-- Produced by: devsteps-R3-exec-planner | Sprint: 2026-03-05-hooks | 2026-03-05 -->
<!-- Input: 9 MandateResults (4 Ring 1 + 5 Ring 2). This file is the primary input for exec-doc. -->

## Section 1: Executive Summary

VS Code 1.110 Copilot Hooks are a genuine first-mover opportunity for Spider Web visualization: no competitor (Cursor, WindSurf, Continue.dev) has equivalent lifecycle shell-hook capability. DevSteps **should adopt hooks** via a two-phase approach — Phase 1 (file-bridge, works on VS Code 1.109+ Stable today) delivers Spider Web ring animation using existing FSWatcher infrastructure before 1.110 Stable release; Phase 2 (SSE streaming) upgrades to sub-100ms real-time once 1.110 hits Stable (estimated April–June 2026). However, **five P0 blockers** must be resolved before any implementation STORY begins:

1. BUG-060 (zero-debounce FSWatcher) — hooks amplify burst 3–5×
2. BUG-059 (gitignore gaps) — `.devsteps/events/` and `.devsteps/.mcp-port` absent
3. OWASP A02 `getNonce()` weakness — `Math.random()` in `htmlHelpers.ts:26`
4. R4 port-discovery — `mcpServerManager.ts` never writes `.devsteps/.mcp-port`
5. SPIKE-025 status stale — output file exists; status still `draft`

Confidence: **0.91** (mean across 9 agents, range 0.88–0.96). Timeline: P0 prerequisites (~1 sprint) → Phase 1 (~2–3 sprints) → Phase 2 (~2–3 sprints) → Phase 3 plugin distribution (~1 sprint).

**Top 3 recommendations:**
1. Dedicate one sprint to clearing all P0 blockers before touching hook infrastructure.
2. Implement Phase 1 File-Bridge as STORY-198 evolution — works on VS Code 1.109+ Stable, no Insiders required.
3. Publish DevSteps as Agent Plugin to github/awesome-copilot as Phase 3 — first Spider Web visualization in any Copilot ecosystem (first-mover confirmed).

---

## Section 2: Research Horizon

- **Date range**: 2025-12-05 to 2026-03-05 (90 days; includes SPIKE-025 context)
- **Total sources**: 14+ distinct sources
- **Source types**:
  - Official docs: VS Code 1.110 Insiders release notes, VS Code extension API, Claude Code hooks GA docs
  - GitHub: github/awesome-copilot (23.8k stars) — active hooks/ folder (audit logging, auto-commit examples); zero Spider Web visualization examples found — DevSteps is first-mover
  - Internal: All 15 affected source files read directly by archaeology + aspect agents
  - Security: OWASP Top 10 2021 mapping applied

---

## Section 3: VS Code 1.110 Hooks — Complete Technical Specification

### 3.1 Lifecycle Event Types

| Event | Key stdin fields | Key stdout fields | Blocking? |
|---|---|---|---|
| `SessionStart` | event_type, session_id, timestamp | context (inject) | No |
| `UserPromptSubmit` | event_type, prompt, session_id | updatedPrompt | exit 2 = block |
| `PreToolUse` | event_type, tool_name, tool_input, tool_use_id | permissionDecision (allow/deny/ask), updatedInput | exit 2 = deny |
| `PostToolUse` | event_type, tool_name, tool_input, tool_use_id, tool_response | context (inject) | exit 2 = abort |
| `PreCompact` | event_type, session_id, transcript_path, context_length | context (inject to preserve) | exit 2 = abort |
| `SubagentStart` | event_type, **agent_type**, session_id, parent_session_id | context (inject) | No |
| `SubagentStop` | event_type, agent_type, session_id, exit_code | — | No |
| `Stop` | event_type, session_id, exit_code, stop_reason | — | No |

**Critical insight**: `SubagentStart.agent_type` = full agent name (e.g. `devsteps-R1-analyst-research`). The `devsteps-R{N}-*` prefix directly encodes Spider Web ring number — this is the primary signal for ring animation.

### 3.2 Configuration Format

```json
// .github/hooks/devsteps-spider-web.json  (team-shared, recommended)
{
  "hooks": {
    "SubagentStart": [{"type": "command", "command": "./scripts/hooks/ring-event.sh", "timeout": 10}],
    "SubagentStop":  [{"type": "command", "command": "./scripts/hooks/ring-event.sh", "timeout": 10}],
    "PostToolUse":   [{"type": "command", "command": "./scripts/hooks/tool-event.sh", "timeout": 5}],
    "PreCompact":    [{"type": "command", "command": "./scripts/hooks/save-ring-state.sh", "timeout": 30}]
  }
}
```

User-local config: `.claude/settings.json` or `.claude/settings.local.json` (not committed).

### 3.3 Blocking Mechanism
- Exit `0` = allow / success
- Exit `2` = blocking decision (tool denied, compact aborted)
- Exit `any other non-zero` = warning only (Output Channel log; execution continues)

### 3.4 Context Injection
Stdout JSON `{"context": "<string>"}` from PreCompact/SessionStart/SubagentStart causes VS Code to inject the string into the agent's context window. This is the mechanism for Spider Web ring-state recovery after compaction.

### 3.5 Open Questions (require empirical testing)
- PreCompact stdout `context` field: honored in VS Code vs Claude Code? (OPEN)
- Tool name format in VS Code hooks: camelCase vs snake_case? (format drift documented — empirical test needed)

### 3.6 Availability
- **VS Code 1.110 Insiders ONLY** as of 2026-03-05
- **GA estimate**: April–June 2026
- `engines.vscode`: MUST stay at `^1.109.0` during research/Phase 1
- **Claude Code CLI**: hooks format is GA (same format, different tool names)
- **Background Agents**: hooks work in all session types

### 3.7 Comparison Table

| Feature | Status | DevSteps Relevance |
|---|---|---|
| Hooks | Insiders Preview → Stable ~Q2 2026 | PRIMARY: Spider Web ring animation |
| Agent Plugins (plugin.json) | Experimental | Phase 3: marketplace distribution |
| Background Agents | Available | All session types supported |
| `/compact` | Stable | RISK: loses ring state without PreCompact hook |
| askQuestions tool | Stable | TRIAL: reliable in subagents |
| Session Memory | Experimental | TRIAL: coord ring-state alternative |
| `/fork` | Stable | RISK: new sessionId breaks ring correlation |
| Agent Debug Panel | Insiders | Hook debugging utility — document in HOOKS.md |

---

## Section 4: Technology Radar Signals

| Feature | Radar Signal | Rationale |
|---|---|---|
| **Hooks Phase 1 (file-bridge)** | **TRIAL** | Works on 1.109+ Stable; first-mover; P0 blockers solvable; GA in ~2 months |
| **Hooks Phase 2 (SSE streaming)** | **ASSESS** | Blocked until port-file task + CBP tools in HTTP + 1.110 Stable |
| **Agent Plugins / plugin.json** | **ASSESS** | Format Experimental (high churn risk); blocks only marketplace dist, not Spider Web |
| **Context Compaction `/compact`** | **MITIGATE** | Users will use /compact regardless; implement PreCompact hook + TASK-341 paired |
| **Background Agents** | **ASSESS** | Hooks work in all session types; document only |
| **askQuestions tool** | **TRIAL** | Research confirms reliable in subagents; expand in clarification loops |
| **Session Memory** | **TRIAL** | Use as complement to PreCompact disk snapshot for coord ring state |
| **Agent Debug Panel** | **ASSESS** | Useful for hook debugging; document in HOOKS.md |

---

## Section 5: Spider Web Visualization — 3-Phase Integration Plan

### Phase 1: File-Bridge (STORY-198 evolution)

**Architecture**:
```
SubagentStart/Stop hook.sh → jq (stdin parse) → .devsteps/events/<session_id>.jsonl
  → FSWatcher (4th, dedicated, .jsonl pattern)
  → DashboardPanel.postHookEvent(data)  [null-guard currentPanel]
  → webview window.addEventListener('message')
  → spiderWebRenderer.js (D3, 3rd esbuild target: dist/spider-web.js)
  → SVG 5-ring animation
```

**Replay on panel open**: `hookEventsProvider.ts` reads all `.devsteps/events/*.jsonl` files; parses each line via `HookEventSchema.safeParse`; skips malformed lines (fail-open); sends buffered events to renderer.

**Prerequisites** (all must be complete before Phase 1 STORY begins):
1. BUG-060 FIXED — `utils/debounce.ts` created; 6 raw `refresh()` calls debounced (extension.ts L163-165, L242-244)
2. BUG-059 FIXED + EXPANDED — `.devsteps/events/` and `.devsteps/.mcp-port` in `.gitignore`; `.devsteps/cbp/.gitignore` in init.ts
3. `getNonce()` FIXED — `crypto.randomUUID()` in `htmlHelpers.ts:26`
4. `HookEventSchema` DEFINED — `packages/shared/src/schemas/hooks.ts`
5. `TASK-341` IMPLEMENTED — `## Compaction Checkpoint` section in all coord agent files
6. `HOOKS.md` WRITTEN — security guidelines, stdin/stdout contracts, jq-only rule
7. `.gitattributes` CREATED — `*.sh text eol=lf`

**Estimated effort**: ~2–3 sprints after the P0 prerequisite sprint

**Works on VS Code 1.109+ Stable** — no Insiders requirement for Phase 1.

### Phase 2: SSE Streaming (TASK-340 evolution)

**Architecture**:
```
hook.sh reads .devsteps/.mcp-port → curl POST localhost:$PORT/hook-events (--max-time 2)
  → http-server.ts GET /events SSE endpoint
  → mcpServerManager.ts EventSource subscriber (extension host proxy)
  → DashboardPanel.postMessage()
  → spiderWebRenderer.js (same renderer, faster feed: <100ms vs ~500ms)
```

**Port file contract** (`.devsteps/.mcp-port`):
```json
{"url": "http://127.0.0.1:PORT", "token": "<UUID>", "pid": PID, "workspace": "<path>"}
```
Hooks: read, validate mtime < 30s, fail-open to file-bridge (exit 0) on stale.

**Key architecture note**: `extension/esbuild.js` bundles two targets in one file (`dist/extension.js` + `dist/mcp-server.js` from `../mcp-server/src/http-server.ts`). SSE changes auto-propagate to both.

**Prerequisites** (beyond Phase 1):
1. PORT FILE TASK (NEW) — write/delete `.devsteps/.mcp-port` in `McpServerManager.start()/stop()`; register manager in `context.subscriptions`
2. SSE endpoint — `http-server.ts GET /events` (Node.js `res.write('data: ...\n\n')`)
3. CBP tools added to `http-server.ts` toolHandlers Map (currently stdio-only)
4. Extension host `EventSource` proxy in `mcpServerManager.ts`

**Estimated effort**: ~2–3 sprints after Phase 1

### Phase 3: Agent Plugin Distribution

**plugin.json** (`.github/plugins/devsteps.json` or workspace root):
```json
{
  "name": "devsteps",
  "displayName": "DevSteps Spider Web Visualization",
  "hooks": "../.github/hooks/devsteps-spider-web.json",
  "mcpServer": {"command": "npx", "args": ["@devsteps/mcp-server"]},
  "skills": ".github/agents/"
}
```

**@agentPlugins marketplace**: Submit to github/awesome-copilot `plugins/` folder. DevSteps would be the first Spider Web visualization plugin in any Copilot ecosystem.

**Prerequisites**: Phase 1 complete, VS Code 1.110 Stable GA, `plugin.json` format exited Experimental.

**Estimated effort**: ~1 sprint (primarily plugin.json authoring + docs)

---

## Section 6: Security & Risk Assessment

### Full Risk Matrix (7 risks from Risk R1 + Quality analysts)

| ID | Risk | Severity | Probability | Mitigation |
|---|---|---|---|---|
| **R1** | Command injection via hook scripts (OWASP A03) | HIGH | 30% | `set -euo pipefail`; jq-only stdin parsing; double-quoted vars; never `eval`; shellcheck as CI gate. **Acceptance criterion**: any PR with unquoted var expansion in .sh = auto-fail. |
| **R2** | Supply chain — Agent Plugins auto-install hooks (OWASP A08) | HIGH | 25% | Document: only install plugins from trusted sources. Design DevSteps hooks as read-only (no tool_input modification). Add enterprise-disable fallback (polling-only mode). |
| **R3** | Preview API format instability | HIGH | 65% | Pin `.github/hooks/*.json` to tested VS Code Insiders build (header comment). Add BATS test: synthetic hook stdin → assert stdout format. Already documented format drift: `timeout` vs `timeoutSec`; lowerCamelCase vs PascalCase event names. |
| **R4** | Port discovery — hooks cannot reach ephemeral HTTP MCP server | HIGH | CERTAIN | **NEW TASK**: After `this.httpServer = await startHttpMcpServer(0, workspacePath)` in `McpServerManager.start()`, write `.devsteps/.mcp-port` atomically. Delete in `stop()`. Register manager in subscriptions. Hook scripts: read port, validate mtime < 30s, fail-open to file-bridge on stale. |
| **R5** | Performance — shell spawn + BUG-060 amplification | MED | 70% | **BUG-060 FIX IS MANDATORY** before hooks land. Without debounce: 50 hook events × 3 watcher events = 150 rapid TreeView refreshes → UI unusable. With 500ms debounce: collapses to ~1 refresh per burst. Timeout: 5s for SubagentStart/Stop/PostToolUse, 30s for PreCompact only. |
| **R6** | Insiders-only channel — silent failure on VS Code 1.109 Stable | MED | CERTAIN | DO NOT bump `engines.vscode` during SPIKE/Phase 1. Phase 1 file-bridge works on 1.109+ (FSWatcher is stable). Ship `.github/hooks/` as Insiders-only examples with explicit README notice. |
| **R7** | Concurrent hook kill leaves .tmp stale (Windows NTFS) | LOW | 15% | Existing CBP write path uses `atomicWriteJson()` (renameSync after .tmp) — already mitigated. Hook scripts: `mktemp → write → mv`. JSONL append is POSIX-atomic for <4096 bytes. |
| **BONUS** | OWASP A02 — getNonce() uses Math.random() (htmlHelpers.ts:26) | HIGH | CERTAIN | **IMMEDIATE FIX**: Replace with `crypto.randomUUID()`. Confirmed by 3 agents (quality, impact, constraints). Exploitable once hook event data flows through webview HTML. |

---

## Section 7: Internal Fit Analysis

### Files to Modify (confirmed by archaeology + staleness via direct code inspection)

| File | Location | Change |
|---|---|---|
| `packages/extension/src/webview/utils/htmlHelpers.ts` | L26 | `Math.random()` → `crypto.randomUUID()` in getNonce() |
| `packages/extension/src/extension.ts` | L163-165 (watcher 2), L242-244 (watcher 3) | Debounce all 6 raw `refresh()` calls; add 4th FSWatcher for `.devsteps/events/*.jsonl` → DashboardPanel (NOT refresh) |
| `packages/extension/src/webview/dashboardPanel.ts` | L51-55 handleMessage | Add `hookEvent` + `spiderWebInit` cases; activate `webview.postMessage()` (currently NEVER called); add public `postHookEvent(data)` with null-guard |
| `packages/extension/src/mcpServerManager.ts` | L152 (after startHttpMcpServer) | Write `.devsteps/.mcp-port` atomically; delete in `stop()`; register in subscriptions |
| `packages/mcp-server/src/http-server.ts` | routes | Phase 2: add `GET /events` SSE; add CBP tools to toolHandlers Map |
| `.gitignore` (root) | | Add `.devsteps/events/` and `.devsteps/.mcp-port` entries |
| `packages/cli/src/commands/init.ts` | L102 devstepsEntries | Add `.devsteps/cbp/.gitignore` creation (matches existing `.devsteps/analysis/.gitignore`) |
| `packages/shared/src/schemas/cbp-mandate.ts` | DispatchEntrySchema | Extend with `parent_id` + `event_type` (TASK-339 scope) |

### Files to Create (all confirmed greenfield)

| File | Purpose |
|---|---|
| `packages/extension/src/utils/debounce.ts` | BUG-060 fix: 500ms debounce utility + Vitest tests |
| `packages/shared/src/schemas/hooks.ts` | HookEventSchema: event_type (8-event enum), agent_name, ring (0–5), sprint_id, mandate_id?, timestamp; export from barrel |
| `packages/extension/src/webview/renderers/spiderWebRenderer.ts` | Spider Web 5-ring D3 renderer; bundled as 3rd esbuild target → `dist/spider-web.js`; CSP: D3 cannot load from CDN |
| `packages/extension/src/webview/dataProviders/hookEventsProvider.ts` | JSONL parser; replay buffer; HookEventSchema.safeParse per line; fail-open on malformed |
| `.github/hooks/devsteps-spider-web.json` | Hook configuration (team-shared); Insiders-only notice in header comment |
| `scripts/hooks/ring-event.sh` | SubagentStart/Stop: jq-parse agent_type → ring number → append HookEvent to JSONL; set -euo pipefail; jq absence check |
| `scripts/hooks/tool-event.sh` | PostToolUse: CBP tool monitoring events |
| `scripts/hooks/save-ring-state.sh` | PreCompact: write `.devsteps/cbp/<sprint_id>/ring-state.json` for coord recovery |
| `.gitattributes` | `*.sh text eol=lf` — prevents CRLF corruption on Windows clone |
| `HOOKS.md` | REQUIRED before any hooks PR: stdin schema, stdout contract, exit codes, jq-only rule, security, fail-open/closed config, Insiders notice |

### The 5 Integration Contracts

| Contract | Rule |
|---|---|
| **B1** — FSWatcher ↔ Hook Shell | Dedicated 4th watcher (`.devsteps/events/*.jsonl`), NOT extension of `.devsteps/**/*.json`. Route to DashboardPanel.postMessage, NOT refresh(). |
| **B2** — Port Discovery | Port file `{url, token, pid, workspace}` written by McpServerManager; deleted by stop(); registered as subscription. Hooks validate mtime < 30s; fail-open to file-bridge. |
| **B3** — Shared Schema | HookEventSchema MUST live in packages/shared — both extension and mcp-server import from @devsteps/shared. |
| **B4** — esbuild Coupling | extension/esbuild.js bundles ext + mcp-server.js; SSE changes auto-propagate. D3 requires a THIRD esbuild target. Spider Web must use initial-render + incremental postMessage model (one-shot html-replacement loses D3 state). |
| **B5** — DashboardPanel Replay | `DashboardPanel.currentPanel` is undefined until Dashboard command invoked. All hook dispatch must null-guard + maintain disk-backed replay buffer. |

---

## Section 8: Staleness Actions Required Immediately

**All three actions should be taken by coord or worker-devsteps immediately — no code changes required for items 1-2; item 3 needs description text only.**

### 1. SPIKE-025 → Mark DONE
- Evidence: `.devsteps/research/vscode-1110-agent-debug-2026-03-05.md` EXISTS; committed in `e46a81a 2026-03-05`
- Action: `mcp_devsteps_update({id: 'SPIKE-025', status: 'done', append_description: 'Research output: .devsteps/research/vscode-1110-agent-debug-2026-03-05.md — committed e46a81a 2026-03-05. Research scope subsumed by SPIKE-026.'})`

### 2. TASK-341 → Description Update (approach shift)
- Current assumption (STALE): 'emit YAML checkpoint block before each ring transition'
- Corrected approach: PreCompact hook fires ONLY before `/compact` — far cleaner trigger. Updated:
  > "PreCompact hook (`scripts/hooks/save-ring-state.sh`) writes `.devsteps/cbp/<sprint_id>/ring-state.json` before compaction. Each coord agent file must include `## Compaction Checkpoint` section instructing: on session start, check for ring-state.json and resume from persisted ring position. The 'before each ring transition' emission approach is abandoned — only the session-start recovery section in agent files remains."
- Action: `mcp_devsteps_update({id: 'TASK-341', description: '<text above>'})`

### 3. BUG-059 → Scope Expansion
- Current: root .gitignore manually patched for cbp/ and analysis/ (commit e46a81a). CLI init covers .devsteps/ whole. analysis/.gitignore exists.
- Remaining gaps: `.devsteps/cbp/.gitignore` ABSENT; `.devsteps/events/` and `.devsteps/.mcp-port` ABSENT from .gitignore
- Action: `mcp_devsteps_update({id: 'BUG-059', append_description: 'Scope expanded 2026-03-05: add .devsteps/cbp/.gitignore to init command; add .devsteps/events/ and .devsteps/.mcp-port to root .gitignore template.'})`

---

## Section 9: Prioritized Master Recommendations

### P0 — Do Immediately (prerequisite sprint — all must clear before any hooks STORY)

1. **Fix BUG-060 debounce** — `utils/debounce.ts` (500ms); wire into all 6 `refresh()` calls in extension.ts (L163-165, L242-244); add Vitest tests. Without this: 150 rapid TreeView refreshes per sprint.
2. **Expand BUG-059** — add `.devsteps/events/` + `.devsteps/.mcp-port` to root `.gitignore`; add `.devsteps/cbp/.gitignore` to `init.ts`; create `.gitattributes` (`*.sh text eol=lf`).
3. **Fix OWASP A02 getNonce()** — `htmlHelpers.ts:26`: `Math.random()` → `crypto.randomUUID()`. One-line fix. Confirmed by 3 agents.
4. **Mark SPIKE-025 done** — DevSteps update only; no code. Research output file exists.
5. **Update TASK-341 description** — shift to PreCompact hook + ring-state.json approach.
6. **Expand BUG-059 description** — append scope details.

### P1 — Required (Phase 1 implementation sprint)

7. **(NEW TASK) Write .devsteps/.mcp-port** — After `startHttpMcpServer()` in `McpServerManager.start()`; delete in `stop()`; register in subscriptions. R4 port-discovery blocker for Phase 2.
8. **Define HookEventSchema** — `packages/shared/src/schemas/hooks.ts`; export from barrel; extend DispatchEntrySchema with parent_id + event_type (TASK-339 scope). Note: duration_ms already exists in DispatchEntrySchema (TASK-331).
9. **Wire dashboardPanel postMessage bridge** — add `postHookEvent()`, `hookEvent`/`spiderWebInit` message cases, null-guard.
10. **Add 4th FSWatcher (.jsonl)** — separate from existing JSON watchers; route to DashboardPanel only.
11. **Implement TASK-341 + PreCompact hook pair** — neither works alone; implement together.
12. **Fix 43 Biome lint errors** — `npm run format --write`; all auto-fixable; must be clean before any PR.
13. **Add Zod safeParse to add/get/list/update handlers** — match cbp-mandate.ts pattern.

### P2 — Important (Phase 1 completion)

14. **Create HOOKS.md** — required before any hooks PR merges; stdin schema, stdout contract, security guidelines, Insiders notice, fallback UX.
15. **Build spiderWebRenderer.ts** — D3 as 3rd esbuild target; initial-render + incremental postMessage model.
16. **Create hookEventsProvider.ts** — JSONL parser + replay buffer.
17. **Create .github/hooks/ + shell scripts** — `devsteps-spider-web.json`, `ring-event.sh`, `tool-event.sh`, `save-ring-state.sh`. All: `set -euo pipefail`, jq check, fail-open.
18. **Add shellcheck + test:hooks to CI** — both required as hooks PR acceptance criteria (A03 shell injection gate).

### P3 — Future

19. **Phase 2 SSE endpoint** — `GET /events` in http-server.ts; CBP tools in HTTP Map; extension EventSource proxy. Defer until Phase 1 validated.
20. **STORY-199 plugin.json** — markdown distribution; defer until hooks stable + plugin.json format exits Experimental.
21. **Engine bump to ^1.110.0** — after VS Code 1.110 Stable GA (est. April–June 2026).
22. **Node.js hook alternative for Windows** — bash/jq not available; plan TypeScript hook runner.
23. **Extension + mcp-server test infrastructure** — both packages have 0 tests; required before hooks lands.

---

## Section 10: All New DevSteps Items to Create

### Immediate Updates (no code)
- SPIKE-025 → `done`
- TASK-341 → description update
- BUG-059 → scope expansion append

### New Items (ordered by dependency)

| # | Type | Priority | Title | Depends-on |
|---|---|---|---|---|
| A | bug | urgent-important | `fix(extension): getNonce() Math.random() → crypto.randomUUID() [OWASP A02]` | — |
| B | task | urgent-important | `fix(extension): write .devsteps/.mcp-port in McpServerManager.start() [R4 port-discovery]` | BUG-059 |
| C | task | urgent-important | `fix(extension): create utils/debounce.ts + wire BUG-060 (6 refresh calls, 500ms)` | — (IS BUG-060) |
| D | task | not-urgent-important | `feat(shared): create HookEventSchema + extend DispatchEntry (parent_id, event_type) [TASK-339-ext]` | TASK-339 |
| E | task | not-urgent-important | `feat(extension): wire extension→webview postMessage bridge in dashboardPanel.ts` | ITEM D |
| F | task | not-urgent-important | `feat(extension): add 4th FSWatcher for .devsteps/events/*.jsonl [hooks Phase 1]` | BUG-060, ITEM D, ITEM E |
| G | task | urgent-important | `docs: create HOOKS.md — stdin/stdout schema, security, fail-open, Insiders notice` | SPIKE-026 |
| H | story | not-urgent-important | `feat(extension): Spider Web Phase 1 — file-bridge hook visualization [STORY-198 evo]` | BUG-060, BUG-059+, ITEM A, ITEM B, ITEM D, ITEM E, ITEM F, ITEM G |
| I | task | not-urgent-important | `chore(ci): add shellcheck lint + test:hooks bats as hooks PR gate` | ITEM H |
| J | task | urgent-not-important | `fix(lint): resolve 43 Biome auto-fixable errors across CLI + extension` | — |
| K | task | not-urgent-not-important | `fix(mcp-server): add Zod safeParse to add/get/list/update handlers` | — |
| L | story | not-urgent-not-important | `feat(mcp-server): Spider Web Phase 2 — SSE streaming hook events [TASK-340 evo]` | ITEM H, ITEM B |
| M | story | not-urgent-not-important | `feat: DevSteps Agent Plugin distribution — github/awesome-copilot [STORY-199 evo]` | ITEM H, STORY-199 |

### Key Dependency Links to Add
- STORY-198 → depends-on → TASK-339
- STORY-198 → depends-on → BUG-060
- STORY-199 → depends-on → ITEM H (Phase 1 story)
- TASK-341 → relates-to → ITEM H (PreCompact hook pair)
- All hooks stories → depends-on → BUG-060 (debounce must ship first)

---

## Planner Notes for exec-doc

The `exec-doc` agent should structure the final Research Brief in this order:

1. Start with the Executive Summary verdict + GA timeline prominently
2. Section 3 (Hooks Spec) is the most factually dense — cite all 8 events in a table
3. Section 5 (3-Phase Plan) is the most architecturally important — include the data flow diagrams in ASCII
4. Section 6 (Security) should lead with OWASP A02 (getNonce) as "fix this first" since it's Certain/High
5. Section 9 (Recommendations) should use the P0/P1/P2/P3 structure from this document
6. Include the Technology Radar signals table prominently — this is the "verdict" decision-makers need
7. Staleness actions (Section 8) can be brief — they are operational, not research content

**Evidence citations**: All findings in this plan are supported by ≥2 independent analyst results. Use analyst IDs in footnotes: archaeology (e3f28a1c), risk (bb1b941f), quality (b8f3c2d1), research (a4b2c3d4), impact (SPIKE-026/impact-report.json), constraints (5f16f3c5), staleness (SPIKE-026/staleness-report.json), quality-aspect (c1d2e3f4), integration (c9d4e5f6).
