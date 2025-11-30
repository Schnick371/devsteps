# Welcome Screen: Add Model Recommendation

## Objective
Add informational notice to Welcome screen recommending Claude Sonnet 4+ for best DevSteps experience.

**Part of STORY-046: Welcome Screen Content Enhancement**

## Context
Users may experience issues with weaker AI models that struggle with:
- Following complex instructions
- Proper MCP tool integration
- DevSteps workflow execution

## Implementation

### Location
`packages/extension/package.json` - `viewsWelcome` section (line ~65)

### Content Placement
**After** "No DevSteps project found..." message, **before** Initialize button

### Proposed Text
```markdown
No DevSteps project found in this workspace.

ℹ️ **Recommended: Claude Sonnet 4+** for best tool integration and instruction following.
Other Copilot models may struggle with DevSteps' MCP tools.

[Initialize DevSteps Project](command:devsteps.initProject)

Or use the Command Palette:
• Run 'DevSteps: Initialize Project'
• Use the CLI: `devsteps init`

DevSteps helps you track work items, features, bugs, and requirements directly in your repository.

[Share Model Testing Feedback](https://github.com/Schnick371/devsteps/discussions) | [Learn More](https://github.com/Schnick371/devsteps)
```

## Acceptance Criteria
- ✅ Recommendation appears on Welcome screen
- ✅ Informational tone (ℹ️) not warning
- ✅ Placed after "No DevSteps project..." header
- ✅ Link to GitHub Discussions for feedback
- ✅ Concise and clear messaging

## Technical Notes
- VS Code `viewsWelcome` uses Markdown format
- No build required - package.json change only
- Test by opening workspace without `.devsteps/` directory

## Relationships
- Implements: STORY-046 (Welcome Screen Content Enhancement)
- Relates to: EPIC-003 (VS Code Extension)