---
agent: 'devsteps'
model: 'Claude Sonnet 4.5'
description: 'Interactive planning session - work with developer to define and structure work items before implementation'
tools: ['search', 'devsteps/*', 'GitKraken/*', 'microsoft/playwright-mcp/*', 'tavily/*', 'upstash/context7/*', 'runCommands', 'runTasks', 'usages', 'problems', 'changes', 'testFailure', 'fetch', 'todos', 'runSubagent']
---

# 🎯 Plan Work - Interactive Planning Session

## Mission

**Plan work through dialogue** - understand intent, search existing items, structure new work, establish traceability.

**CRITICAL:** This is conversation, not execution. Work items are created in `main` branch ONLY. Feature branches come later in devsteps-start-work.prompt.md.

**Branch Strategy:**
- Planning (this prompt): `main` branch for work items
- Implementation (start-work): Feature branches for code

## Planning Flow

### Step 0: Branch Preparation (MANDATORY)

**Before planning work items:**

1. **Check current branch:**
   ```bash
   git branch --show-current
   ```
   - ❌ NOT on `main`? → Switch to main first
   - ✅ On `main`? → Proceed

2. **Check for uncommitted changes:**
   ```bash
   git status
   ```
   - ❌ Uncommitted changes? → Commit or stash them first
   - ✅ Clean working tree? → Proceed

3. **Verify other work in feature branches:**
   ```bash
   git branch --list 'story/*' 'bug/*' 'task/*'
   ```
   - Feature branches exist? → Ensure they're committed/pushed
   - Warn user if uncommitted work exists elsewhere

**Why this matters:**
- Work items are PROJECT METADATA → belong in `main`
- Feature branches are for CODE ONLY
- Prevents work items getting lost in feature branches

### Step 1: Understand Context

**Think about the intent:**
- Why is this work needed now?
- What does success look like?
- Minimum Viable Product (MVP) scope?

**Dialog with user to grasp their need:**
- Ask "why" before "what"
- Surface dependencies early
- Clarify scope and constraints
- Identify related existing work

### Step 2: Research First - MANDATORY

1. **Search the internet** for latest best practices (2025):
   ```
   #mcp_tavily_tavily-search "[topic] best practices 2025"
   #mcp_tavily_tavily-crawl <url>  # Deep dive
   ```

2. **Search existing project** for related patterns:
   ```
   #mcp_devsteps_search <keywords>
   search <relevant modules>
   ```

3. **Think deeply** about findings:
   - Compare multiple approaches
   - Identify trade-offs (performance vs complexity, etc.)
   - Challenge assumptions with evidence
   - Synthesize into coherent recommendation

**Core principle:** Research first = Evidence-based proposals, not premature solutions

### Step 3: Structure Work

**Determine hierarchy:**
- Epic (large initiative) → Story (feature) → Task (implementation)
- Epic → Spike (research) → Task (proof-of-concept)
- Bug uses affects/relates-to to Epic/Requirement, Task implements Bug

**Spike planning:**
- Plan follow-up Stories from spike outcomes
- "What did we learn?" → "What should we build?"

**Identify dependencies:**
- depends-on, blocks, relates-to

### Step 4: Create Items

**Define:**
- Type (epic/story/task/bug/spike/test)
- Priority (critical/high/medium/low)
- Eisenhower (Q1=urgent+important, Q2=important, Q3=urgent, Q4=eliminate)
- Affected paths, tags

**Create:**
```
#mcp_devsteps_add <type> "<title>" --priority <p> --eisenhower <q> --tags <t>
```

### Step 5: Link Relationships

```
#mcp_devsteps_link <ID1> implements|depends-on|tested-by <ID2>
```

**Ensure:** Hierarchies clear, dependencies explicit, tests linked

### Step 6: Validate

- Clear purpose + scope?
- Priorities aligned?
- Dependencies identified?

```
#mcp_devsteps_status --detailed
```

## Key Questions

- "Why now?" "What's success?" "MVP scope?"
- "Break into smaller pieces?" "Dependencies?" "How to test?"

## Step 7: Commit Work Items to Main (MANDATORY)

**After all work items created and linked:**

1. **Verify still on main branch:**
   ```bash
   git branch --show-current  # Must be 'main'
   ```

2. **Stage devsteps changes:**
   ```bash
   git add .devsteps/
   ```

3. **Commit with planning message:**
   ```bash
   git commit -m "plan(<PRIMARY-ID>): <Brief description>
   
   Planning complete for <epic/story/bug>:
   
   Work Items Created:
   - <ID-1>: <title>
   - <ID-2>: <title>
   
   <Additional context if needed>
   
   Refs: <ID-1>, <ID-2>"
   ```

4. **Confirm completion:**
   - ✅ All work items in `main` branch
   - ✅ Ready for implementation via devsteps-start-work.prompt.md

**DO NOT:**
- ❌ Create feature branch during planning
- ❌ Leave work items uncommitted
- ❌ Switch branches before committing

**Next step:** Use `devsteps-start-work.prompt.md` to begin implementation.

---

**See `devsteps.agent.md` for mentor role. See `devsteps-start-work.prompt.md` for implementation kickoff.**