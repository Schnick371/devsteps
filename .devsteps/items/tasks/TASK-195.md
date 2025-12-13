# Migration Script for Existing Items

## Objective

Create CLI command to add ULID fields to existing work items without breaking data.

## Implementation

### 1. Migration Command

```bash
devsteps migrate-ulid [--dry-run] [--backup]
```

```typescript
// packages/cli/src/commands/migrate-ulid.ts
import { ulid } from 'ulid';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export async function migrateUlidCommand(options: {
  dryRun?: boolean;
  backup?: boolean;
}) {
  const devstepsDir = join(process.cwd(), '.devsteps');
  const itemDirs = ['epics', 'stories', 'tasks', 'requirements', 
                    'features', 'bugs', 'spikes', 'tests'];
  
  let migrated = 0;
  let errors = 0;
  
  for (const dir of itemDirs) {
    const dirPath = join(devstepsDir, dir);
    const files = await readdir(dirPath).catch(() => []);
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const filePath = join(dirPath, file);
      const content = await readFile(filePath, 'utf8');
      const item = JSON.parse(content);
      
      // Skip if already has ULID
      if (item.ulid) {
        console.log(`  ✓ ${item.id} already migrated`);
        continue;
      }
      
      // Generate ULID with timestamp from created field
      const createdDate = new Date(item.created);
      const itemUlid = ulid(createdDate.getTime());
      
      // Add new fields
      const migrated Item = {
        ...item,
        ulid: itemUlid,
        modified: item.updated || item.created, // Fallback
        version: 1,
        // Preserve existing data
      };
      
      if (options.dryRun) {
        console.log(`  Would migrate ${item.id} → ${itemUlid}`);
      } else {
        // Backup original
        if (options.backup) {
          await writeFile(
            `${filePath}.backup`,
            content,
            'utf8'
          );
        }
        
        // Write migrated item
        await writeFile(
          filePath,
          JSON.stringify(migratedItem, null, 2),
          'utf8'
        );
        
        console.log(chalk.green(`  ✓ Migrated ${item.id}`));
        migrated++;
      }
    }
  }
  
  // Update index.json
  await rebuildIndex();
  
  console.log(chalk.green(`\nMigration complete: ${migrated} items`));
  if (errors > 0) {
    console.log(chalk.yellow(`⚠ ${errors} errors (see above)`));
  }
}
```

### 2. Validation

```typescript
async function validateMigration() {
  const items = await loadAllItems();
  
  const checks = {
    allHaveUlid: items.every(i => i.ulid),
    uniqueUlids: new Set(items.map(i => i.ulid)).size === items.length,
    validFormat: items.every(i => /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/.test(i.ulid)),
    timestampsMatch: items.every(i => {
      const ulidTime = extractTimestamp(i.ulid);
      const createdTime = new Date(i.created);
      return Math.abs(ulidTime.getTime() - createdTime.getTime()) < 1000; // 1s tolerance
    })
  };
  
  return checks;
}
```

## Usage

```bash
# Preview migration (no changes)
devsteps migrate-ulid --dry-run

# Migrate with backup
devsteps migrate-ulid --backup

# Validate after migration
devsteps doctor --check-ulid
```

## Safety

- [ ] Create backup of `.devsteps/` before migration
- [ ] Dry-run shows changes without applying
- [ ] ULID timestamp matches original `created` field
- [ ] All ULIDs are unique
- [ ] Rollback possible via backup files
- [ ] Index.json updated after migration

## Validation

- [ ] All items have ULID after migration
- [ ] No duplicate ULIDs
- [ ] ULID format valid (26 chars Base32)
- [ ] Created/modified timestamps preserved
- [ ] No data loss (all fields intact)

## Dependencies

- Requires TASK-192 (schema update) completed first