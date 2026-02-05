## Objective

Create MCP handler and tool registration for removing relationships between items using shared `removeLink()` function.

## Handler Structure (handlers/unlink.ts)

```typescript
import { removeLink } from '@devsteps/shared/core/relationships';
import { parseItemId } from '@devsteps/shared';
import { logger } from '../logger';

interface UnlinkArgs {
  source_id: string;
  relation_type: string;
  target_id: string;
}

export async function handleUnlink(devstepsDir: string, args: UnlinkArgs) {
  logger.info('Unlink request', args);
  
  const result = await removeLink(
    devstepsDir,
    args.source_id,
    args.target_id,
    args.relation_type as RelationType
  );
  
  if (!result.success) {
    logger.error('Unlink failed', { error: result.error });
  }
  
  return result;
}
```

## MCP Tool Definition (tools/unlink.ts)

```typescript
export const unlinkTool = {
  name: 'devsteps_unlink',
  description: 'Remove a relationship between two items. Atomically removes both source→target and target→source links. Idempotent (safe to call even if link does not exist).',
  inputSchema: {
    type: 'object',
    properties: {
      source_id: {
        type: 'string',
        description: 'Source item ID (e.g., STORY-042, EPIC-012)'
      },
      relation_type: {
        type: 'string',
        description: 'Relationship type to remove',
        enum: VALID_RELATION_TYPES
      },
      target_id: {
        type: 'string',
        description: 'Target item ID to unlink from source'
      }
    },
    required: ['source_id', 'relation_type', 'target_id']
  }
};
```

## Integration

Update `tools/index.ts`:
```typescript
export { unlinkTool } from './unlink';
```

Update server router to register handler.

## Acceptance Criteria
- [ ] handlers/unlink.ts created with handleUnlink()
- [ ] tools/unlink.ts created with unlinkTool definition
- [ ] unlinkTool exported in tools/index.ts
- [ ] Handler registered in MCP server router
- [ ] Calls shared removeLink() function
- [ ] Returns { success, source_id, target_id, relation, message? }
- [ ] Logs errors with logger
- [ ] Schema validation enforces required parameters
- [ ] Unit tests: valid unlink, invalid IDs, non-existent link
- [ ] Integration test: MCP protocol request/response