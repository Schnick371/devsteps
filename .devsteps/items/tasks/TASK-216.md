## Objective

Extract existing link creation logic from `packages/mcp-server/src/handlers/link.ts` into reusable `createLink()` function in shared package.

## Current Implementation (link.ts ~120 LOC)

The handler currently:
1. Validates IDs with parseItemId()
2. Loads both items from filesystem
3. Loads project config for methodology
4. Validates relationship with validateRelationship()
5. Updates source item's linked_items array
6. Creates inverse relationship in target item
7. Writes both files with updated timestamps

## Refactored Implementation

```typescript
export async function createLink(
  devstepsDir: string,
  sourceId: string,
  targetId: string,
  relationType: RelationType
): Promise<LinkResult> {
  // 1. Validate & load items
  const sourceParsed = parseItemId(sourceId);
  const targetParsed = parseItemId(targetId);
  if (!sourceParsed || !targetParsed) {
    throw new Error('Invalid item ID(s)');
  }

  const { metadata: sourceMeta } = await getItem(devstepsDir, sourceId);
  const { metadata: targetMeta } = await getItem(devstepsDir, targetId);

  // 2. Validate relationship rules
  const config = await getConfig(devstepsDir);
  const methodology = config.settings?.methodology || 'hybrid';
  
  const validation = validateRelationship(
    { id: sourceId, type: sourceMeta.type },
    { id: targetId, type: targetMeta.type },
    relationType,
    methodology
  );
  
  if (!validation.valid) {
    return {
      success: false,
      source_id: sourceId,
      target_id: targetId,
      relation: relationType,
      error: validation.error,
      suggestion: validation.suggestion
    };
  }

  // 3. Add to source (if not already present)
  if (!sourceMeta.linked_items[relationType].includes(targetId)) {
    sourceMeta.linked_items[relationType].push(targetId);
    sourceMeta.updated = getCurrentTimestamp();
  }

  // 4. Add inverse to target
  const inverseType = getBidirectionalRelation(relationType);
  if (!targetMeta.linked_items[inverseType].includes(sourceId)) {
    targetMeta.linked_items[inverseType].push(sourceId);
    targetMeta.updated = getCurrentTimestamp();
  }

  // 5. Write both files
  const sourceFolder = TYPE_TO_DIRECTORY[sourceParsed.type];
  const targetFolder = TYPE_TO_DIRECTORY[targetParsed.type];
  const sourcePath = join(devstepsDir, sourceFolder, `${sourceId}.json`);
  const targetPath = join(devstepsDir, targetFolder, `${targetId}.json`);
  
  writeFileSync(sourcePath, JSON.stringify(sourceMeta, null, 2));
  writeFileSync(targetPath, JSON.stringify(targetMeta, null, 2));

  return {
    success: true,
    source_id: sourceId,
    target_id: targetId,
    relation: relationType,
    message: `Linked ${sourceId} --${relationType}--> ${targetId}`
  };
}
```

## Benefits
- ✅ Reusable across CLI, MCP, Extension
- ✅ Single source of truth for link creation logic
- ✅ Easier to test (pure function)
- ✅ Handler reduces from 120 LOC → <30 LOC

## Acceptance Criteria
- [ ] createLink() function implemented
- [ ] All validation logic preserved (parseItemId, validateRelationship)
- [ ] Bidirectional link creation (source + inverse)
- [ ] Idempotent (duplicate links don't error)
- [ ] Timestamps updated on both items
- [ ] Returns LinkResult with validation errors
- [ ] Unit tests: valid links, invalid IDs, methodology violations
- [ ] Integration test: verify bidirectional creation