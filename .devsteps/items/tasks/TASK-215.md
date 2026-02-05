## Objective

Implement `removeLink()` function with atomic bidirectional relationship removal based on industry best practices (Neo4j, JSON Patch, MongoDB).

## Implementation Details

### Function Signature
```typescript
export async function removeLink(
  devstepsDir: string,
  sourceId: string,
  targetId: string,
  relationType: RelationType
): Promise<LinkResult>
```

### Algorithm (Atomic Bidirectional Removal)

1. **Validate Items Exist**
   ```typescript
   const { metadata: sourceMeta } = await getItem(devstepsDir, sourceId);
   const { metadata: targetMeta } = await getItem(devstepsDir, targetId);
   ```

2. **Check Link Exists (Idempotent)**
   ```typescript
   if (!sourceMeta.linked_items[relationType].includes(targetId)) {
     return { success: true, message: 'Link already removed' };
   }
   ```

3. **Remove from Source**
   ```typescript
   sourceMeta.linked_items[relationType] = 
     sourceMeta.linked_items[relationType].filter(id => id !== targetId);
   ```

4. **Resolve Inverse & Remove from Target**
   ```typescript
   const inverseType = getBidirectionalRelation(relationType);
   targetMeta.linked_items[inverseType] = 
     targetMeta.linked_items[inverseType].filter(id => id !== sourceId);
   ```

5. **Update Timestamps & Write**
   ```typescript
   const timestamp = getCurrentTimestamp();
   sourceMeta.updated = timestamp;
   targetMeta.updated = timestamp;
   
   writeFileSync(sourcePath, JSON.stringify(sourceMeta, null, 2));
   writeFileSync(targetPath, JSON.stringify(targetMeta, null, 2));
   ```

### Error Handling
- Item not found → Throw with clear message
- File write errors → Preserve original state
- Invalid relationship type → getBidirectionalRelation handles

### Research-Based Design Decisions

**From Neo4j:** Single operation removes relationship (no separate inverse DELETE)
**From JSON Patch:** Atomic all-or-nothing (both files updated or neither)
**From MongoDB:** Value-based removal (filter by ID, not array index)

## Acceptance Criteria
- [ ] removeLink() function implementation complete
- [ ] Bidirectional removal (source + target updated)
- [ ] Idempotent (removing non-existent link succeeds)
- [ ] Atomic (both files updated or neither)
- [ ] Timestamps updated on both items
- [ ] Error handling for missing items
- [ ] Returns LinkResult with success/error
- [ ] Unit tests: happy path, missing items, non-existent link
- [ ] Integration test: verify bidirectional removal