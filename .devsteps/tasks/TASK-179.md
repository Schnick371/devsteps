## Problem

`TYPE_TO_DIRECTORY` mapping defined **3x** in codebase:

1. **packages/shared/src/utils/index.ts** (line 13):
   ```ts
   export const TYPE_TO_DIRECTORY: Record<ItemType, string> = {
     epic: 'epics', story: 'stories', ...
   };
   ```

2. **packages/extension/src/treeView/types.ts** (line 16):
   ```ts
   export const TYPE_TO_DIRECTORY: Record<string, string> = {
     epic: 'epics', story: 'stories', ...
   };
   ```

3. **packages/shared/src/utils/index.ts** - `getMethodologyConfig()`:
   ```ts
   directories: ['epics', 'stories', 'requirements', 'features', 'tasks', 'bugs', 'spikes', 'tests']
   ```

**Also:** Item prefixes defined **2x**:
- `generateItemId()` defaultPrefixes
- `getMethodologyConfig()` item_prefixes

## Root Cause

No single source of truth for type→directory and type→prefix mappings.

## Solution

### 1. Create centralized config in shared

```typescript
// packages/shared/src/schemas/itemTypes.ts (NEW FILE)
import { ItemType } from './index.js';

export const ITEM_TYPE_CONFIG = {
  epic: { directory: 'epics', prefix: 'EPIC' },
  story: { directory: 'stories', prefix: 'STORY' },
  task: { directory: 'tasks', prefix: 'TASK' },
  requirement: { directory: 'requirements', prefix: 'REQ' },
  feature: { directory: 'features', prefix: 'FEAT' },
  bug: { directory: 'bugs', prefix: 'BUG' },
  spike: { directory: 'spikes', prefix: 'SPIKE' },
  test: { directory: 'tests', prefix: 'TEST' },
} as const satisfies Record<ItemType, { directory: string; prefix: string }>;

// Helper functions
export function getDirectoryForType(type: ItemType): string {
  return ITEM_TYPE_CONFIG[type].directory;
}

export function getPrefixForType(type: ItemType): string {
  return ITEM_TYPE_CONFIG[type].prefix;
}

export function getAllDirectories(): string[] {
  return Object.values(ITEM_TYPE_CONFIG).map(c => c.directory);
}

export function getAllPrefixes(): Record<ItemType, string> {
  return Object.fromEntries(
    Object.entries(ITEM_TYPE_CONFIG).map(([type, config]) => [type, config.prefix])
  ) as Record<ItemType, string>;
}
```

### 2. Update shared/utils/index.ts

```typescript
import { ITEM_TYPE_CONFIG, getDirectoryForType, getAllPrefixes } from '../schemas/itemTypes.js';

// Deprecated - use getDirectoryForType() instead
export const TYPE_TO_DIRECTORY = Object.fromEntries(
  Object.entries(ITEM_TYPE_CONFIG).map(([type, config]) => [type, config.directory])
) as Record<ItemType, string>;

export function generateItemId(type: string, counter: number, prefixes?: Record<string, string>) {
  const prefixMap = prefixes || getAllPrefixes();
  // ...
}

export function getMethodologyConfig(methodology: Methodology) {
  const directories = getAllDirectories();
  const item_prefixes = getAllPrefixes();
  // Use these instead of hardcoded arrays
}
```

### 3. Update extension types

```typescript
// packages/extension/src/treeView/types.ts
import { TYPE_TO_DIRECTORY } from '@schnick371/devsteps-shared';

// Remove local definition, import from shared
export { TYPE_TO_DIRECTORY };
```

### 4. Export from shared index

```typescript
// packages/shared/src/schemas/index.ts
export * from './itemTypes.js';
export { ITEM_TYPE_CONFIG, getDirectoryForType, getPrefixForType };
```

## Benefits

- ✅ Single source of truth
- ✅ Add new item type → auto-updates everywhere
- ✅ Type-safe (satisfies Record<ItemType, ...>)
- ✅ No sync issues between packages

## Testing

1. Build all packages
2. Verify CLI ID generation works
3. Test extension TreeView type filtering
4. Verify MCP Server file operations
5. Check getMethodologyConfig() returns correct values

## Dependencies

- None (standalone refactoring)