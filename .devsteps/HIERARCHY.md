# DevSteps Hierarchie-Definitionen (Hybrid Methodology)

## Validierte Scrum/Agile Hierarchie

**Industry Standard (Azure DevOps/Jira 2025):**

```
Theme (strategisch, optional)
└── Initiative (optional)
    └── Epic (Level 1)
        ├── Story (Level 2)
        │   ├── Task (Level 3)
        │   └── Bug (Level 3) - blocks
        │       └── Task (Level 4) - fix
        └── Spike (Level 2 - research)
            └── Task (Level 3, optional)

```

### Regeln für Scrum-Hierarchie

**Epic (Level 1)**
- Contains: Stories, Spikes (only)
- Relationships: `implemented-by` → Stories, Spikes

**Story (Level 2)**
- Contains: Tasks, Bugs
- Relationships: 
  - `implements` → Epic
  - `implemented-by` → Tasks
  - `blocked-by` → Bugs
  - `relates-to` → Spikes (for dependencies)

**Spike (Level 2 - research)**
- Contains: Tasks (optional, for research breakdown)
- Relationships:
  - `implements` → Epic (Spike is child of Epic)
  - `implemented-by` → Tasks (optional)
  - `relates-to` → Stories (Spike informs Story development)
  - `required-by` → Tasks or Stories (blocks implementation)

**Bug (Level 3)**
- Contains: Tasks Level 4 (fixes)
- Always child of Story (never direct child of Epic)
- Relationships:
  - `blocks` → Story (hierarchical parent)
  - `relates-to` → Epic/Story (additional context)
  - `implemented-by` → Tasks (fix implementation)

**Task (Level 3 and 4)**
- Contains: Nothing (atomic work unit)
- Relationships:
  - `implements` → Story, Spike, or Bug
  - `depends-on` → Other Tasks, Spikes

### Erlaubte Scrum-Links (Allowed Links)

**Hierarchie (implements/implemented-by):**
- `Epic → Story` (implemented-by)
- `Epic → Spike` (implemented-by)
- `Story → Task` (implemented-by)
- `Story → Bug` (blocked-by) 
- `Spike → Task` (implemented-by, optional)
- `Bug → Task` (implemented-by) - fix implementation

**Flexible Beziehungen (relates-to/depends-on):**
- `Bug → Story` (blocks) - Bug blocks its parent Story
- `Bug → Story/Epic` (relates-to) - Bug context (general association)
- `Spike → Story` (relates-to) - Spike informs Story
- `Spike → Task` (required-by) - Spike blocks Task
- `Task → Task` (depends-on, blocks)

### Verbotene Scrum-Links (Forbidden Links)

- ❌ `Epic → Task` (direct) - must go through Story/Spike/Bug
- ❌ `Spike → Story` (implements) - Spike is sibling of Story, not child
- ❌ `Task → Epic` (implements) - must go through Story/Spike/Bug
- ❌ `Bug → Bug` (implements) - no nested Bugs
- ❌ `Spike → Spike` (implements) - no nested Spikes

---

## Validierte Waterfall Hierarchie

**Industry Standard (Azure DevOps/Jira 2025):**

```
Requirement (Level 1)
├── Feature (Level 2)
│   ├── Task (Level 3)
│   └── Bug (Level 3) - blocks
│       └── Task (Level 4) - fix
└── Spike (Level 2 - research)
    └── Task (Level 3, optional)

```

Same rules as Scrum but:
- Requirement replaces Epic
- Feature replaces Story

---

## Filter & Anzeige-Optionen (für Dashboard/TreeView)

### Status-Filter
- 📝 Draft - Initial state, not yet planned
- 📋 Planned - Scheduled for implementation
- 🔄 In Progress - Currently being worked on
- 👀 Review - Implementation complete, awaiting review
- ✅ Done - Completed and verified
- 🚫 Obsolete - No longer relevant or superseded
- ❌ Blocked - Cannot proceed due to dependency
- 🔴 Cancelled - Abandoned, will not be implemented

### Eisenhower-Matrix
- 🔴: Q1 (Urgent + Important): EPIC-003, REQ-001, FEAT-004
- 🟠: Q2 (Not Urgent + Important): SPIKE-001, SPIKE-002
- 🟡: Q3 (Urgent + Not Important): -
- 🟢: Q4 (Not Urgent + Not Important): -

### Historische Ansicht
- **Toggle "Show Completed"**: Ein/Aus für erledigte Items
- **Timeline View**: Chronologische Anzeige aller Updates
- **Archive View**: Zugriff auf archivierte Items

---

### Beim Trace-Command:
- Zeige **alle Ebenen** (auch done items)
- Markiere **Cross-References** (relates-to, depends-on)
- Highlighte **Blocker** (required-by, blocked-by)


