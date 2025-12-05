# Remove Project-Specific Migration Scripts

## Problem
Migration scripts in `packages/shared/src/migration/` are project-specific, not general-purpose:
- `remove-priority-field.ts` - hardcoded paths to THIS project's .devsteps
- `fix-missing-eisenhower.ts` - hardcoded list of 32 specific files

**Risk:** These will fail or corrupt data if run on other DevSteps projects.

## Solution Options

### Option 1: Remove Migration Scripts (RECOMMENDED)
- Delete `packages/shared/src/migration/` directory
- Migrations were one-time for STORY-064
- Already executed successfully
- No longer needed

### Option 2: Make Generic (IF migrations needed for users)
- Detect .devsteps directory dynamically
- Scan all JSON files automatically
- Add safety checks (backup, dry-run)
- Document in migration guide
- Add CLI command: `devsteps migrate <migration-name>`

## Recommendation
**Option 1 (Remove)** because:
- ✅ Migrations already complete
- ✅ Removes maintenance burden
- ✅ Prevents accidental misuse
- ✅ Cleaner package structure

Future migrations should be:
- Documented in CHANGELOG
- Provided as CLI commands if needed
- Include safety mechanisms (backup, dry-run, confirmation)

## Changes Required
```bash
rm -rf packages/shared/src/migration/
```

## Success Criteria
- Migration directory removed
- No references in code
- Package builds successfully
- No migration scripts in distribution
