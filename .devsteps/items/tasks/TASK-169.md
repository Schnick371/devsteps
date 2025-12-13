## Task (Optional)

Create bulk migration tool to rename existing 3-digit items to 4-digit format for consistency. This is **optional** - existing items remain functional with 3-digit IDs.

## Use Case

Teams wanting uniform 4-digit format across all items (e.g., TASK-001 → TASK-0001).

## Implementation

**File:** `packages/cli/src/commands/bulk.ts` (new `migrate-ids` command)

**Functionality:**
1. Read all items from index.json
2. For each item with 3-digit ID (001-999):
   - Generate new 4-digit ID (0001-0999)
   - Rename JSON file (e.g., TASK-001.json → TASK-0001.json)
   - Rename MD file (e.g., TASK-001.md → TASK-0001.md)
   - Update all linked_items references in other items
   - Update index.json entries
3. Preserve all metadata, timestamps, and relationships
4. Create backup before migration (.devsteps.backup/)

**Command:**
```bash
devsteps bulk migrate-ids --dry-run  # Preview changes
devsteps bulk migrate-ids --execute  # Perform migration
```

## Safety Features

- `--dry-run` flag (default): Show changes without applying
- Backup creation before execution
- Validation: Check all links updated correctly
- Rollback: Restore from backup if issues detected

## Dependencies

- Depends on: TASK-167, TASK-168 (schema and generation must support 4 digits first)

## Priority

Low - Optional enhancement. System works with mixed 3/4 digit IDs.

## Acceptance Criteria

- Dry-run shows all affected items and changes
- Migration renames all 3-digit IDs to 4-digit format
- All relationships preserved and updated
- Backup created before execution
- Validation confirms no broken links
- Rollback mechanism available