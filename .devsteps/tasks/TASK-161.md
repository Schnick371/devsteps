# Add Cycle Detection Configuration Property

## Objective
Add `devsteps.treeView.enableCycleDetection` setting to extension configuration.

## Implementation

**File:** `packages/extension/package.json`

**Location:** In `contributes.configuration.properties` section (after existing `devsteps.logging.*` settings)

```json
"devsteps.treeView.enableCycleDetection": {
  "type": "boolean",
  "default": true,
  "markdownDescription": "Enable cycle detection in hierarchical TreeView to prevent duplicate ID errors with bidirectional relationships.\n\n⚠️ **Warning:** Disabling may cause 'Element already registered' errors if your work items have bidirectional `relates-to` relationships.\n\n**When to disable:**\n- Large hierarchies (1000+ items) where performance is critical\n- Your data has strict parent→child relationships only (no cycles)\n\n**When to keep enabled (recommended):**\n- You use `relates-to` between items at the same level\n- You want maximum safety and stability"
}
```

## Validation
- [ ] Setting appears in VS Code Settings UI under "DevSteps"
- [ ] Default value is `true` (checkbox checked)
- [ ] Markdown description renders properly with warning icon
- [ ] Setting change persists across VS Code restarts

## Notes
- Uses `markdownDescription` for rich formatting (bold, emoji, lists)
- Clear warning about risks when disabled
- Guidance for when to use each option