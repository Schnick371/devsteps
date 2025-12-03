## Objective

Remove `affects/affected-by` from RELATION_TYPES array and LinkedItems schema.

## Changes

**File: packages/shared/src/schemas/index.ts**

**Remove from RELATION_TYPES array (lines ~75-79):**
```typescript
export const RELATION_TYPES = [
  // ... existing
  'blocks',
  'blocked-by',
  // REMOVE: 'affects', 'affected-by',
  'relates-to',
  // ...
] as const;
```

**Remove from LinkedItems Zod schema (lines ~96-100):**
```typescript
export const LinkedItemsSchema = z.object({
  // ... existing
  blocks: z.array(z.string()),
  'blocked-by': z.array(z.string()),
  // REMOVE: affects: z.array(z.string()),
  // REMOVE: 'affected-by': z.array(z.string()),
  'relates-to': z.array(z.string()),
  // ...
});
```

**Remove from DEFAULT_LINKED_ITEMS (lines ~111-114):**
```typescript
export const DEFAULT_LINKED_ITEMS: LinkedItems = {
  // ... existing
  blocks: [],
  'blocked-by': [],
  // REMOVE: affects: [],
  // REMOVE: 'affected-by': [],
  'relates-to': [],
  // ...
};
```

## Validation

- Run `npm run build`
- Verify no TypeScript errors
- Check `RelationType` excludes 'affects'