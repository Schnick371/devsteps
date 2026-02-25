## Goal

Register a new extension command `devsteps.walkthrough.openPromptInChat` that accepts a `promptKey` string and opens Copilot Chat pre-filled with the corresponding prompt text.

## Implementation

**File: `packages/extension/src/commands/walkthroughPrompts.ts`** (new)

```typescript
import * as vscode from 'vscode';

const PROMPTS: Record<string, string> = {
  'init-scrum': `Initialize a new DevSteps project in my current workspace using the Scrum methodology. Use mcp_devsteps_init with methodology: scrum. Confirm the project is ready and show me the first steps.`,
  'health-check': `Run mcp_devsteps_health and give me a full status report: is the MCP server healthy, what are the response times, and are there any warnings I should know about?`,
  'explore-mcp': `List all DevSteps MCP tools available to you using mcp_devsteps_context. Explain each tool in one sentence and suggest three powerful ways we could use them together to accelerate this project.`,
  'recipe-structure': `Create a complete DevSteps item structure for a Recipe Community Platform. Users discover seasonal recipes by region, build personal collections, share weekly meal plans, and track pantry inventory. Create one Epic, three Stories with acceptance criteria, and three Tasks each — all linked with proper traceability using mcp_devsteps_add and mcp_devsteps_link.`,
  'sprint-planning': `Look at my current DevSteps backlog using mcp_devsteps_list and mcp_devsteps_status. Apply the Eisenhower Matrix: what should I focus on today (urgent-important), what should I schedule for this week (not-urgent-important), and what can I safely skip?`,
};

export async function openPromptInChat(promptKey: string): Promise<void> {
  const prompt = PROMPTS[promptKey];
  if (!prompt) {
    vscode.window.showWarningMessage(`DevSteps: Unknown prompt key "${promptKey}"`);
    return;
  }
  try {
    await vscode.commands.executeCommand('workbench.action.chat.open', { query: prompt });
  } catch {
    // Fallback: copy to clipboard
    await vscode.env.clipboard.writeText(prompt);
    vscode.window.showInformationMessage(
      'Prompt copied to clipboard — paste it into Copilot Chat to get started.'
    );
  }
}
```

**File: `packages/extension/src/extension.ts`** — add to `registerCommands()`:
```typescript
context.subscriptions.push(
  vscode.commands.registerCommand(
    'devsteps.walkthrough.openPromptInChat',
    (promptKey: string) => openPromptInChat(promptKey)
  )
);
```

**File: `packages/extension/package.json`** — add command declaration:
```json
{
  "command": "devsteps.walkthrough.openPromptInChat",
  "title": "Open Prompt in Copilot Chat",
  "category": "DevSteps"
}
```

## Acceptance Criteria
- [ ] Command registered and callable via command palette (hidden from palette with `"when": "false"` in menus)
- [ ] All 5 prompt keys resolve correctly
- [ ] Fallback to clipboard works when `workbench.action.chat.open` is unavailable
- [ ] TypeScript strict mode passes, no `any` types