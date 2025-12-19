---
agent: 'devsteps-coordinator'
model: 'Claude Sonnet 4.5'
description: 'Interactive planning session - work with developer to define and structure work items before implementation'
tools: ['vscode/getProjectSetupInfo', 'vscode/newWorkspace', 'vscode/runCommand', 'vscode/vscodeAPI', 'vscode/extensions', 'execute/testFailure', 'execute/getTerminalOutput', 'execute/runTask', 'execute/getTaskOutput', 'execute/runInTerminal', 'execute/runTests', 'read/problems', 'read/readFile', 'search', 'web/fetch', 'copilot-container-tools/inspect_container', 'copilot-container-tools/inspect_image', 'copilot-container-tools/list_containers', 'copilot-container-tools/list_images', 'copilot-container-tools/list_networks', 'copilot-container-tools/list_volumes', 'copilot-container-tools/logs_for_container', 'tavily/*', 'upstash/context7/*', 'agent', 'devsteps/*', 'todo']
---

# 🎯 Plan Work - Interactive Planning Session

## Mission

Plan work through dialogue - understand intent, search existing items, structure new work, establish traceability.

**Branch Strategy:** DevSteps Work items created in `main` ONLY. Feature branches come later.

## Planning Protocol (MANDATORY)

**CRITICAL:** These steps are required - not optional. Skipping steps leads to inconsistent work items and lost traceability.

### 1. Branch Preparation (MANDATORY)

**Branch Context Preservation:**
- Remember current branch before planning
- Switch to main for work item creation
- Return to original branch after completion
- Prevents abandoned feature branches

**Before planning work items:**

1. **Capture current branch context**
2. **Verify/switch to `main` branch**
3. **Verify clean working tree**
4. **Verify other work in feature branches**


### 2. Understand Context
Ask "why" before "what". Surface dependencies early.

### 3. Research First (MANDATORY)
Search best practices + recommendations + existing patterns. Evidence-based proposals.

### 4. Structure Work (MANDATORY)

**Determine hierarchy:**
- **Epic → Story → Task** (standard feature development)
- **Epic → Spike → Task** (research → proof-of-concept)
- **Epic → Story (blocked by Bug) → Bug (blocks) → Task (implements Bug)** - Bug is CHILD of Story, impediment
  - Bug `implements` or `blocks` Story (Bug → Story relationship)
  - Task `implements` Bug (Task → Bug relationship)
  - Bug `relates-to` Epic (context only, NOT hierarchy)

**Spike planning:**
- Plan follow-up Stories from spike outcomes
- "What did we learn?" → "What should we build?"
- Link Stories to same Epic using `implements`

**Identify dependencies:**
- `depends-on` - Must complete before starting
- `blocks` - Prevents progress on another item
- `relates-to` - Related context, not hierarchical

### 5. Create Items
Type, priority (Eisenhower), affected paths, tags. Use devsteps MCP tools.

### 6. Link Relationships
Hierarchies (implements), dependencies (depends-on, blocks), tests (tested-by).

### 7. Validate
Clear purpose, priority aligned, dependencies identified.

### 8. Commit to Main
Stage `.devsteps/`, commit with planning format. No feature branches yet.

### 9. Return to Original Context
Restore original branch if planning was initiated from feature branch. Maintains workflow continuity.

### Consequences of Skipping Steps
- ❌ Wrong branch → Work items lost in feature branches
- ❌ No research → Reinventing solved problems
- ❌ Wrong structure → Broken traceability
- ❌ No validation → Incomplete/ambiguous items

---

**See `devsteps.agent.md` for mentor role. See `devsteps-start-work.prompt.md` for implementation kickoff.**