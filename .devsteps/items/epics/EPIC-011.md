# Extension Activation Performance Optimization

## Business Impact
VS Code shows performance warning: "Using '*' activation is usually a bad idea as it impacts performance"

Currently DevSteps extension loads at **every VS Code startup**, regardless of whether user has DevSteps projects. This impacts:
- VS Code startup time for ALL users
- Memory usage in non-DevSteps workspaces  
- Extension marketplace rating (performance complaints)

## Success Criteria
- ✅ No VS Code performance warnings
- ✅ Extension activates only when relevant (DevSteps projects or Init command)
- ✅ Welcome View still works correctly (no flash/flicker)
- ✅ All existing functionality preserved

## Target Architecture
**Smart Activation Strategy:**
- `workspaceContains:.devsteps` → DevSteps projects  
- `onCommand:devsteps.initProject` → New project initialization
- Conditional Welcome View logic → Only when extension inactive

**Performance Benefit:**
- 0ms activation time for non-DevSteps users
- Same UX for DevSteps users
- Better marketplace rating