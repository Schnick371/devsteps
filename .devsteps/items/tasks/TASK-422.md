# Add AI-workflow hints to extension walkthrough and Welcome View

Add three key user-facing hints for new DevSteps users to the VS Code extension UI:

## Hints to add

1. **Set AI thinking to "medium"** — Spider Web handles AI orchestration dynamically; higher thinking settings (e.g. "maximum") waste time and resources without benefit, since the Spider Web protocol already optimises dispatch autonomously.

2. **Use `/dev` in Copilot chat** — Typing `/dev` in the GitHub Copilot chat opens the list of prepared DevSteps prompts (e.g. `devsteps-10-plan-work`, `devsteps-20-start-work`). New users need to know this entry point.

3. **Spider Web scope is controlled by natural language** — Users can influence Spider Web depth by adding phrases like "quick fix", "full analysis", or "just plan, don't code" to their Copilot prompt.

## Affected files

- `packages/extension/package.json` — `viewsWelcome.contents` (compact 2-line addition) and `walkthroughs.steps` (new step `devsteps.gettingStarted.aiSetup` "Optimize AI Settings")

## Implementation notes

- **Welcome view:** append compact hint after existing Claude Sonnet recommendation, before the init command link — keep it to ≤2 lines since space is limited
- **Walkthrough:** insert new step as the 2nd-to-last step (before the MCP step), containing all 3 hints with clear formattingImplemented: Welcome View AI-hint block (thinking=medium, /dev, agent mode) + new walkthrough step 'Optimize AI Settings' with Spider Web explanation. Merged in feat(extension): 45bf776.