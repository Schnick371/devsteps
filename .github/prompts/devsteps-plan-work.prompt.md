---
agent: 'devsteps'
model: 'Claude Sonnet 4.5'
description: 'Interactive planning session - work with developer to define and structure work items before implementation'
tools: ['search', 'devsteps/*', 'GitKraken/*', 'microsoft/playwright-mcp/*', 'tavily/*', 'upstash/context7/*', 'runCommands', 'runTasks', 'usages', 'problems', 'changes', 'testFailure', 'fetch', 'todos', 'runSubagent']
---

# 🎯 Plan Work - Interactive Planning Session

## Mission

Plan work through dialogue - understand intent, search existing items, structure new work, establish traceability.

**Branch Strategy:** DevSteps Work items created in `main` ONLY. Feature branches come later.

## Planning Protocol

### 0. Branch Preparation
- Verify on `main` branch before planning
- **Principle:** Work items are metadata, belong in `main`. 

### 1. Understand Context
- Ask "why" before "what"
- Surface dependencies early
- Identify related existing work

### 2. Research First (MANDATORY)
- Search internet for latest best practices and recommendations
- Search project for existing patterns
- Compare approaches and trade-offs
- **Principle:** Evidence-based proposals, not premature solutions

### 3. Structure Work
- Epic → Story → Task (implementation)
- Epic → Spike → Task (research)
- Story → Bug → Task (fix) - Bug blocks Story only
- Spike → Story (findings create new work)
- Identify dependencies (depends-on, blocks, relates-to)

### 4. Create Items
- Define type, priority, Eisenhower quadrant
- Add affected paths and tags
- Use devsteps MCP tools for creation

### 5. Link Relationships
- Establish hierarchies (implements/implemented-by)
- Bug blocks Story only (never Epic)
- Bug uses relates-to for additional context
- Set dependencies (depends-on, required-by)
- Link tests (tested-by/tests)
- **Principle:** Explicit traceability, Bug never implements Epic/Story

### 6. Validate
- Verify clear purpose and scope
- Check priority alignment
- Confirm dependencies identified
- Review with devsteps status

### 7. Commit to Main (MANDATORY)
- Verify still on `main` branch
- Stage `.devsteps/` changes
- Commit with planning message format
- **Prohibition:** No feature branch creation during planning

## Key Questions

"Why now?" "What's success?" "MVP scope?" "Dependencies?" "How to test?"

---

**See `devsteps.agent.md` for mentor role. See `devsteps-start-work.prompt.md` for implementation kickoff.**