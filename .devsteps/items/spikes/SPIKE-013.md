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

## Directory Structure (Extension Approach)

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

---

## ⚠️ UNRESOLVED QUESTIONS

### 1. Category Decision: Who/What Decides?

**Problem:** `task` and `bug` can exist in BOTH categories. How does CLI/MCP know where to create?

| Approach | Description | Pro | Contra |
|----------|-------------|-----|--------|
| **A: Type-based** | `chore` = always Sprint | Simple | `task`/`bug` ambiguous |
| **B: Explicit Flag** | `--sprint` or `--product` flag | Clear intent | Extra parameter |
| **C: Parent-Inference** | Has parent in `items/` → Product | Automatic | Orphans unclear |
| **D: Interactive** | CLI/AI asks user | User decides | UX overhead |
| **E: Default + Override** | Default to Product, `--ephemeral` for Sprint | Backwards compatible | Must remember flag |

**Current Recommendation:** Hybrid of B + C
- `chore` → Always Sprint (type-based)
- `task` with Product parent → Product (inferred)
- `task` without parent → Prompt or require `--sprint` flag
- `bug` without Product parent → Sprint (inferred)

### 2. Cross-Category Relations

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

### 3. Index Architecture

**Options:**

| Approach | Description | Pro | Contra |
|----------|-------------|-----|--------|
| **A: Single Index** | Both in `index.json` | Simple queries | Sprint pollutes index |
| **B: Dual Index** | `index.json` + `sprint/index.json` | Clean separation | Two files to manage |
| **C: Scoped Index** | `index.json` with `scope` field | Single file, filterable | Schema change |

**Current Recommendation:** B - Dual Index
- `index.json` → Product items only (Git-tracked)
- `sprint/index.json` → Sprint items only (.gitignored)
- Queries can specify scope or merge both

### 4. Lifecycle & Migration

| Situation | Action | Implementation |
|-----------|--------|----------------|
| Sprint item becomes important | Migrate to Product | `devsteps migrate CHORE-001 --to-product` |
| Product item is actually ephemeral | Migrate to Sprint | `devsteps migrate TASK-042 --to-sprint` |
| Sprint item done | Delete (not archive) | Auto-cleanup on `status: done` |
| Product item done | Archive | Existing behavior |

**Migration Command:**
```bash
devsteps migrate <ID> --to-product|--to-sprint
```
- Changes directory location
- Updates index(es)
- Preserves ID or assigns new one?
- Handles relations?

### 5. ID Namespacing

**Problem:** If both have `TASK-001`, collision?

| Approach | Example | Pro | Contra |
|----------|---------|-----|--------|
| **A: Shared Counter** | TASK-001, TASK-002 (global) | No collision | Complex counter |
| **B: Prefix** | S-TASK-001 vs P-TASK-001 | Clear scope | Ugly IDs |
| **C: Separate Counters** | Both can have TASK-001 | Simple | Ambiguous references |

**Current Recommendation:** A - Shared Counter
- Single ID namespace across both scopes
- No ambiguity in references
- Counter in `index.json` (Product) is source of truth

---

## Next Steps

1. **Resolve Questions 1-5** through discussion
2. **Update Architecture** based on decisions
3. **Then** mark Spike as done
4. **Then** refine STORY-090 with implementation details

---

## References

- [Scrum.org: Product Backlog Items VS Technical Tasks](https://www.scrum.org/forum/scrum-forum/98769/product-backlog-items-vs-technical-tasks)
- [Medium: Stop Creating Tech Stories](https://medium.com/codex/stop-creating-technical-stories-f5e7bc424ff8)
- [Mountain Goat Software: Product Backlog](https://www.mountaingoatsoftware.com/agile/scrum/scrum-tools/product-backlog)
- [Atlassian: Product Backlog vs Sprint Backlog](https://www.atlassian.com/agile/project-management/sprint-backlog-product-backlog)