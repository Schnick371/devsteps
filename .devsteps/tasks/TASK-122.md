## Objective

Remove `affects/affected-by` from CLI commands and descriptions.

## Implementation Complete ✅

**Changes Made:**

**File: packages/cli/src/index.ts**
- Updated link command description: Removed "affects" from FLEXIBLE list (line ~91)
- Updated argument description: Removed "affects" from relation type list (line ~93)

**File: packages/cli/src/commands/index.ts**
- Removed `affects: 'affected-by'` and `'affected-by': 'affects'` from inverseRelations mapping (lines ~437-438)

**Validation Results:**
- ✅ TypeScript compilation successful
- ✅ CLI builds without errors
- ✅ Help text now shows correct Jira 2025 relations
- ✅ Validation will fail for affects (schema mismatch)

**Impact:**
- CLI now only accepts Jira 2025 standard relations
- Users attempting `devsteps link X affects Y` will get schema validation error