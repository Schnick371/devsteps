# DevSteps Work Item Hierarchy

## Scrum/Agile Hierarchy

**Industry Standard (Azure DevOps/Jira 2025):**

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

**Allowed Links (implements):**
- Epic → Story|Spike|Bug
- Story → Task|Bug
- Bug → Task (fix)
- Spike → Task (optional)

**Flexible Relations (any to any):**
- relates-to, affects, blocks, depends-on, tested-by, supersedes

---

## Waterfall Hierarchy

**Industry Standard (Azure DevOps/Jira 2025):**

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

**Allowed Links (implements):**
- Requirement → Feature|Spike|Bug
- Feature → Task|Bug
- Bug → Task (fix)
- Spike → Task (optional)

**Flexible Relations (any to any):**
- relates-to, affects, blocks, depends-on, tested-by, supersedes
