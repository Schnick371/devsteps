# DevSteps Work Item Hierarchy

## Scrum/Agile Hierarchy

**Industry Standard (Jira 2025):**

```
Theme (strategic, optional)
└── Initiative (optional)
    └── Epic (Level 1)
        ├── Story (Level 2)
        │   ├── Task (Level 3)
        │   └── Bug (Level 3) - blocks
        │       └── Task (Level 4) - fix
        └── Spike (Level 2 - research)
            └── Task (Level 3, optional)

```

**Hierarchy Links (strict validation):**
- **implements/implemented-by**: Epic→Story|Spike, Story→Task, Spike→Task, Bug→Task (fix)
- **blocks/blocked-by**: Bug→Story (hierarchy for Bug only)

**Flexible Relations (any to any, no validation):**
- relates-to, depends-on/required-by, tested-by/tests, supersedes/superseded-by
- blocks (non-Bug: Story→Story, Task→Task bypass validation)

**Bug Relationships:**
- Bug uses **blocks** Story (hierarchy, parent only)
- Bug uses **relates-to** Epic/Story (additional context)
- Task **implements** Bug (= Bug `implemented-by` Task — fix implementation)
- ⚠️ **NEVER** use `relates-to` for Bug→Task — always use `implemented-by`

---

## Waterfall Hierarchy

**Industry Standard (Jira 2025):**

```
Requirement (Level 1)
├── Feature (Level 2)
│   ├── Task (Level 3)
│   └── Bug (Level 3) - blocks
│       └── Task (Level 4) - fix
└── Spike (Level 2 - research)
    └── Task (Level 3, optional)

```

**Hierarchy Links (strict validation):**
- **implements/implemented-by**: Requirement→Feature|Spike, Feature→Task, Spike→Task, Bug→Task (fix)
- **blocks/blocked-by**: Bug→Requirement|Feature (hierarchy for Bug only)

**Flexible Relations (any to any, no validation):**
- relates-to, depends-on/required-by, tested-by/tests, supersedes/superseded-by
- blocks (non-Bug: Feature→Feature, Task→Task bypass validation)

**Bug Relationships:**
- Bug uses **relates-to** to Requirement/Feature (context)
- Bug uses **blocks** Requirement/Feature (hierarchy, Jira 2025)
- Task **implements** Bug (= Bug `implemented-by` Task — fix implementation)
- ⚠️ **NEVER** use `relates-to` for Bug→Task — always use `implemented-by`

---

## Status Types

- 📝 **draft** - Initial state, not yet planned
- 📋 **planned** - Scheduled for implementation
- 🔄 **in-progress** - Currently being worked on
- 👀 **review** - Implementation complete, awaiting review
- ✅ **done** - Completed and verified
- 🚫 **obsolete** - No longer relevant or superseded
- ❌ **blocked** - Cannot proceed due to dependency
- 🔴 **cancelled** - Abandoned, will not be implemented

````
