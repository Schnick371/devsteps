# Relationship Management Architecture

## Overview

DevSteps stores relationships bidirectionally in item metadata JSON files. Every link operation writes to both the source item (`linked_items[relationType]`) and the target item (`linked_items[inverseRelationType]`), so reverse lookups are O(1) without graph traversal.

## Design Decisions

### Bidirectional Storage

Each item's `linked_items` map stores all relationships from that item's perspective. When STORY-001 `implements` EPIC-001, both items are updated:

```
STORY-001.json  →  linked_items.implements:      ["EPIC-001"]
EPIC-001.json   →  linked_items.implemented-by:  ["STORY-001"]
```

**Trade-off:** 2× storage for O(1) reverse lookup. Acceptable because item files are small.

### Idempotent Operations

Both `linkItems()` and `unlinkItem()` are idempotent:
- `linkItems()` — no duplicate IDs added to arrays
- `unlinkItem()` — returns success even if the relation is not present

This makes them safe to retry without side effects.

### Inverse Relation Map

`unlinkItem()` uses a static inverse map (`INVERSE_RELATIONS` in `core/unlink.ts`) to resolve which relation to remove from the target item:

| Source relation | Target inverse |
|---|---|
| `implements` | `implemented-by` |
| `implemented-by` | `implements` |
| `tested-by` | `tests` |
| `tests` | `tested-by` |
| `blocks` | `blocked-by` |
| `blocked-by` | `blocks` |
| `depends-on` | `required-by` |
| `required-by` | `depends-on` |
| `relates-to` | `relates-to` |
| `supersedes` | `superseded-by` |
| `superseded-by` | `supersedes` |

### Methodology Hierarchy Rules

The `linkItems()` function enforces hierarchy constraints at creation time (not on reads). The `unlinkItem()` function performs no hierarchy validation — any existing link can be removed.

## API Surface

### Shared Core (`@schnick371/devsteps-shared`)

```typescript
// Create a bidirectional link
await linkItems(devstepsDir, { sourceId, relationType, targetId });

// Remove a bidirectional link (idempotent)
await unlinkItem(devstepsDir, { sourceId, relationType, targetId });
// Returns: { success, message, sourceId, targetId, relation }
```

### MCP Tools

| Tool | Description |
|---|---|
| `mcp_devsteps_link` | Create relationship |
| `mcp_devsteps_unlink` | Remove relationship |
| `mcp_devsteps_trace` | Show full traceability tree |

### CLI Commands

```bash
devsteps link <source-id> <relation> <target-id>
devsteps unlink <source-id> <relation> <target-id>
devsteps trace <id>
```

## Future Considerations

- Relationship validation on read (detect orphaned refs after direct file edits)
- Event sourcing for full relationship audit trail
- Cascade archival (archive dependent tasks when parent story is archived)
