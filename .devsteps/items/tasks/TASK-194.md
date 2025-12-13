# Build LWW-Based Conflict Resolver

## Objective

Implement Last-Write-Wins (LWW) conflict resolution using ULID and `modified` timestamps.

## Implementation

### 1. Create Merge Resolver Module

```typescript
// packages/shared/src/core/merge-resolver.ts
import type { DevStepsItem } from '../types';

export interface ConflictResolution {
  kept: DevStepsItem;
  remapped?: DevStepsItem;
  strategy: 'lww' | 'id-collision-remap';
  reason: string;
}

/**
 * Resolve conflicts between two items during git merge
 * 
 * Strategy:
 * 1. Same ULID → LWW by modified timestamp
 * 2. Different ULIDs, same ID → Remap newer item
 */
export function resolveConflict(
  itemA: DevStepsItem,
  itemB: DevStepsItem,
  getNextAvailableId: (type: string) => string
): ConflictResolution {
  // Case 1: Same item (same ULID) → LWW
  if (itemA.ulid === itemB.ulid) {
    const winner = new Date(itemA.modified) > new Date(itemB.modified) 
      ? itemA 
      : itemB;
    
    return {
      kept: winner,
      strategy: 'lww',
      reason: `Last-Write-Wins: ${winner.modified} (version ${winner.version})`
    };
  }
  
  // Case 2: ID collision (different ULIDs, same ID)
  if (itemA.id === itemB.id && itemA.ulid !== itemB.ulid) {
    // Older ULID (earlier creation) keeps ID
    const [older, newer] = itemA.ulid < itemB.ulid 
      ? [itemA, itemB] 
      : [itemB, itemA];
    
    // Newer item gets remapped ID
    const remappedId = getNextAvailableId(newer.type);
    const remapped = {
      ...newer,
      id: remappedId,
      modified: new Date().toISOString(),
      version: newer.version + 1,
      metadata: {
        ...newer.metadata,
        _remapped_from: newer.id,
        _remapped_at: new Date().toISOString(),
        _remapped_reason: 'ID collision during merge'
      }
    };
    
    return {
      kept: older,
      remapped,
      strategy: 'id-collision-remap',
      reason: `ID collision: ${newer.id} → ${remappedId} (ULID ${newer.ulid})`
    };
  }
  
  // Case 3: No conflict (different IDs, different ULIDs)
  throw new Error('No conflict detected - should not call resolver');
}
```

### 2. Add Git Hook Integration (Optional)

```bash
# .git/hooks/post-merge
#!/bin/bash
# Run conflict resolver after merge
node packages/cli/dist/resolve-conflicts.js
```

### 3. CLI Command for Manual Resolution

```typescript
// packages/cli/src/commands/resolve-conflicts.ts
export async function resolveConflictsCommand() {
  const conflicts = await detectConflicts();
  
  for (const conflict of conflicts) {
    const resolution = resolveConflict(
      conflict.itemA,
      conflict.itemB,
      getNextAvailableId
    );
    
    console.log(chalk.yellow('Conflict resolved:'));
    console.log(`  Strategy: ${resolution.strategy}`);
    console.log(`  Reason: ${resolution.reason}`);
    
    await applyResolution(resolution);
  }
}
```

## Validation

- [ ] Same ULID, different modified → Winner has latest timestamp
- [ ] ID collision → Older ULID keeps ID, newer gets remapped
- [ ] Remapped item metadata tracks original ID
- [ ] No data loss during conflict resolution
- [ ] Audit trail preserved in metadata

## Testing

```typescript
describe('Conflict Resolution', () => {
  it('resolves LWW for same ULID', () => {
    const itemA = { ulid: '01EQX...', modified: '2025-12-12T10:00:00Z' };
    const itemB = { ulid: '01EQX...', modified: '2025-12-12T11:00:00Z' };
    
    const result = resolveConflict(itemA, itemB, getNextId);
    expect(result.kept).toBe(itemB); // Later timestamp wins
  });
  
  it('remaps ID collision', () => {
    const itemA = { id: 'TASK-001', ulid: '01EQX...' }; // Earlier
    const itemB = { id: 'TASK-001', ulid: '01EQY...' }; // Later
    
    const result = resolveConflict(itemA, itemB, () => 'TASK-002');
    expect(result.kept.id).toBe('TASK-001');
    expect(result.remapped?.id).toBe('TASK-002');
  });
});
```

## Dependencies

- Requires TASK-192 (schema) and TASK-193 (generation) completed