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
| **Persistenz** | Git-verwaltet (`items/`) | Workspace-lokal (`sprint/`) |

## Bug Categorization

| Bug-Typ | Backlog | Begründung |
|---------|---------|------------|
| **Reported Bug** (Benutzer meldet) | Product ✅ | Hat Geschäftsimpact, PO priorisiert |
| **Regression Bug** (nach Release) | Product ✅ | Dokumentationswert, Root Cause Analysis |
| **Sprint Bug** (während Impl. gefunden) | Sprint ⚡ | Ephemer, Teil der aktuellen Arbeit |
| **Test-Fix Bug** (technisches Detail) | Sprint ⚡ | Kein Nutzerwert, nur Umsetzungsdetail |

**Rule:** Bug has customer/tester issue number → Product. Bug is byproduct of current work → Sprint.

---

## Final Architecture Decision

### Directory Structure (Extension Approach)

```
.devsteps/
├── items/           # Product Backlog → Git (unchanged)
│   ├── epics/
│   ├── stories/
│   ├── features/
│   ├── requirements/
│   ├── bugs/        # Reported/Regression Bugs
│   ├── spikes/
│   └── tasks/       # Tasks implementing Stories/Bugs
├── sprint/          # Sprint Backlog → .gitignore (NEW)
│   ├── tasks/       # Implementation details
│   ├── chores/      # Technical tasks without Story
│   └── bugs/        # Sprint-internal bugs
├── archive/         # Product items only
└── index.json
```

### Key Properties

| Aspect | Product (`items/`) | Sprint (`sprint/`) |
|--------|-------------------|-------------------|
| Git-managed | ✅ Yes | ❌ No (.gitignore) |
| Archived | ✅ Yes | ❌ Deleted after done |
| Types | epic, story, feature, requirement, bug, spike, task | chore, task, bug |
| Traceability | ✅ Full | ⚠️ Session-only |

### New Item Type: `chore`

```typescript
type SprintItemType = 'chore' | 'task' | 'bug';

interface ChoreItem {
  id: string;        // CHORE-001
  type: 'chore';
  title: string;
  status: Status;
  // No linked_items, no eisenhower, no archive
}
```

**Chore vs Task:**
- `chore` → Sprint Backlog (technical task without Story, ephemeral)
- `task` → Product Backlog (implements Story/Bug, persisted)

### Routing Logic

```typescript
function getItemPath(item: WorkItem): string {
  // Sprint Backlog items
  if (item.type === 'chore') {
    return '.devsteps/sprint/chores/';
  }
  
  // Sprint bugs (no parent link)
  if (item.type === 'bug' && !hasProductParent(item)) {
    return '.devsteps/sprint/bugs/';
  }
  
  // Product Backlog items (default)
  return `.devsteps/items/${item.type}s/`;
}
```

### .gitignore Addition

```gitignore
# DevSteps Sprint Backlog (ephemeral, not tracked)
.devsteps/sprint/
```

---

## Implementation Steps

1. **Schema**: Add `chore` type to shared types
2. **Core**: Implement `sprint/` directory routing
3. **MCP Tools**: Transparent handling (same tools, different paths)
4. **Cleanup**: Auto-delete sprint items on `status: done`
5. **gitignore**: Add `.devsteps/sprint/` to template
6. **AI Instructions**: Update agent guidelines for chore vs task

---

## Success Criteria

1. ✅ Clear recommendation: **Extension approach with `sprint/` directory**
2. ✅ Implementation proposal defined
3. ⏳ AI agent instructions update (after implementation)

## References

- [Scrum.org: Product Backlog Items VS Technical Tasks](https://www.scrum.org/forum/scrum-forum/98769/product-backlog-items-vs-technical-tasks)
- [Medium: Stop Creating Tech Stories](https://medium.com/codex/stop-creating-technical-stories-f5e7bc424ff8)
- [Mountain Goat Software: Product Backlog](https://www.mountaingoatsoftware.com/agile/scrum/scrum-tools/product-backlog)
- [Atlassian: Product Backlog vs Sprint Backlog](https://www.atlassian.com/agile/project-management/sprint-backlog-product-backlog)