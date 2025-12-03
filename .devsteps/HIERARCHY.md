# DevSteps Hierarchie-Definitionen (Hybrid Methodology)

## Validierte Scrum/Agile Hierarchie

```
Theme (strategisch, optional)
└── Initiative (optional)
    └── Epic (Level 1)
        ├── Story (Level 2) → Task (Level 3)
        ├── Spike (Level 2) → Task (Level 3, optional)
        └── Bug (Level 2) → Task (Level 3, optional)
```

### Regeln für Scrum-Hierarchie

**Epic (Level 1)**
- Contains: Stories, Spikes, Bugs (NOT Tasks directly!)
- Relationships: `implemented-by` → Stories, Spikes, Bugs
- Duration: Multiple sprints (months)
- Example: "VS Code Extension - Complete IDE Integration"

**Story (Level 2)**
- Contains: Tasks
- Relationships: 
  - `implements` → Epic
  - `implemented-by` → Tasks
  - `relates-to` → Spikes (for dependencies)
- Duration: 1 sprint
- Example: "VS Code Extension Package - Complete Implementation"

**Spike (Level 2 - same level as Story!)**
- Contains: Tasks (optional, for research breakdown)
- Relationships:
  - `implements` → Epic (NOT Story!)
  - `required-by` → Tasks or Stories (blocks implementation)
  - `relates-to` → Stories (informs development)
- Duration: Time-boxed (1-3 days)
- Example: "MCP Server Architecture Research"

**Bug (Level 2 - same level as Story!)**
- Contains: Tasks (fixes)
- Relationships:
  - `affects` → Epic (discovered defect impacts epic)
  - `relates-to` → Epic/Story (general context)
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
- `Story → Task` (implemented-by)
- `Spike → Task` (implemented-by, optional)
- `Bug → Task` (implemented-by)

**Bug-Beziehungen (Bug Relationships):**
- `Bug → Epic` (affects, relates-to) - NOT implements!
- `Bug → Story` (affects, relates-to) - discovered defect
- `Task → Bug` (implements) - solution fixes problem

**Flexible Beziehungen:**
- `Spike → Story` (relates-to) - Spike informs Story
- `Spike → Task` (required-by) - Spike blocks Task
- `Task → Task` (depends-on, blocks)

### Verbotene Scrum-Links (Forbidden Links)

- ❌ `Epic → Task` (direct) - must go through Story/Spike/Bug
- ❌ `Bug → Epic` (implements) - use affects or relates-to!
- ❌ `Spike → Story` (implements) - Spike is NOT under Story!
- ❌ `Task → Epic` (implements) - only through Story/Spike/Bug

---

## Validierte Waterfall Hierarchie

```
Requirement (Level 1)
└── Feature (Level 2)
    ├── Task (Level 3)
    └── Spike (Level 2.5 - research before implementation)

Bug (Level 2 - NOT a child, uses affects/relates-to)
```

### Regeln für Waterfall-Hierarchie

**Requirement (Level 1)**
- Contains: Features
- Relationships: `implemented-by` → Features
- Phase: Requirements Analysis
- Example: "DevSteps Platform - System Requirements"

**Feature (Level 2)**
- Contains: Tasks, Spikes
- Relationships:
  - `implements` → Requirement
  - `implemented-by` → Tasks
  - `relates-to` → Stories (cross-methodology)
- Phase: Design → Implementation
- Example: "VS Code Extension - IDE Integration"

**Bug (Level 2 - same level as Feature!)**
- Contains: Tasks (fixes)
- Relationships:
  - `affects` → Requirement (discovered defect impacts requirement)
  - `affects` → Feature (discovered defect impacts feature)
  - `relates-to` → Requirement/Feature (general context)
  - `implemented-by` → Tasks (fix implementation)
- Phase: Testing/Maintenance
- Example: "Login Validation Fails for Edge Cases"

**Spike (Level 2.5 - research)**
- Contains: Optional Tasks
- Relationships:
  - `implements` → Feature (NOT nested under Feature)
  - `required-by` → Tasks
- Phase: Design/Investigation

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
- `Feature → Task` (implemented-by)
- `Spike → Task` (implemented-by, optional)
- `Bug → Task` (implemented-by)

**Bug-Beziehungen (Bug Relationships):**
- `Bug → Requirement` (affects, relates-to) - NOT implements!
- `Bug → Feature` (affects, relates-to) - discovered defect
- `Task → Bug` (implements) - solution fixes problem

**Flexible Beziehungen:**
- `Spike → Feature` (relates-to) - Spike informs Feature
- `Spike → Task` (required-by) - Spike blocks Task
- `Task → Task` (depends-on, blocks)

### Verbotene Waterfall-Links (Forbidden Links)

- ❌ `Requirement → Task` (direct) - must go through Feature/Spike/Bug
- ❌ `Bug → Requirement` (implements) - use affects or relates-to!
- ❌ `Spike → Feature` (implements) - Spike is NOT under Feature!
- ❌ `Task → Requirement` (implements) - only through Feature/Spike/Bug

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
