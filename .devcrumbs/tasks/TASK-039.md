## CLI Validation Integration Complete

Integrated validation engine into CLI link command with user-friendly error messages.

### Implementation

**File:** `packages/cli/src/commands/index.ts`
- Added `validateRelationship` import from @devcrumbs/shared
- Load project config to get methodology
- Validate before creating link (unless --force)
- Display helpful error + suggestion on validation failure
- Show "(forced)" indicator when --force used

**File:** `packages/cli/src/index.ts`
- Added `--force` option to link command

### Features

1. **Validation Integration**
   - Loads methodology from .devcrumbs/config.json
   - Calls `validateRelationship()` before linking
   - Blocks invalid relationships with clear errors

2. **User-Friendly Errors**
   ```
   ✗ Tasks can only implement Stories or Spikes in Scrum
   💡 Change EPIC-005 to a Story or create a Story first, then link Task → Story
   
   Use --force to override validation
   ```

3. **Force Override**
   ```bash
   devcrumbs link TASK-041 implements EPIC-005 --force
   # ✔ Linked TASK-041 --implements--> EPIC-005 (forced)
   ```

4. **Hybrid Methodology Support**
   - Fixed validation logic to try both Scrum and Waterfall rules
   - Returns first valid match
   - Returns Scrum error if both fail

### Testing

**Invalid cases blocked:**
- ✅ TASK-038 → EPIC-005 fails (needs Story intermediary)
- ✅ Shows suggestion to create Story first

**Valid cases work:**
- ✅ TASK-038 → STORY-005 succeeds
- ✅ relates-to always works (flexible relationship)

**Force override:**
- ✅ --force flag bypasses validation
- ✅ Shows "(forced)" indicator in success message

### Quality Gates
- ✅ Build passes
- ✅ No errors (pre-existing vscode error unrelated)
- ✅ Validation tests pass (10/10)
- ✅ Manual CLI tests successful