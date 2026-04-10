## Context

`McpServerManager` is a **583-line God-class** mixing 5 distinct responsibilities. This violates the Single Responsibility Principle and makes testing, extension, and maintenance difficult.

## Current Concerns (single class)

1. **Lifecycle** — start/stop/restart server process
2. **Restart logic** — cooldown timers, auto-restart policy
3. **Config resolution** — read workspace settings, find server binary, resolve env vars
4. **StatusBar updates** — update VS Code status bar icon and tooltip text
5. **Error UI** — show error notifications, diagnostic messages to user

## Target Architecture

| New Class | Lines (est.) | Responsibility |
|---|---|---|
| `McpLifecycleManager` | ~200 | Process control: spawn, kill, monitor |
| `McpConfigResolver` | ~120 | Read settings, resolve binary paths, validate env |
| `McpStatusBarController` | ~80 | Status bar icon, tooltip, show/hide |

`McpServerManager` becomes a **thin orchestrator** (~80 lines) delegating to the 3 new classes.

## Acceptance Criteria

- Each new class has unit tests (currently none)
- `McpServerManager` ≤120 lines post-refactor
- Public API unchanged (no extension activation breakage)
- All existing extension test suite passes

## Ishikawa Source

Structure bone 🟡 MEDIUM + Code bone 🔴 HIGH (God-class pattern).