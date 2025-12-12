# Multi-Agent Collaboration Support

## Problem Statement

DevSteps currently uses counter-based IDs (TASK-001, STORY-002) which creates conflicts when multiple agents or developers work in parallel branches:

**Conflict Scenario:**
```
Branch A (Agent 1): Creates TASK-001 "Implement auth" at 10:00
Branch B (Agent 2): Creates TASK-001 "Implement auth" at 10:05
→ Git merge conflict when both branches merge to main
```

**Root Cause:** Counter-based IDs are not merge-safe in distributed, offline-first workflows.

## Solution: ULID-Based Identification

**ULID = Universally Unique Lexicographically Sortable Identifier**

### Benefits (Research 2025)

Based on production deployments (Shopify, distributed systems):

- ✅ **Client-side generation** (no central coordination)
- ✅ **Timestamp-sortable** (first 48 bits = milliseconds)
- ✅ **Collision-proof** (128-bit like UUID, but sortable)
- ✅ **Compact** (26 chars Base32 vs UUID 36 chars)
- ✅ **Git-friendly** (merge conflicts auto-resolvable)

### Architecture

**Hybrid System:**
```json
{
  "id": "TASK-001",           // Human-readable (Display, Git commits)
  "ulid": "01EQXGPFY8...",    // Unique identifier (Conflict resolution)
  "created": "2025-12-12T10:00:00Z",
  "modified": "2025-12-12T10:05:00Z",  // Last-Write-Wins
  "version": 3                          // Vector clock
}
```

**Conflict Resolution:**
- Same ULID → LWW (Last-Write-Wins) by `modified` timestamp
- Different ULIDs, same ID → Auto-remap newer item to next available ID

## Scope

- Add ULID field to all item schemas
- Implement LWW-based merge conflict resolver
- Build migration script for existing items
- Update documentation and best practices

## Success Criteria

- ✅ Multiple agents can create items in parallel branches
- ✅ Git merges resolve automatically (no manual intervention)
- ✅ Audit trail preserved (ULID encodes creation timestamp)
- ✅ Offline-first remains (no server dependency)

## References

- Shopify ULID adoption blueprint
- CRDT principles (LWW-Register)
- Multi-agent coordination patterns