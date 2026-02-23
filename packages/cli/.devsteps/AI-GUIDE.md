# AI Assistant Guide for DevSteps

## 🎯 Core Principle: Understanding Hybrid Methodology

DevSteps supports **two parallel hierarchies**:
1. **Scrum/Agile**: Epic → [Story | Spike | Bug] → Task
2. **Waterfall**: Requirement → Feature → [Task | Spike | Bug]

**CRITICAL**: Both hierarchies exist simultaneously in the same project!

## 📋 Complete Hierarchy Rules

### Scrum/Agile Tree

```
Theme (optional, strategic)
└── Initiative (optional)
    └── Epic (Level 1)
        ├── Story (Level 2)
        │   ├── Task (Level 3)
        │   └── Bug (Level 3) - blocks
        │       └── Task (Level 4) - fix
        └── Spike (Level 2 - research)
            └── Task (Level 3, optional)
```

**Industry Standard (Azure DevOps/Jira 2025):**
- Bug is ALWAYS child of Story (never Epic)
- Bug blocks its parent Story
- Spike is always child of Epic (research before Story implementation)

**Scrum/Agile Allowed Links:**
- `Epic → Story` (implemented-by)
- `Epic → Spike` (implemented-by) - research
- `Story → Task` (implemented-by)
- `Story → Bug` (blocks) - Bug blocks parent Story
- `Bug → Task` (implemented-by) - fix implementation
- `Spike → Task` (implemented-by, optional) - research tasks
- `Spike → Story` (relates-to) - Spike informs Story
- `Task → Bug` (implements) - solution fixes the problem

**Scrum/Agile Forbidden Links:**
- ❌ `Epic → Task` (direct, must go through Story/Spike/Bug)
- ❌ `Spike → Story` (implements, Spike is sibling of Story, not child)
- ❌ `Task → Epic` (implements, must go through Story/Spike/Bug)
- ❌ `Bug → Bug` (implements, no nested Bugs)
- ❌ `Spike → Spike` (implements, no nested Spikes)

### Waterfall Tree

```
Requirement (Level 1)
├── Feature (Level 2)
│   ├── Task (Level 3)
│   └── Bug (Level 3) - blocks
│       └── Task (Level 4) - fix
└── Spike (Level 2 - research)
    └── Task (Level 3, optional)
```

**Industry Standard (Azure DevOps/Jira 2025):**
- Bug is ALWAYS child of Feature (never Requirement)
- Bug blocks its parent Feature
- Spike is always child of Requirement (research before Feature implementation)

**Waterfall Allowed Links:**
- `Requirement → Feature` (implemented-by)
- `Requirement → Spike` (implemented-by) - research
- `Feature → Task` (implemented-by)
- `Feature → Bug` (blocks) - Bug blocks parent Feature
- `Bug → Task` (implemented-by) - fix implementation
- `Spike → Task` (implemented-by, optional) - research tasks
- `Task → Bug` (implements) - solution fixes the problem
- `Spike → Feature` (relates-to) - Spike informs Feature design

**Waterfall Forbidden Links:**
- ❌ `Requirement → Task` (direct, must go through Feature/Spike/Bug)
- ❌ `Task → Requirement` (implements, must go through Feature/Spike/Bug)
- ❌ `Spike → Spike` (implements, no nested Spikes)
- ❌ `Bug → Bug` (implements, no nested Bugs)

**Waterfall Bug Workflow Examples:**

**Pattern 1: Feature-Level Bug (most common)**
```
REQ-001: User Authentication
└── FEAT-002: Email Registration
    └── BUG-010: Email validation fails for aliases
        └── TASK-050: Fix email regex validation

# Links:
BUG-010 --implements--> FEAT-002 (Bug is child of Feature)
TASK-050 --implements--> BUG-010 (Task fixes Bug)
```

**Pattern 2: Requirement-Level Bug (impacts multiple features)**
```
REQ-001: User Authentication
├── FEAT-002: Email Registration
├── FEAT-003: OAuth Login
└── BUG-011: Session timeout too short
    └── TASK-051: Increase session timeout to 30min

# Links:
BUG-011 --implements--> REQ-001 (Bug is child of Requirement)
BUG-011 --affects--> FEAT-002 (Bug impacts Email Registration)
BUG-011 --affects--> FEAT-003 (Bug impacts OAuth Login)
TASK-051 --implements--> BUG-011 (Task fixes Bug)
```

---

## 🛠️ MCP Tool Usage Patterns

### Create Spike (CORRECT)

```typescript
// 1. Create spike
devsteps-add --type spike --title "Architecture Research" --priority not-urgent-important

// 2. Link to Epic (NOT to Story!)
devsteps-link --source SPIKE-001 --relation implements --target EPIC-003

// 3. Optional: Create task dependency
devsteps-link --source SPIKE-001 --relation required-by --target TASK-004

// 4. Optional: Inform story
devsteps-link --source SPIKE-001 --relation relates-to --target STORY-004
```

### Create Story (Standard)

```typescript
// 1. Create story
devsteps-add --type story --title "Feature Implementation"

// 2. Link to Epic
devsteps-link --source STORY-001 --relation implements --target EPIC-001

// 3. Link tasks
devsteps-link --source TASK-001 --relation implements --target STORY-001
devsteps-link --source TASK-002 --relation implements --target STORY-001
```

### Create Bug + Fix (CRITICAL PATTERN)

```typescript
// 1. Create Bug (PROBLEM ONLY - no solution!)
devsteps-add --type bug --title "Email validation fails for aliases" \
  --description "Users cannot register with + or . in email" \
  --priority not-urgent-important

// 2. Link Bug to affected Epic/Requirement (impact traceability)
devsteps-link --source BUG-010 --relation affects --target EPIC-003
// OR use relates-to for general context
devsteps-link --source BUG-010 --relation relates-to --target FEAT-002

// 3. Create Task for fix (SOLUTION ONLY - how to fix!)
devsteps-add --type task --title "Fix email regex validation" \
  --description "Update validateEmail() to support + and . characters"

// 4. Link Task implements Bug (solution fixes problem)
devsteps-link --source TASK-050 --relation implements --target BUG-010

// 5. Implement fix in Task, NOT in Bug!
// Bug = problem documentation, Task = solution implementation
```

### Link Validation (before every devsteps-link!)

```typescript
// Check if link is allowed:
if (source.type === 'spike' && relation === 'implements') {
  if (target.type === 'story') {
    throw Error('❌ Spike cannot implement Story! Use Epic or Feature.');
  }
  if (target.type !== 'epic' && target.type !== 'feature') {
    throw Error('❌ Spike must implement Epic or Feature only!');
  }
}

if (source.type === 'task' && relation === 'implements') {
  if (target.type === 'epic' || target.type === 'requirement') {
    throw Error('❌ Task cannot implement Epic/Requirement directly!');
  }
  if (!['story', 'spike', 'bug', 'feature'].includes(target.type)) {
    throw Error('❌ Task must implement Story/Spike/Bug/Feature only!');
  }
}
```

---

## 🔍 Trace & Visualization

### Using devsteps-trace

```bash
# Complete tree (all levels, including done items!)
devsteps-trace EPIC-003 --depth 4

# Shows:
EPIC-003
├── STORY-004
│   ├── TASK-001
│   ├── TASK-002
│   └── ...
├── SPIKE-001 (same level as STORY!)
```

### Important Filters (for TreeView/Dashboard)

1. **Hierarchy View** (Default):
   - Show both trees (Scrum + Waterfall) in parallel
   - Grouping by item_type
   - All levels visible (including done!)

2. **Status Filters**:
   - Draft, In-Progress, Done, Blocked
   - Toggle "Show Completed" (default: ON!)

3. **Eisenhower Matrix**:
   - Q1 (urgent-important): Show first
   - Q2 (not-urgent-important): Spikes often here!

4. **Historical View**:
   - **CRITICAL**: Completed items must stay visible!
   - User wants to see what was already defined/done
   - Toggle optional, but default: Show ALL

---

## 🧠 AI Mental Model

### Spike vs Story - When to Use?

**Story** (Feature Development):
- "Implement Feature X"
- Delivers product value
- User can use the result
- Example: "VS Code Extension Package"

**Spike** (Research/Investigation):
- "Investigate Approach Y"
- Delivers **knowledge**, not features
- Time-boxed (1-3 days)
- Informs Stories/Tasks
- Example: "MCP Architecture Research"

**Relationship**:
```
EPIC: VS Code Extension
├── STORY: Extension Implementation ← gets implemented
└── SPIKE: Architecture Research   ← informs Story
    └── required-by: TASK-004      ← blocks Task
```

### Cross-Methodology Links

**Scrum ↔ Waterfall**:
- Story ↔ Feature (relates-to)
- Epic ↔ Requirement (relates-to, optional)
- Tasks are shared!
- Spikes are shared!

**Example**:
```
EPIC-003 (Scrum)
└── STORY-004 ← relates-to → FEAT-004 (Waterfall)
    ├── TASK-001 (shared!)
    └── TASK-002 (shared!)
```

---

## 📝 Checklist Before Every Link Creation

Before calling `devsteps-link`, check:

1. ✅ Is source.type + relation + target.type allowed?
   - See table in HIERARCHY.md

2. ✅ Spike special case?
   - Spike MUST implement Epic/Feature
   - Spike CAN have relates-to with Story
   - Spike CAN have required-by with Task

3. ✅ Does link already exist?
   - `devsteps-get <ID>` → check linked_items
   - Don't create duplicates!

4. ✅ Is direction correct?
   - "implements" = "is part of"
   - "required-by" = "blocks"
   - "relates-to" = "informs"

---

## 🎓 Learning from Mistakes

### Error #1: Direct File Edit Instead of MCP
**Problem**: I edited EPIC-003.json directly
**Solution**: ALWAYS use `devsteps-update` or `devsteps-link`
**Why**: Index consistency, bidirectional links, validation

### Error #2: Spike Linked Under Story
**Problem**: `SPIKE-001 --implements--> STORY-004`
**Correction**: `SPIKE-001 --implements--> EPIC-003`
**Rule**: Spike is sibling of Story, not child!

### Error #3: No Link Deletion Possible
**Problem**: There's no `devsteps-unlink` tool!
**Workaround**: Script with jq (see scripts/fix-spike-links.sh)
**TODO**: Feature request for `unlinkItem()` in shared/core/

---

## 🔮 Best Practices for AI Assistants

1. **Before Link Creation**: Research hierarchy rules
2. **After Link Creation**: Validate with `devsteps-trace`
3. **When Uncertain**: Read HIERARCHY.md
4. **Spike Check**: Always verify Spike is linked correctly
5. **Historical Data**: ALWAYS show all items (including done)
6. **Error Correction**: Write scripts instead of manual editing
7. **Documentation**: Look up HIERARCHY.md, don't guess

---

## 📚 Additional Resources

- `.devsteps/HIERARCHY.md` - Complete hierarchy definition
- `.devsteps/config.json` - Project configuration with hierarchies
- `scripts/fix-spike-links.sh` - Example for link correction
- `packages/shared/src/core/` - Available core functions

---

**REMEMBER**: DevSteps is a **traceability system**. Every link has meaning. Wrong links = Wrong traceability = Chaos!
