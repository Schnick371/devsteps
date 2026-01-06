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

---

## 🏆 FINAL RECOMMENDATION: Phased Approach

### Analysis: Is Two-Backlog Solution Over-Engineered?

**Original Problem:**
> AI creates standalone Task "Fix Mock Assertions" - shouldn't be archived

**Proposed Complex Solution:**
> Complete architecture overhaul with two indexes, cross-category rules, migration commands

**Assessment:** The complexity is **disproportionate** to the problem.

### Implications of Two-Backlog Architecture

| Implication | Impact | Severity |
|-------------|--------|----------|
| **Two Truths** | Local sprint items invisible to team | ⚠️ Medium |
| **Git History Orphans** | Commits reference deleted items | ⚠️ Medium |
| **Tooling Complexity** | Every function needs scope awareness | 🔴 High |
| **Relation Complexity** | Cross-category link validation | 🔴 High |
| **Migration Ugliness** | ID changes, schema differences | 🔴 High |
| **User Mental Model** | "Where does this go?" confusion | ⚠️ Medium |

### Phase 1: Minimal Viable Solution (RECOMMENDED)

**Changes:**
1. **New type `chore`** - For technical work without Story parent
2. **`ephemeral` flag** - Can be set on any item type
3. **Auto-delete on done** - If `ephemeral: true`, delete instead of archive
4. **Improved AI instructions** - Clear rules when to use what

**Implementation:**
```typescript
interface WorkItem {
  id: string;
  type: ItemType;  // Add 'chore' to union
  ephemeral?: boolean;  // NEW: Optional flag
  // ...existing fields
}

// On status change to 'done':
if (item.ephemeral) {
  await deleteItem(item.id);  // Not archive
} else {
  await archiveItem(item.id);
}
```

**Advantages:**
- ✅ Minimal code changes
- ✅ Single index, single directory
- ✅ No migration needed (just change flag)
- ✅ Backwards compatible

**Disadvantages:**
- ⚠️ Ephemeral items still in Git history until deleted

---

## 🔄 Integration with Workflow Prompts

### Prompt Alignment Strategy

**Existing Prompts:**
- `devsteps-plan-work.prompt.md` → Planning in main branch
- `devsteps-start-work.prompt.md` → Start work on item (creates feature branch)
- `devsteps-sprint-execution.prompt.md` → Sprint orchestration (should rename to `devsteps-start-sprint.prompt.md`)
- `devsteps-workflow.prompt.md` → Ongoing development work

**Naming Consistency:**
```
devsteps-plan-work.prompt.md      → Planning phase
devsteps-start-work.prompt.md     → Start work item
devsteps-start-sprint.prompt.md   → Start sprint (RENAME NEEDED)
devsteps-workflow.prompt.md       → During work/sprint execution
```

### Phase 1 Integration Points

#### In devsteps-plan-work.prompt.md
**Add guidance:**
- When to use `chore` vs `task`
- When to set `ephemeral: true`
- Rule: "No parent Story? Consider chore or skip DevSteps entirely"

#### In devsteps-start-sprint.prompt.md (renamed)
**Add section:**
- Sprint tasks can have `ephemeral: true` flag
- Cherry-pick still works (same directory structure)
- On sprint completion: ephemeral items auto-deleted

#### In devsteps-workflow.prompt.md
**Add guidance:**
- Creating chores during development
- When technical work belongs in DevSteps vs just commit message

### Open Questions for Workflow Integration

1. **Chore Creation During Work:**
   - Can devsteps-start-work create chores?
   - Or only via plan-work?
   - Should AI ask: "Is this Product or ephemeral?"

2. **Sprint Workflow:**
   - Are all sprint tasks ephemeral by default?
   - Or only chores?
   - How does devsteps-start-sprint flag items?

3. **Workflow Transitions:**
   - Can ephemeral items become permanent?
   - Migration command needed? Or just change flag?

4. **Branch Strategy Compatibility:**
   - Feature branches still used for chores?
   - Or chores developed directly in sprint branch?
   - How does this affect cherry-pick strategy?

---

## Phase 2: Sprint Backlog (Only If Phase 1 Insufficient)

After 3-6 months, evaluate:
- Is archive still too noisy?
- Do we need Git separation?
- Then consider full Sprint Backlog implementation

### Previous Architecture Analysis (Preserved)

#### Directory Structure Option (Evaluated but NOT Recommended for Phase 1)

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

#### Unresolved Questions (For Phase 2 if needed)

##### 1. Category Decision: Who/What Decides?

**Problem:** `task` and `bug` can exist in BOTH categories. How does CLI/MCP know where to create?

| Approach | Description | Pro | Contra |
|----------|-------------|-----|--------|
| **A: Type-based** | `chore` = always Sprint | Simple | `task`/`bug` ambiguous |
| **B: Explicit Flag** | `--sprint` or `--product` flag | Clear intent | Extra parameter |
| **C: Parent-Inference** | Has parent in `items/` → Product | Automatic | Orphans unclear |
| **D: Interactive** | CLI/AI asks user | User decides | UX overhead |
| **E: Default + Override** | Default to Product, `--ephemeral` for Sprint | Backwards compatible | Must remember flag |

##### 2. Cross-Category Relations

**Scenario:** `CHORE-001` (sprint) relates to `STORY-042` (product)

| Direction | Allowed? | Risk |
|-----------|----------|------|
| Sprint → Product | ✅ Yes | None (Product is persistent) |
| Product → Sprint | ⚠️ Dangerous | Sprint item disappears, broken link |

**Proposed Rules:**
1. Sprint items MAY reference Product items (`relates-to`, `implements`)
2. Product items MUST NOT reference Sprint items
3. On Sprint item deletion: No cleanup needed (one-way reference)
4. Validation: Block `mcp_devsteps_link` if Product → Sprint

##### 3. Index Architecture

| Approach | Description | Pro | Contra |
|----------|-------------|-----|--------|
| **A: Single Index** | Both in `index.json` | Simple queries | Sprint pollutes index |
| **B: Dual Index** | `index.json` + `sprint/index.json` | Clean separation | Two files to manage |
| **C: Scoped Index** | `index.json` with `scope` field | Single file, filterable | Schema change |

##### 4. Lifecycle & Migration

| Situation | Action | Implementation |
|-----------|--------|----------------|
| Sprint item becomes important | Migrate to Product | `devsteps migrate CHORE-001 --to-product` |
| Product item is actually ephemeral | Migrate to Sprint | `devsteps migrate TASK-042 --to-sprint` |
| Sprint item done | Delete (not archive) | Auto-cleanup on `status: done` |
| Product item done | Archive | Existing behavior |

##### 5. ID Namespacing

| Approach | Example | Pro | Contra |
|----------|---------|-----|--------|
| **A: Shared Counter** | TASK-001, TASK-002 (global) | No collision | Complex counter |
| **B: Prefix** | S-TASK-001 vs P-TASK-001 | Clear scope | Ugly IDs |
| **C: Separate Counters** | Both can have TASK-001 | Simple | Ambiguous references |

---

## Next Steps (DO NOT IMPLEMENT YET)

1. **Resolve workflow integration questions** (above)
2. **Update prompts** with ephemeral guidance
3. **Rename** devsteps-sprint-execution.prompt.md → devsteps-start-sprint.prompt.md
4. **Then** update spike status and refine STORY-090

---

## Success Criteria

1. ✅ Clear recommendation: **Phase 1 - `chore` type + `ephemeral` flag**
2. ✅ Phase 2 architecture documented for future reference
3. ✅ Workflow integration considerations documented
4. ⏳ Open questions for workflow prompts identified
5. ⏳ AI agent instructions update (after implementation)

## References

- [Scrum.org: Product Backlog Items VS Technical Tasks](https://www.scrum.org/forum/scrum-forum/98769/product-backlog-items-vs-technical-tasks)
- [Medium: Stop Creating Tech Stories](https://medium.com/codex/stop-creating-technical-stories-f5e7bc424ff8)
- [Mountain Goat Software: Product Backlog](https://www.mountaingoatsoftware.com/agile/scrum/scrum-tools/product-backlog)
- [Atlassian: Product Backlog vs Sprint Backlog](https://www.atlassian.com/agile/project-management/sprint-backlog-product-backlog)