## Objective

Create `packages/shared/src/core/relationships.ts` module with exports for all core relationship management functions.

## Foundation Structure

```typescript
import type { RelationType, ItemType, Methodology } from '../schemas';
import { getItem, getCurrentTimestamp } from './index';
import { getBidirectionalRelation } from '../schemas/relationships';

export interface LinkResult {
  success: boolean;
  source_id: string;
  target_id: string;
  relation: RelationType;
  message?: string;
  error?: string;
}

export interface RelatedItem {
  id: string;
  type: ItemType;
  relation: RelationType;
}

export interface TraversalOptions {
  maxDepth?: number;
  relationTypes?: RelationType[];
}

export interface TraversalResult {
  nodes: Map<string, RelatedItem>;
  edges: Array<{ from: string; to: string; type: RelationType }>;
}

// Function stubs (implemented in subsequent tasks)
export async function createLink(...): Promise<LinkResult> {}
export async function removeLink(...): Promise<LinkResult> {}
export async function getRelatedItems(...): Promise<RelatedItem[]> {}
export async function traverseRelationships(...): Promise<TraversalResult> {}
```

## Acceptance Criteria
- [ ] File created at packages/shared/src/core/relationships.ts
- [ ] All 4 function signatures exported
- [ ] TypeScript types for LinkResult, RelatedItem, TraversalOptions defined
- [ ] Imports from shared schemas/core modules
- [ ] Module exports added to packages/shared/src/core/index.ts
- [ ] TypeScript compilation successful