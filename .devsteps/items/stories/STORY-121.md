# Layered AI Context Auto-Delivery

## Problem

New AI chat sessions (GitHub Copilot, Claude Code, Cursor) start with zero project knowledge.
Developers must repeatedly paste context, explain the monorepo structure, and re-onboard every agent.
This is slow, error-prone, and breaks flow.

## Research Findings (Bright Data — 7 sources, 2025-08)

- **Industry standard:** CLAUDE.md, AGENTS.md, `.cursorrules` are auto-loaded by their respective AI clients.
  The pattern is universal: put context in a predictable file, clients load it automatically.
- **MCP Prompts:** Official 2025-06-18 spec — servers expose named prompt templates.
  VS Code Copilot renders these as slash commands (`/devsteps/onboard`).
  Claude Code and Cursor also support MCP prompts.
- **MCP Resources:** High-priority resources (`annotations.priority: 1.0`) can be auto-fetched by clients.
  `devsteps://project-context` resource can carry the full PROJECT.md inline.
- **`.github/copilot-instructions.md`:** Auto-included in every VS Code Copilot conversation.
  Ideal place to instruct agents to call `devsteps_context` at session start.

## Solution: 4-Layer Onboarding Stack

| Layer | Mechanism | Latency | User Effort |
|---|---|---|---|
| 1 (passive) | `copilot-instructions.md` → calls `devsteps_context` | 0ms | None |
| 2 (pull) | MCP resource `devsteps://project-context` priority=1.0 | 1 tool call | None |
| 3 (slash cmd) | MCP prompt `devsteps/onboard` | 1 click | Minimal |
| 4 (deep) | `devsteps_context(level: 'standard')` | 1 call | Minimal |

## Acceptance Criteria

- [ ] New chat sessions with VS Code Copilot automatically receive project context via `copilot-instructions.md`
- [ ] `devsteps context generate` CLI command creates/updates `.devsteps/PROJECT.md` from live project state
- [ ] MCP server exposes `prompts` capability with `devsteps/onboard` named prompt embedding live context
- [ ] MCP resource `devsteps://project-context` available with `priority: 1.0` for auto-fetch clients
- [ ] `devsteps_context(level: 'standard')` returns extended context (open items, recent changes, tech stack)
- [ ] Context response includes `generated_at`, `age_hours` and `is_stale` (>24h) metadata
- [ ] `.github/copilot-instructions.md` reflects the actual monorepo tech stack (no NestJS/Next.js/Prisma fiction)