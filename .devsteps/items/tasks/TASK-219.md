## Objective

Refactor `packages/mcp-server/src/handlers/link.ts` to use shared `createLink()` function, reducing from ~120 LOC to <30 LOC.

## Current State
handler directly implements:
- ID validation
- Item loading
- Relationship validation
- Bidirectional link creation
- File writing

Total: ~120 lines of duplicated logic

## Target Implementation

```typescript
import { createLink } from '@devsteps/shared/core/relationships';
import { logger } from '../logger';

interface LinkArgs {
  source_id: string;
  relation_type: string;
  target_id: string;
}

export async function handleLink(devstepsDir: string, args: LinkArgs) {
  logger.info('Link request', args);
  
  const result = await createLink(
    devstepsDir,
    args.source_id,
    args.target_id,
    args.relation_type as RelationType
  );
  
  if (!result.success) {
    logger.error('Link creation failed', { error: result.error, suggestion: result.suggestion });
  }
  
  return result;
}
```

Target: ~25 lines (95 LOC reduction)

## Benefits
- ✅ DRY: Single source of truth for link creation
- ✅ Maintainability: Bug fixes in one place
- ✅ Testability: Handler tests can focus on MCP protocol
- ✅ Consistency: CLI/MCP/Extension use same logic

## Dependencies
**MUST complete TASK-216 first** (createLink() implementation)

## Acceptance Criteria
- [ ] link.ts refactored to use createLink() from shared
- [ ] Function signature unchanged (handleLink remains compatible)
- [ ] All validation logic moved to shared createLink()
- [ ] Handler reduced to ~25-30 LOC (logging + delegation)
- [ ] Existing tests still pass (behavior unchanged)
- [ ] No regression in error messages or validation
- [ ] Performance unchanged (same number of file operations)