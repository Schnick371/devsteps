# Smart Activation Strategy - Replace Star Event with Conditional Activation

## User Story
**As a VS Code user**, I want DevSteps extension to only activate when I actually need it, so VS Code starts faster when I'm working on non-DevSteps projects.

## Acceptance Criteria
- ✅ Replace `"activationEvents": ["*"]` with smart conditions
- ✅ Activate on `workspaceContains:.devsteps` (existing projects)
- ✅ Activate on `onCommand:devsteps.initProject` (new projects) 
- ✅ Welcome View logic updated to handle non-activated state
- ✅ No performance warnings from VS Code
- ✅ No regression in functionality

## Technical Implementation
**Current Problem:** 
`activationEvents: ["*"]` loads extension for ALL VS Code sessions

**Solution:**
```json
"activationEvents": [
  "workspaceContains:.devsteps",
  "onCommand:devsteps.initProject" 
]
```

**Welcome View Strategy:**
- Show Welcome View when extension is NOT activated
- Hide Welcome View when `.devsteps` detected (extension active)
- Init command activates extension and creates project