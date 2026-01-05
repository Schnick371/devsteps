## Research Question

How should DevSteps handle **ephemeral/technical tasks** that don't require long-term traceability?

## Core Distinction

| Aspekt | Product Backlog (DevSteps) | Sprint Backlog (ephemere Tasks) |
|--------|---------------------------|--------------------------------|
| **Zweck** | Langfristige Traceability & Dokumentation | Kurzfristige Ausführungsplanung |
| **Lebensdauer** | Unbegrenzt (Archiviert, nie gelöscht) | Sprint-Dauer (2-4 Wochen) |
| **Wert** | Geschäfts-/Nutzerwert | Technischer Umsetzungsschritt |
| **Owner** | Product Owner/Team | Developers |
| **Granularität** | WHY + WHAT | HOW |
| **Beispiele** | Epic, Story, Feature, Bug | Fix Tests, Refactoring, Code Review Findings |
| **Persistenz** | Git-verwaltet | Workspace-lokal |

## Background

AI agents (like GitHub Copilot) often create standalone Tasks for immediate technical fixes (e.g., "Fix Mock Assertions for Config Functions"). These tasks:
- Have no connection to Stories/Features
- Provide no long-term documentation value
- Clutter the archive with noise
- Don't represent requirements or implementations

**Key Insight:** DevSteps as AI-Developer bridge should track BOTH - but persist them DIFFERENTLY.

---

## Architecture Options

### Option A: Directory Separation with .gitignore

```
.devsteps/
├── items/           # Product Backlog → Git-managed
│   ├── epics/
│   ├── stories/
│   └── bugs/
├── sprint/          # Sprint Backlog → .gitignore
│   ├── tasks/
│   └── chores/
└── archive/         # Product Backlog only
```

| Pro | Contra |
|-----|--------|
| Clear physical separation | Sprint items lost on workspace switch |
| Simple .gitignore rule | No team sync for sprint items |
| Same MCP tools work for both | Explicit folder convention needed |

### Option B: Ephemeral-Flag with Auto-Cleanup

```json
{
  "id": "TASK-042",
  "type": "task",
  "ephemeral": true,
  "title": "Fix mock assertions"
}
```

**Behavior:** `ephemeral: true` → Deleted on `status: done` (not archived)

| Pro | Contra |
|-----|--------|
| Unified system | Items temporarily in Git history |
| No separate directory structure | Less clear separation |
| Flag-based, flexible | Requires schema change |

### Option C: Workspace-local Cache (RECOMMENDED)

```
.devsteps/
├── items/           # Product Backlog → Git
├── archive/         # Long-term archive → Git
└── .local/          # Sprint Backlog → .gitignore
    ├── sprint/
    │   ├── CHORE-001.json
    │   └── CHORE-001.md
    └── session.json # Current sprint metadata
```

**Key Properties:**
- **Product Backlog**: Git-managed as before
- **Sprint Backlog**: In `.devsteps/.local/` (auto-gitignored by `.`-prefix convention)
- **Same item structure**: JSON + MD, same tools
- **New type `chore`**: Automatically stored in `.local/sprint/`

**MCP-Tool Routing Logic:**
```typescript
function getItemPath(item: WorkItem): string {
  if (item.type === 'chore' || item.ephemeral) {
    return '.devsteps/.local/sprint/';
  }
  return `.devsteps/items/${item.type}s/`;
}
```

| Pro | Contra |
|-----|--------|
| Clear separation (Git vs. local) | No team sync (by design) |
| Sprint items trackable by AI | Need `.local` directory creation |
| No Git pollution | New convention to learn |
| `.local` convention (like `.git`, `.vscode`) | |
| Session-persistent until explicitly deleted | |

---

## Comparison Matrix

| Aspect | Option A | Option B | Option C |
|--------|----------|----------|----------|
| Git separation | ✅ Clear | ⚠️ Temporary | ✅ Clear |
| Unified system | ✅ | ✅ | ✅ |
| Convention-based | ⚠️ Explicit | ✅ Flag | ✅ `.local` |
| Complexity | Low | Medium | Low |
| Team sync possible | ❌ | ⚠️ | ❌ (by design) |

---

## Recommendation: Option C

**Why `.devsteps/.local/`?**

1. **Convention follows practice**: Like `.git/`, `.vscode/`, `.cache/`
2. **Auto-gitignored**: Many templates already ignore `.*` subdirectories
3. **Semantically clear**: "local" = workspace-local, not shared
4. **Future-proof**: Can later hold session data, caches, etc.

**New Item Types:**
- `chore` → Sprint Backlog (technical task without Story)
- `task` → Product Backlog (implements Story/Bug)

**Implementation Steps:**
1. Add `chore` type to shared schema
2. Implement `.local` directory routing in core
3. Update MCP tools for transparent handling
4. Add `.devsteps/.local/` to default .gitignore
5. Update AI agent instructions

---

## Success Criteria

1. ✅ Clear recommendation: **Option C - `.devsteps/.local/`**
2. Implementation proposal defined above
3. AI agent instructions update needed after implementation

## References

- [Scrum.org: Product Backlog Items VS Technical Tasks](https://www.scrum.org/forum/scrum-forum/98769/product-backlog-items-vs-technical-tasks)
- [Medium: Stop Creating Tech Stories](https://medium.com/codex/stop-creating-technical-stories-f5e7bc424ff8)
- [Mountain Goat Software: Product Backlog](https://www.mountaingoatsoftware.com/agile/scrum/scrum-tools/product-backlog)
- [Atlassian: Product Backlog vs Sprint Backlog](https://www.atlassian.com/agile/project-management/sprint-backlog-product-backlog)