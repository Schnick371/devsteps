## Goal

Add a "🤖 AI Prompt Showcase" section to the top-level README.md Quick Start area, so users reading the README (GitHub, npm, etc.) also see the curated prompts without needing the extension walkthrough.

## Content

Insert after the existing "Quick Start" CLI examples:

```markdown
## 🤖 AI Prompt Showcase — Try These with Copilot

Once DevSteps is initialized and the MCP server is running, paste any of these into Copilot Chat:

### 🌱 Initialize Your First Project
```
Initialize a new DevSteps project in my current workspace using the Scrum methodology.
Use mcp_devsteps_init with methodology: scrum. Confirm the project is ready and show me the first steps.
```

### 🏥 Check if Everything is Running
```
Run mcp_devsteps_health and give me a full status report: server health, response times, and any warnings.
```

### 🔍 Discover What Copilot Can Do
```
List all DevSteps MCP tools using mcp_devsteps_context.
Explain each in one sentence and suggest three ways we can use them together.
```

### 🍳 Build a Real Project Structure
```
Create a complete DevSteps Epic→Story→Task structure for a Recipe Community Platform.
Users discover seasonal recipes by region, build collections, share meal plans, and track their pantry.
Create one Epic, three Stories with acceptance criteria, three Tasks each — link everything with mcp_devsteps_add and mcp_devsteps_link.
```

### ⚡ Plan Your Sprint with Eisenhower
```
Read my current backlog with mcp_devsteps_list and mcp_devsteps_status.
Sort by Eisenhower quadrant: what's urgent-important for today, what should I schedule, and what can I safely drop?
```

> **Tip:** These prompts work best with Claude Sonnet 4+ or GPT-4o. Smaller models may not follow multi-tool instructions reliably.
```

## Acceptance Criteria
- [ ] Section appears between "Quick Start" and the next major section in README
- [ ] All 5 prompts are in fenced code blocks (copyable)
- [ ] Recipe Community Platform example is used consistently
- [ ] Model recommendation tip included
- [ ] README still renders correctly on GitHub (no broken markdown)