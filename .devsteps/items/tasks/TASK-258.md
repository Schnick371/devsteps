## Goal

Add the 6th and final step to the Get Started walkthrough that showcases 5 clickable AI prompts.

## Implementation

**File: `packages/extension/package.json`** — append to `walkthroughs[0].steps`:

```json
{
  "id": "devsteps.gettingStarted.aiPrompts",
  "title": "Try AI-Powered Planning",
  "description": "The real magic happens in Copilot Chat. Click a prompt below to open it pre-filled and ready to run — no typing required.\n\n**🌱 First Steps**\n[Initialize Scrum Project](command:devsteps.walkthrough.openPromptInChat?%22init-scrum%22)  ·  [Check DevSteps Health](command:devsteps.walkthrough.openPromptInChat?%22health-check%22)\n\n**🔍 Explore & Build**\n[Explore All MCP Tools](command:devsteps.walkthrough.openPromptInChat?%22explore-mcp%22)  ·  [Plan Your First Project](command:devsteps.walkthrough.openPromptInChat?%22recipe-structure%22)\n\n**⚡ Plan Your Sprint**\n[Prioritize My Backlog](command:devsteps.walkthrough.openPromptInChat?%22sprint-planning%22)",
  "media": {
    "markdown": "media/walkthrough-prompts.md"
  }
}
```

## Notes
- The `media.markdown` file provides a rich visual overview shown in the step panel
- The `description` links are the clickable action buttons in the step header area
- Step has no `completionEvents` — it completes by user interaction with Copilot Chat

## Acceptance Criteria
- [ ] Step appears as final item in Get Started walkthrough
- [ ] All 5 command buttons render and trigger the correct prompt keys
- [ ] Markdown panel displays the full prompt showcase with context
- [ ] Step description is concise enough to read in 10 seconds