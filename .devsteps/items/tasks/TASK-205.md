# Solution

Update `WorkItem` interface to properly reflect both source data (`eisenhower`) and computed field (`priority`).

## Implementation

In `packages/extension/src/treeView/types.ts`:

```typescript
export interface WorkItem {
  id: string;
  type: string;
  title: string;
  status: string;
  eisenhower: string;  // Source data: urgent-important, not-urgent-important, etc.
  priority: string;    // Computed: critical, high, medium, low
  created?: string;
  updated?: string;
  tags?: string[];
  linked_items?: {
    'implemented-by'?: string[];
    'blocks'?: string[];
    'blocked-by'?: string[];
    'relates-to'?: string[];
    'tested-by'?: string[];
    'required-by'?: string[];
  };
}
```

## Files Modified

- `packages/extension/src/treeView/types.ts`

## Acceptance Criteria

- Interface has both `eisenhower` and `priority` fields
- TypeScript compilation passes
- No breaking changes to existing code
