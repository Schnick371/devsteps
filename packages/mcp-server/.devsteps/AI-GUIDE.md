# AI Assistant Guide for DevSteps

## 🎯 Core Principle: Understanding Hybrid Methodology

DevSteps supports **two parallel hierarchies**:
1. **Scrum/Agile**: Epic → [Story | Spike | Bug] → Task
2. **Waterfall**: Requirement → Feature → [Task | Spike | Bug]

**CRITICAL**: Both hierarchies exist simultaneously in the same project!

---

## 🚨 Avoiding Common Mistakes

### ❌ WRONG: Spike under Story
```json
// NEVER DO THIS!
{
  "id": "SPIKE-001",
  "linked_items": {
    "implements": ["STORY-004"]  // ❌ WRONG!
  }
}
```

### ✅ CORRECT: Spike under Epic
```json
{
  "id": "SPIKE-001",
  "linked_items": {
    "implements": ["EPIC-003"],  // ✅ CORRECT!
    "required-by": ["TASK-004"]  // Optional: Spike blocks Task
  }
}
```

**Reason**: Spike is at the **same level** as Story, not below it!

---

## 📋 Complete Hierarchy Rules

### Scrum/Agile Tree

```
Theme (optional, strategic)
└── Initiative (optional)
    └── Epic (Level 1)
        ├── Story (Level 2)
        │   └── Task (Level 3)
        ├── Spike (Level 2) - SAME LEVEL AS STORY!
        │   └── Task (Level 3, optional)
        └── Bug (Level 2)
            └── Task (Level 3)
```

**Allowed Links:**
- `Epic → Story` (implemented-by)
- `Epic → Spike` (implemented-by)
- `Bug → Epic` (affects, relates-to)
- `Story → Task` (implemented-by)
- `Spike → Task` (implemented-by, optional)
- `Spike → Story` (relates-to) - Spike informs Story
- `Spike → Task` (required-by) - Spike blocks Task

**Forbidden Links:**
- ❌ `Epic → Task` (direct, must go through Story/Spike/Bug)
- ❌ `Spike → Story` (implements) - Spike is NOT under Story!
- ❌ `Task → Epic` (implements) - only through Story/Spike/Bug

### Waterfall Tree

```
Requirement (Level 1)
└── Feature (Level 2)
    ├── Task (Level 3)
    ├── Spike (Level 2.5 - research)
    └── Bug (Level 2.5 - defects)
```

**Allowed Links:**
- `Requirement → Feature` (implemented-by)
- `Feature → Task` (implemented-by)
- `Feature → Spike` (relates-to) - optional research
- `Spike → Requirement` (implements) - if Spike at Req level

---

## 🛠️ MCP Tool Usage Patterns

### Create Spike (CORRECT)

```typescript
// 1. Create spike
devsteps-add --type spike --title "Architecture Research" --priority high

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
