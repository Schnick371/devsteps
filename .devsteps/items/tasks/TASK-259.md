## Goal

Create `packages/extension/media/walkthrough-prompts.md` — the rich markdown content shown in the walkthrough step panel. Visually guides users through the 5 prompts with context, so they understand *what* to expect before clicking.

## Content Structure

```markdown
# 🤖 Try AI-Powered Planning

DevSteps integrates with GitHub Copilot through an MCP server — your AI assistant can read, create, and link work items directly. These prompts show you what's possible.

---

## 🌱 Start Your Project

### Initialize a Scrum Project
Open Copilot Chat and type:
> Initialize a new DevSteps project in my current workspace using the Scrum methodology...

**What happens:** DevSteps creates a `.devsteps/` folder, sets the methodology to Scrum, and walks you through the first configuration steps.

---

## 🔍 Explore & Understand

### Run a Health Check
> Run mcp_devsteps_health and give me a full status report...

**What happens:** Copilot calls the DevSteps health endpoint and reports server status, response times, and any warnings.

### Explore All MCP Tools
> List all DevSteps MCP tools available to you using mcp_devsteps_context...

**What happens:** You get a catalogue of every DevSteps tool Copilot can use — from adding items to exporting reports.

---

## 🏗️ Build Something Real

### Generate a Project Structure
Create a full Epic→Story→Task hierarchy for a **Recipe Community Platform**:
> Create a complete DevSteps item structure for a Recipe Community Platform. Users discover seasonal recipes by region...

**What happens:** Copilot creates ~15 linked work items with acceptance criteria, Eisenhower priorities, and full traceability — in under 30 seconds.

---

## ⚡ Plan Smart

### Prioritize Your Backlog
> Look at my current DevSteps backlog using mcp_devsteps_list and mcp_devsteps_status. Apply the Eisenhower Matrix...

**What happens:** Copilot reads your actual items and recommends what to focus on today vs. schedule vs. drop — grounded in your real data.

---

*Tip: You can also ask Copilot free-form: "What's blocking my current sprint?" or "Add a bug for the login form validation."*
```

## Acceptance Criteria
- [ ] File renders cleanly in VS Code's walkthrough markdown panel
- [ ] All 5 prompts shown with context and "what happens" explanation
- [ ] Recipe Community Platform example is vivid and concrete
- [ ] No broken links or markdown errors
- [ ] File ≤ 80 lines to keep the panel scannable