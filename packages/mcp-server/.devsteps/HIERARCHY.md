# DevSteps Hierarchie-Definitionen (Hybrid Methodology)

## Validierte Scrum/Agile Hierarchie

**Industry Standard (Azure DevOps/Jira 2025):**

```
Theme (strategisch, optional)
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

### Regeln für Scrum-Hierarchie

**Epic (Level 1)**
- Contains: Stories, Spikes, Bugs (epic-level)
- Relationships: `implemented-by` → Stories, Spikes, Bugs
- Duration: Multiple sprints (months)
- Example: "VS Code Extension - Complete IDE Integration"

**Story (Level 2)**
- Contains: Tasks, Bugs (story-level)
- Relationships: 
  - `implements` → Epic
  - `implemented-by` → Tasks, Bugs
  - `relates-to` → Spikes (for dependencies)
- Duration: 1 sprint
- Example: "VS Code Extension Package - Complete Implementation"

**Spike (Level 2 - research)**
- Contains: Tasks (optional, for research breakdown)
- Relationships:
  - `implements` → Epic (Spike is child of Epic)
  - `implemented-by` → Tasks (optional)
  - `relates-to` → Stories (Spike informs Story development)
  - `required-by` → Tasks or Stories (blocks implementation)
- Duration: Time-boxed (1-3 days)
- Example: "MCP Server Architecture Research"

**Bug (Level 2 or 2.5 - configurable)**
- Contains: Tasks (fixes)
- Parent Options:
  - **Option 1**: Bug → Story (story-level defect, most common)
  - **Option 2**: Bug → Epic (epic-level defect, impacts multiple stories)
- Relationships:
  - `implements` → Story OR Epic (Bug is child)
  - `affects` → Story (when Bug impacts other stories)
  - `relates-to` → Epic/Story (additional context)
  - `implemented-by` → Tasks (fix implementation)
- Duration: 1 sprint or less
- Example: "Login Validation Fails for Special Characters"

**Task (Level 3)**
- Contains: Nothing (atomic work unit)
- Relationships:
  - `implements` → Story, Spike, or Bug
  - `depends-on` → Other Tasks, Spikes
- Duration: Hours to days
- Example: "Extension Scaffolding - Basic Structure"

### Erlaubte Scrum-Links (Allowed Links)

**Hierarchie (implements/implemented-by):**
- `Epic → Story` (implemented-by)
- `Epic → Spike` (implemented-by)
- `Epic → Bug` (implemented-by) - epic-level defect
- `Story → Task` (implemented-by)
- `Story → Bug` (implemented-by) - story-level defect
- `Spike → Task` (implemented-by, optional)
- `Bug → Task` (implemented-by) - fix implementation
- `Task → Bug` (implements) - solution fixes problem

**Flexible Beziehungen (affects/relates-to):**
- `Bug → Story` (affects) - Bug impacts other stories
- `Bug → Epic` (affects) - Bug impacts other epics
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
│   └── Bug (Level 2.5 - feature-level defect)
│       └── Task (Level 3) - fix
├── Spike (Level 2 - research)
│   └── Task (Level 3, optional)
└── Bug (Level 2 - requirement-level defect)
    └── Task (Level 3) - fix
```

### Regeln für Waterfall-Hierarchie

**Requirement (Level 1)**
- Contains: Features, Spikes, Bugs (requirement-level)
- Relationships: `implemented-by` → Features, Spikes, Bugs
- Phase: Requirements Analysis
- Example: "DevSteps Platform - System Requirements"

**Feature (Level 2)**
- Contains: Tasks, Bugs (feature-level)
- Relationships:
  - `implements` → Requirement
  - `implemented-by` → Tasks, Bugs
  - `relates-to` → Stories (cross-methodology)
- Phase: Design → Implementation
- Example: "VS Code Extension - IDE Integration"

**Spike (Level 2 - research)**
- Contains: Optional Tasks
- Relationships:
  - `implements` → Requirement (Spike is child of Requirement)
  - `implemented-by` → Tasks (optional)
  - `relates-to` → Feature (Spike informs Feature design)
- Phase: Design/Investigation
- Example: "Architecture Research - MCP Protocol"

**Bug (Level 2 or 2.5 - configurable)**
- Contains: Tasks (fixes)
- Parent Options:
  - **Option 1**: Bug → Feature (feature-level defect, most common)
  - **Option 2**: Bug → Requirement (requirement-level defect, impacts multiple features)
- Relationships:
  - `implements` → Feature OR Requirement (Bug is child)
  - `affects` → Feature (when Bug impacts other features)
  - `relates-to` → Requirement/Feature (additional context)
  - `implemented-by` → Tasks (fix implementation)
- Phase: Testing/Maintenance
- Example: "Login Validation Fails for Edge Cases"

**Task (Level 3)**
- Contains: Nothing (atomic work unit)
- Relationships:
  - `implements` → Feature, Spike, or Bug
  - `depends-on` → Other Tasks, Spikes
- Duration: Hours to days
- Phase: Implementation
- Example: "Database Schema - User Tables"

### Erlaubte Waterfall-Links (Allowed Links)

**Hierarchie (implements/implemented-by):**
- `Requirement → Feature` (implemented-by)
- `Requirement → Spike` (implemented-by)
- `Requirement → Bug` (implemented-by) - requirement-level defect
- `Feature → Task` (implemented-by)
- `Feature → Bug` (implemented-by) - feature-level defect
- `Spike → Task` (implemented-by, optional)
- `Bug → Task` (implemented-by) - fix implementation
- `Task → Bug` (implements) - solution fixes problem

**Flexible Beziehungen (affects/relates-to):**
- `Bug → Feature` (affects) - Bug impacts other features
- `Bug → Requirement` (affects) - Bug impacts other requirements
- `Spike → Feature` (relates-to) - Spike informs Feature design
- `Spike → Task` (required-by) - Spike blocks Task
- `Task → Task` (depends-on, blocks)

### Verbotene Waterfall-Links (Forbidden Links)

- ❌ `Requirement → Task` (direct) - must go through Feature/Spike/Bug
- ❌ `Task → Requirement` (implements) - must go through Feature/Spike/Bug
- ❌ `Spike → Feature` (implements) - Spike is sibling of Feature, not child
- ❌ `Bug → Bug` (implements) - no nested Bugs
- ❌ `Spike → Spike` (implements) - no nested Spikes

---

## Visualisierung im TreeView

### Option 1: Flache Gruppierung (EMPFOHLEN für Hybrid)
```
📂 Scrum Workflow
├── 📦 Epics (3)
│   ├── EPIC-001: Platform
│   ├── EPIC-002: Infrastructure ✅
│   └── EPIC-003: VS Code Extension
├── 📖 Stories (4)
│   ├── STORY-001: Shared ✅
│   ├── STORY-002: CLI ✅
│   ├── STORY-003: MCP ✅
│   └── STORY-004: Extension
├── 🔬 Spikes (2)
│   ├── SPIKE-001: MCP Architecture
│   └── SPIKE-002: WebView Performance
└── 📋 Tasks (8)
    ├── TASK-001: Scaffolding
    └── ...

📂 Waterfall Workflow
├── 📋 Requirements (1)
│   └── REQ-001: System Requirements
├── ⚙️ Features (4)
│   ├── FEAT-001: Shared ✅
│   ├── FEAT-002: CLI ✅
│   ├── FEAT-003: MCP ✅
│   └── FEAT-004: Extension
├── 🔬 Spikes (2)
│   └── (shared with Scrum)
└── 📋 Tasks (8)
    └── (shared with Scrum)
```

### Option 2: Hierarchische Ansicht (für Detail-Exploration)
```
📦 EPIC-003: VS Code Extension
├── 📖 STORY-004: Extension Package
│   ├── 📋 TASK-001: Scaffolding
│   ├── 📋 TASK-002: TreeView
│   └── ...
├── 🔬 SPIKE-001: MCP Architecture
│   └── 🔗 blocks: TASK-004
└── 🔬 SPIKE-002: WebView Performance
    └── 🔗 blocks: TASK-005
```

**WICHTIG**: Spikes sind **Geschwister** von Stories, nicht Kinder!

---

## Filter & Anzeige-Optionen (für Dashboard/TreeView)

### Status-Filter
- ✅ Done (7 items)
- 🔄 In Progress (0 items)
- 📝 Draft (15 items)
- ❌ Blocked (0 items)

### Priorität-Filter
- 🔴 Critical (EPIC-001, EPIC-003, STORY-004, FEAT-004, TASK-001, TASK-002, TASK-004)
- 🟠 High (EPIC-002, STORY-002, SPIKE-001, SPIKE-002, ...)
- 🟡 Medium (TASK-007, TASK-008)
- 🟢 Low

### Eisenhower-Matrix
- Q1 (Urgent + Important): EPIC-003, REQ-001, FEAT-004
- Q2 (Not Urgent + Important): SPIKE-001, SPIKE-002
- Q3 (Urgent + Not Important): -
- Q4 (Not Urgent + Not Important): -

### Historische Ansicht
- **Toggle "Show Completed"**: Ein/Aus für erledigte Items
- **Timeline View**: Chronologische Anzeige aller Updates
- **Archive View**: Zugriff auf archivierte Items

---

## MCP Tool Validation Rules (für AI)

### Beim Erstellen von Links:
```typescript
// VALIDIERUNG VOR devsteps-link:
if (source.type === 'spike' && target.type === 'story' && relation === 'implements') {
  throw new Error('Spike cannot implement Story. Spike must implement Epic or Feature!');
}

if (source.type === 'task' && target.type === 'epic' && relation === 'implements') {
  throw new Error('Task cannot implement Epic directly. Task must implement Story/Spike/Bug!');
}

// Korrekte Verwendung:
// Spike unter Epic:
devsteps-link --source SPIKE-001 --relation implements --target EPIC-003

// Spike informiert Story:
devsteps-link --source SPIKE-001 --relation relates-to --target STORY-004

// Spike blockiert Task:
devsteps-link --source SPIKE-001 --relation required-by --target TASK-004
```

### Beim Trace-Command:
- Zeige **alle Ebenen** (auch done items)
- Markiere **Cross-References** (relates-to, depends-on)
- Highlighte **Blocker** (required-by, blocked-by)

---

## Zusammenfassung für AI

**Scrum**: Epic → [Story | Spike | Bug] → Task
**Waterfall**: Requirement → Feature → [Task | Spike | Bug]

**Spike ist IMMER auf gleicher Ebene wie Story/Bug**, nie darunter!
