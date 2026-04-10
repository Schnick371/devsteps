## Context

38 MCP handlers must currently be registered **twice**: once in `server.ts` (StdIO transport) and once in `http-server.ts` (HTTP transport). Every new handler requires two touch points, creating structural duplication and a maintenance burden.

## Current Problem

```
server.ts (~338 lines)     http-server.ts (~403 lines)
├── import handler-A        ├── import handler-A
├── import handler-B        ├── import handler-B
├── ...38 handlers...       ├── ...38 handlers...
└── register all            └── register all
```
Total: **741 lines** of structural duplication. Adding handler-39 = 2 file edits minimum.

## Target Architecture

```
handler-registry.ts   ← single source of truth
├── auto-discover handlers from directory
└── export: registerAll(server | router)

server.ts (<80 lines)         http-server.ts (<80 lines)
└── import + registerAll()    └── import + registerAll()
```

## Acceptance Criteria

- `handler-registry.ts` registers all handlers from a directory scan or explicit map
- `server.ts` ≤80 lines, `http-server.ts` ≤80 lines post-refactor
- Adding a new handler = 1 file only (the handler itself)
- All existing handler tests pass
- Build/bundle output unchanged

## Ishikawa Source

Structure bone 🟡 MEDIUM — dual registration anti-pattern.