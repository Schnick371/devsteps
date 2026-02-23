## Goal

As a new DevSteps user, I want the Get Started walkthrough to show me inspiring, ready-to-use Copilot prompts so I can immediately experience the power of AI-assisted project planning — without having to invent prompts myself.

## Context

The current walkthrough (5 steps: prerequisites → init → sidebar → dashboard → MCP) ends without showing the user **what to actually say** to Copilot. This creates a "now what?" moment that kills momentum.

A new walkthrough step — **"Try AI-Powered Planning"** — showcases 5 curated prompts. Clicking a prompt button opens Copilot Chat pre-filled with the example text, ready to run.

The example project used throughout: **Recipe Community Platform** — users discover seasonal recipes by region, build personal collections, share weekly meal plans, and track pantry inventory. Rich, relatable domain with natural Epic→Story→Task hierarchy.

## Acceptance Criteria

- [ ] New walkthrough step "Try AI-Powered Planning" added as the final step
- [ ] Step renders a markdown media file with beautifully formatted prompt showcase
- [ ] 5 prompt buttons present, each labelled clearly (e.g. "🌱 Initialize Scrum Project")
- [ ] Clicking a prompt button opens Copilot Chat with the full prompt text pre-filled
- [ ] Command `devsteps.walkthrough.openPromptInChat` registered and documented
- [ ] `workbench.action.chat.open` used as the underlying mechanism (with fallback to clipboard if unavailable)
- [ ] README "Quick Start" section updated with the same 5 prompts in a copyable format
- [ ] All 5 prompts are production-quality: invoke real MCP tools, use concrete domain language, avoid vagueness

## The 5 Showcase Prompts

### 1 — Initialize Scrum Project
> "Initialize a new DevSteps project in my current workspace using the Scrum methodology. Use `mcp_devsteps_init` with `methodology: scrum`. Confirm the project is ready and show me the first steps."

### 2 — DevSteps Health Check
> "Run `mcp_devsteps_health` and give me a full status report: is the MCP server healthy, what are the response times, and are there any warnings I should know about?"

### 3 — Explore MCP Capabilities
> "List all DevSteps MCP tools available to you using `mcp_devsteps_context`. Explain each tool in one sentence and suggest three powerful ways we could use them together to accelerate this project."

### 4 — Generate Item Structure (Recipe Community Platform)
> "Create a complete DevSteps item structure for a Recipe Community Platform. Users discover seasonal recipes by region, build personal collections, share weekly meal plans, and track pantry inventory. Create one Epic, three Stories with acceptance criteria, and three Tasks each — all linked with proper traceability using `mcp_devsteps_add` and `mcp_devsteps_link`."

### 5 — Intelligent Sprint Planning
> "Look at my current DevSteps backlog using `mcp_devsteps_list` and `mcp_devsteps_status`. Apply the Eisenhower Matrix: what should I focus on today (urgent-important), what should I schedule for this week (not-urgent-important), and what can I safely skip?"

## Affected Components

| Component | Change |
|---|---|
| `packages/extension/package.json` | Add walkthrough step, register command |
| `packages/extension/src/extension.ts` | Register `devsteps.walkthrough.openPromptInChat` |
| `packages/extension/src/commands/` | New command handler file |
| `packages/extension/media/walkthrough-prompts.md` | New markdown showcase file |
| `README.md` | Add "AI Prompt Showcase" to Quick Start |

## Technical Approach

- Register `devsteps.walkthrough.openPromptInChat` command with a `promptKey` string argument
- Map `promptKey` → prompt text in a typed `PROMPTS` record
- Call `vscode.commands.executeCommand('workbench.action.chat.open', { query: promptText })`
- Fallback: if `workbench.action.chat.open` fails, copy to clipboard + show info message
- Walkthrough step description uses `command:devsteps.walkthrough.openPromptInChat?...` buttons
- Markdown media file provides the visual overview shown in the step panel