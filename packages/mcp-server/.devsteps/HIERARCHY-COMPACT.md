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

**Allowed Links (hierarchy):**
- **implements**: Epic→Story|Spike, Story→Task, Bug→Task (fix), Spike→Task
- **blocks**: Bug→Story (hierarchy, parent only)

**Flexible Relations (any to any):**
- relates-to, depends-on, tested-by, supersedes
- blocks (non-Bug: Story→Story, Task→Task flexible)

**Note:** blocks is hierarchy for Bug, flexible for other types.

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

**Allowed Links (hierarchy):**
- **implements**: Requirement→Feature|Spike, Feature→Task, Bug→Task (fix), Spike→Task
- **blocks**: Bug→Requirement|Feature (Jira hierarchy + blocking)

**Flexible Relations (any to any):**
- relates-to, depends-on, tested-by, supersedes
- blocks (non-Bug: Story→Story, Task→Task flexible)

**Note:** blocks is hierarchy for Bug, flexible for other types.
