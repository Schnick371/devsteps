# VS Code 1.110 — Agent Debug Panel & Agent APIs Research

**Date:** 2026-03-05  
**Analyst:** devsteps-R1-archaeology, devsteps-R1-risk, devsteps-R2-aspect-constraints, devsteps-R2-aspect-impact  
**Sprint ID:** 2026-03-05  
**Triggered by:** SPIKE-025

---

## Executive Summary

VS Code 1.110 (February 2026) introduces the **Agent Debug Panel** (Preview), **Agent Plugins** (Experimental), context compaction, and background agent slash commands. The Agent Debug Panel is **UI-only with no programmatic extension API** — the user hypothesis about accessing agent execution logs via VS Code API is partially invalidated. The correct path for DevSteps live-tracing is MCP handler instrumentation writing to CBP files.

Agent Plugins represent a significant opportunity: DevSteps already has all required components (`.agent.md`, prompts, hooks, MCP server) — only a `plugin.json` manifest is missing.

---

## 1. Agent Debug Panel — API Status: UI-ONLY

### Official Confirmation
From VS Code 1.110 release notes:
> "Log data is not persisted, so you can only view logs for chat sessions from your current VS Code session."

### API Analysis (R1-archaeology, confidence 0.93)
- **No** `vscode.chat.onDidReceiveMessageFromChat` API
- **No** `AgentDebugSession` or `ChatDebugEvent` types in `vscode.d.ts`
- **No** proposal name in VS Code's public proposal registry for Agent Debug Panel
- `vscode.lm.onDidChangeChatModels` exists but fires only `Event<void>` — no chat payload
- The panel opens via `Developer: Open Agent Debug Panel` command — purely internal channel

### DevSteps Extension API Usage (current)
```typescript
// packages/extension/src/mcpServerManager.ts L167
vscode.lm.registerMcpServerDefinitionProvider('devsteps-mcp', {...})
```
Zero `vscode.chat.*`, zero `chatParticipant`, zero Copilot API dependency. Only the MCP provider registration.

### Correct Integration Path
Instead of waiting for a VS Code API (unknown stabilization timeline), DevSteps should:
1. Instrument MCP tool handlers in `packages/mcp-server/src/` to record `duration_ms`, `parent_id`, `event_type`
2. Write enriched trace entries into CBP MandateResult files (already written per sprint)
3. Visualize via a new "Spider Web" tab in the existing webview dashboard

This achieves equivalent data without any VS Code API dependency.

---

## 2. Agent Plugins — Opportunity

### Format (from official docs)
Agent Plugins are Git repository-based bundles. Discoverable via `@agentPlugins` in Extensions view.

**Configuration:**
- `chat.plugins.marketplaces` — add custom Git repos (shorthand `owner/repo`, HTTPS `.git`, SCP, `file://`)
- `chat.plugins.paths` — register local plugin directories: `{ "/path/to/plugin": true/false }`

**Plugin can contain:**
- Skills (`.agent.md` + SKILL.md pattern)
- Commands (slash commands)
- Custom agents (`.agent.md`)
- Hooks (lifecycle automation)
- MCP servers

### DevSteps Plugin Compatibility
DevSteps ALREADY has all required components:

| Component | DevSteps status |
|--|--|
| Custom agents | ✅ `.github/agents/*.agent.md` (34 agents) |
| Prompt files | ✅ `.github/prompts/*.prompt.md` (19 prompts) |
| Instructions | ✅ `.github/instructions/*.instructions.md` |
| MCP server | ✅ `packages/mcp-server/` |
| Hooks | ✅ `.github/copilot-instructions.md` references hooks |

**Missing:** `plugin.json` manifest (STORY-199)

**Strategic value:** DevSteps would be the first agentic task manager installable via `@agentPlugins`. Estimated 6–10 week competitive lead over LangGraph Studio and Langfuse (both targeting Q2–Q3 2026 VS Code integrations).

**Constraint:** Agent Plugin activation requires Copilot subscription. Mitigation: gate on `vscode.extensions.getExtension('GitHub.copilot') !== undefined`; fall back to MCP-only mode.

---

## 3. Context Compaction Risk for Spider Web

### Feature Description
VS Code 1.110 adds `/compact` slash command for manual compaction (background agents, local agents, Claude agents). Also fires automatically at context window limit.

### Risk for DevSteps Spider Web Dispatch
If `/compact` fires between Spider Web rings, `coord` can lose:
- Active DevSteps item ID
- Outstanding mandate IDs from Ring 1/2
- Current git branch name
- Ring phase marker (which ring just completed)

### Mitigation (TASK-341)
Add `## Compaction Checkpoint` template to `coord-*.agent.md` files that instructs coord to emit a YAML checkpoint block before each ring transition:

```yaml
# compaction-checkpoint
active_item: STORY-XXX
ring_phase: ring-2-complete
pending_mandates: [mandate-id-1, mandate-id-2]
git_branch: story/STORY-XXX
```

On session restore post-compaction, coord reads `mcp_devsteps_get(item_id)` if item ID is known, or scans `.devsteps/cbp/<sprint_id>/` for the last written checkpoint.

---

## 4. FileSystemWatcher Debounce — Performance Fix

### Current State (extension.ts)
Three `FileSystemWatcher` instances with zero debounce, all firing `treeDataProvider.refresh()`:
- L104: watches `.devsteps/**` (broad)
- L160: watches `.devsteps/**/*.json`  
- L238: watches `.devsteps/**/*.json` (possible duplicate pattern)

### Problem
During a DevSteps sprint, atomic writes (`.tmp → rename`) to CBP files generate burst events. At 500ms intervals across 10+ analysts × 3 rings = potential for 60+ rapid `refresh()` calls → visible UI freeze (200-500ms input lag).

### Fix (BUG-060)
```typescript
// packages/extension/src/utils/debounce.ts
export function debounce(fn: () => void, ms: number): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { fn(); timer = null; }, ms);
  };
}
```
Wrap all three watcher callbacks with `debounce(refresh, 500)`.

---

## 5. MandateResult Schema Extension

### Proposed Changes (TASK-339)
Add to `MandateResultSchema` in `packages/shared/src/`:

```typescript
duration_ms: z.number().optional(),          // wall-clock execution time
parent_id: z.string().uuid().optional(),     // originating mandate UUID
event_type: z.enum(['tool_call', 'analysis', 'synthesis']).optional(),
schema_version: z.string().default('1.1'),   // bump from '1.0'
```

### Backward Compatibility
All fields optional → existing CBP files parse cleanly with new schema. No migration required.

### Visualization Capability Unlocked
With these fields, the Spider Web ring timeline (STORY-198) can render:
- Gantt-style ring swimlanes with accurate duration bars
- Per-agent latency waterfall
- Ring hierarchy via `parent_id` traversal
- Animated Sprint Web replay from historical CBP files

---

## 6. Privacy Fix — Immediate

### Finding (BUG-059)
`.devsteps/cbp/` and `.devsteps/analysis/` not excluded from `.gitignore`. In team repos with shared DevSteps, MandateResult `findings` and `recommendations` (security analysis, code paths, dependency risks) are committed.

### Status
**Fixed in this commit** — `.devsteps/cbp/` and `.devsteps/analysis/` added to root `.gitignore`.

### Action for Existing Projects
Add to `.gitignore` manually:
```
.devsteps/cbp/
.devsteps/analysis/
```

Also patch CLI `devsteps init` gitignore template (BUG-059 implementation).

---

## 7. Other VS Code 1.110 Features (Reference)

| Feature | DevSteps impact | Action required |
|--|--|--|
| Background agents + slash commands | DevSteps prompt files work automatically | None |
| `/create-skill`, `/create-agent` | Could template Spider Web workflow extraction | Future spike |
| Session memory for plans | Affects how coord persists sprint state | Coord checkpoint pattern (TASK-341) |
| Fork chat session `/fork` | Useful for experimental Spider Web branches | None |
| Agentic browser tools | No direct DevSteps use today | None |
| Rename/usages tools | Agents get better code nav precision | None (uses tools automatically) |
| Kitty graphics protocol | Terminal-based Spider Web future capability | Future spike |
| `askQuestions` in core | DevSteps does not use `askQuestions` | No change needed |
| `ThemeIcon` for webview tab icons | DevSteps webview panel could use ThemeIcon | Low priority enhancement |
| `env.isAppPortable` stable | No DevSteps use case | None |

---

## Items Created

| ID | Type | Title | Priority |
|--|--|--|--|
| BUG-059 | bug | Privacy P1: cbp/ and analysis/ to .gitignore generation | urgent-important |
| BUG-060 | bug | FSWatcher: 500ms debounce for all refresh() calls | urgent-important |
| TASK-339 | task | Schema: duration_ms, parent_id, event_type to MandateResult Zod | not-urgent-important |
| TASK-340 | task | MCP server: instrument tool handlers for tracing | not-urgent-important |
| STORY-198 | story | Webview: Spider Web ring timeline tab | not-urgent-important |
| STORY-199 | story | Agent Plugin: plugin.json manifest for @agentPlugins | not-urgent-important |
| TASK-341 | task | Coord agents: context compaction checkpoint guard | not-urgent-important |
| SPIKE-025 | spike | Research: VS Code 1.110 agent APIs findings | not-urgent-not-important |

---

## References

- VS Code 1.110 Release Notes: https://code.visualstudio.com/updates/v1_110
- Agent Plugins docs: https://code.visualstudio.com/docs/copilot/customization/agent-plugins
- Heise article: https://www.heise.de/news/Visual-Studio-Code-1-110-erhaelt-neue-Features-fuer-die-KI-Agenten-Konfiguration-11200210.html
- copilot-plugins GitHub: https://github.com/github/copilot-plugins
- awesome-copilot GitHub: https://github.com/github/awesome-copilot/
