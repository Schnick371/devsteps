# DevSteps Work Item Hierarchy

## Scrum/Agile Hierarchy

**Industry Standard (Jira 2025):**

```
Theme (strategic, optional)
└── Initiative (optional)
    └── Epic (Level 1)
        ├── Story (Level 2)
        │   ├── Task (Level 3)
        │   └── Bug (Level 2.5 - story-level defect)
        │       └── Task (Level 3) - fix
        ├── Spike (Level 2 - research)
        │   └── Task (Level 3, optional)
        └── Bug (Level 2 - epic-level defect)
            └── Task (Level 3) - fix
```

**Allowed Links (hierarchy):**
- **implements**: Epic→Story|Spike|Bug, Story→Task|Bug, Bug→Task (fix), Spike→Task
- **blocks**: Bug→Epic|Story (Jira hierarchy + blocking)

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
│   └── Bug (Level 2.5 - feature-level defect)
│       └── Task (Level 3) - fix
├── Spike (Level 2 - research)
│   └── Task (Level 3, optional)
└── Bug (Level 2 - requirement-level defect)
    └── Task (Level 3) - fix
```

**Allowed Links (hierarchy):**
- **implements**: Requirement→Feature|Spike|Bug, Feature→Task|Bug, Bug→Task (fix), Spike→Task
- **blocks**: Bug→Requirement|Feature (Jira hierarchy + blocking)

**Flexible Relations (any to any):**
- relates-to, depends-on, tested-by, supersedes
- blocks (non-Bug: Story→Story, Task→Task flexible)

**Note:** blocks is hierarchy for Bug, flexible for other types.
