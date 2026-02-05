## Objective

Create CLI `unlink` command for removing relationships via terminal. Mirrors existing `link` command structure.

## Command Structure

```typescript
import { removeLink } from '@devsteps/shared/core/relationships';
import { findDevstepsRoot, VALID_RELATION_TYPES } from '@devsteps/shared';
import { program } from 'commander';

export function registerUnlinkCommand(cli: typeof program) {
  cli
    .command('unlink')
    .description('Remove a relationship between two items')
    .argument('<source-id>', 'Source item ID (e.g., STORY-042)')
    .argument('<relation>', `Relationship type (${VALID_RELATION_TYPES.join(', ')})`)
    .argument('<target-id>', 'Target item ID to unlink')
    .action(async (sourceId: string, relation: string, targetId: string) => {
      try {
        const devstepsDir = await findDevstepsRoot();
        
        const result = await removeLink(
          devstepsDir,
          sourceId,
          targetId,
          relation as RelationType
        );

        if (result.success) {
          console.log(`✅ ${result.message}`);
          console.log(`   ${sourceId} -/- ${relation} -/- ${targetId}`);
        } else {
          console.error(`❌ ${result.error}`);
          if (result.suggestion) {
            console.error(`💡 ${result.suggestion}`);
          }
          process.exit(1);
        }
      } catch (error) {
        console.error('Failed to unlink items:', error.message);
        process.exit(1);
      }
    });
}
```

## Usage Examples

```bash
# Remove story→task relationship
devsteps unlink STORY-042 implements TASK-216

# Remove dependency
devsteps unlink TASK-215 depends-on TASK-214

# Remove bug→story blocking relationship
devsteps unlink BUG-023 blocks STORY-039
```

## Acceptance Criteria
- [ ] commands/unlink.ts created with registerUnlinkCommand()
- [ ] Command registered in commands/index.ts
- [ ] Accepts 3 positional args: source-id, relation, target-id
- [ ] Calls shared removeLink() function
- [ ] Success: Prints checkmark message with relationship notation
- [ ] Error: Prints error + suggestion, exits with code 1
- [ ] Validates devsteps root exists (findDevstepsRoot())
- [ ] Unit tests: CLI arg parsing, error handling
- [ ] Integration test (BATS): unlink existing link, idempotent repeat
- [ ] Help text: `devsteps unlink --help` shows usage