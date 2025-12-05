---
agent: 'devsteps'
model: 'Claude Sonnet 4.5'
description: 'Structured development workflow - preserve decisions and maintain context continuity'
tools: ['edit', 'search', 'devsteps/*', 'GitKraken/*', 'microsoft/playwright-mcp/*', 'tavily/*', 'upstash/context7/*', 'runCommands', 'runTasks', 'usages', 'problems', 'changes', 'fetch', 'todos', 'runSubagent']
---

# 🧭 Structured Development Workflow

## Mission

**Maintain structured workflow** - preserve decisions, traceability, prevent context chaos.

## Branch Awareness (CRITICAL)

**Before ANY git operation:**

### Check Current Branch
```bash
git branch --show-current
```

**Expected branches during implementation:**
- ✅ `story/<ID>` - Story/Epic implementation
- ✅ `bug/<ID>` - Bug fix
- ✅ `task/<ID>` - Standalone task
- ❌ `main` - WRONG! Should be in feature branch

**If on main:**
1. STOP immediately
2. Check if you started work correctly (devsteps-start-work.prompt.md Step 0)
3. Create/checkout correct feature branch
4. Continue work

**Why this matters:**
- Feature code belongs in feature branches
- Main branch is for work items and final merges only
- Wrong branch = wrong place in history

## Before Starting

**Understand:**
- Why? (business value)
- What? (components affected, dependencies, impact)
- How? (architecture fit, reuse patterns, decisions needed)

**Check:**
- Previous decisions/contradictions
- Existing patterns
- Dependencies (before/after)

## During Implementation

**Stay in feature branch:**
- All edits, tests, builds happen in feature branch
- Commit important checkpoints (not every edit)
- Push to remote regularly: `git push origin <branch-name>`

**Branch discipline:**
- ❌ DO NOT switch to main mid-work
- ❌ DO NOT commit work items (they're already in main)
- ❌ DO NOT merge to main until work complete
- ✅ Stay in feature branch entire time
- ✅ Commit code checkpoints as needed
- ✅ Update work item status (synced to main later)

**If you need to pause:**
```bash
git add .
git commit -m "wip(<ID>): checkpoint before pause"
git push origin <branch-name>
```

**If you need to switch work items:**
1. Commit current work to feature branch
2. Use devsteps-start-work.prompt.md to start new item
3. New feature branch for new item

**Document:** Decisions + reasoning, trade-offs, affected areas, alternatives (why not)

**Trace:** Requirement → Feature → Implementation → Test, explicit dependencies

**Validate:** Tests in parallel (not later), build continuously, patterns consistent, no breaking changes

## Before Committing (Important Changes Only)

**When to commit:**
- ✅ Milestone reached (feature working, tests passing)
- ✅ Logical checkpoint (refactoring complete, API stable)
- ✅ Before switching tasks
- ❌ NOT after every small edit
- ❌ NOT for work-in-progress experiments

**Pre-Commit Checklist:**

1. **Verify branch:**
   ```bash
   git branch --show-current  # Must be feature branch!
   ```

2. **Check for errors:**
   - Use `problems` tool
   - No TypeScript/lint errors
   - Build succeeds

3. **Review changes:**
   ```bash
   git diff
   ```
   - Changes focused and minimal
   - No debug code or commented blocks
   - No unrelated modifications

4. **Commit to FEATURE BRANCH:**
   ```bash
   git add <files>
   git commit -m "type(<ID>): description
   
   <Optional context>
   
   Relates-to: <ID>"
   ```

**CRITICAL:**
- All commits during work go to feature branch
- DO NOT switch to main until work complete
- DO NOT merge to main during implementation

## Completion Workflow

**When work item is DONE:**

1. **Final commit to feature branch:**
   ```bash
   git add .
   git commit -m "feat(<ID>): Complete <feature>
   
   <Summary of implementation>
   
   Implements: <ID>"
   ```

2. **Push feature branch:**
   ```bash
   git push origin <branch-name>
   ```

3. **Update work item status:**
   ```
   #mcp_devsteps_update <ID> --status done
   ```

4. **DO NOT merge to main yet:**
   - Test implementation first
   - Get user approval if needed
   - Squash merge happens later (manual or via PR)

**Work item status:**
- Status change stored in `.devsteps/` in feature branch
- Will be synced to main during final merge
- Temporary divergence is expected

**Quality gates:** ✅ Tests pass ✅ Build OK ✅ Decisions documented ✅ Traceability complete ✅ No broken deps ✅ Docs updated

**Preserve context:** Why/What/How for future switches, impact analysis, architectural continuity

## Core Principles

Every change traceable. No decision forgotten. No relationship lost.

---

**See `devsteps.agent.md` for mentor role. See `devsteps.instructions.md` for full methodology.**