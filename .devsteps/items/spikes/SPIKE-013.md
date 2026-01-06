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

## 🔍 Industry Research: Best Practices

### Finding 1: No Standard for "Ephemeral Work Items"

**Reality Check:**
> There is NO established industry pattern for ephemeral work items in tracking systems.

**What exists:**
- Jira: NO auto-delete for done items ([Atlassian Community](https://community.atlassian.com/forums/Jira-questions/Done-Tasks-Automatically-Deleting/qaq-p/2282300))
- Azure DevOps: Manual delete to Recycle Bin, restore option ([Microsoft Learn](https://learn.microsoft.com/en-us/azure/devops/boards/backlogs/remove-delete-work-items))
- Linear: Auto-archive completed cycles (but preserved)

**Key Insight:** DevSteps' ephemeral concept is **NOVEL** - no direct precedent!

---

### Finding 2: Backlog Hygiene Is Manual

**Industry Practice:**
- Regular backlog grooming/refinement sessions
- Manual cleanup of stale items
- Archive/close old items periodically
- **NO automation for auto-deletion**

**DEEP Framework (Backlog Management):**
- **D**etailed appropriately
- **E**stimated
- **E**mergent  
- **P**rioritized

**But:** No "Delete after done" in any framework!

**Source:** [Christian Strunk](https://www.christianstrunk.com/blog/backlog-management), [Adobe Business](https://business.adobe.com/blog/basics/backlog-grooming)

---

### Finding 3: Sprint Backlog vs Product Backlog (Industry Standard)

| Aspect | Product Backlog | Sprint Backlog |
|--------|-----------------|----------------|
| Owner | Product Owner | Development Team |
| Scope | All future work | Current sprint only |
| Timeframe | Ongoing (months/years) | Sprint duration (1-4 weeks) |
| Changes | Can change anytime | **Locked during sprint** |
| Detail Level | High-level → detailed | Fully detailed |
| **Persistence** | Permanent | **LOCKED but PERMANENT** ⚠️ |

**Critical Finding:** Even sprint backlogs are NOT deleted after sprint ends!

**Industry Standard:** 
- Sprint completes → Items archived/closed
- History preserved for velocity tracking
- Retrospectives need access to what was done

**Source:** [Christian Strunk](https://www.christianstrunk.com/blog/backlog-management)

---

### Finding 4: Git Branch Strategy for Technical Work

**Feature Branch Workflow (Microsoft, GitKraken):**
1. `main` - production-ready
2. `develop` - integration branch
3. `feature/*` - all new work (including chores!)
4. After merge → delete feature branch

**Key Insight:** Technical tasks get feature branches too, but **branches are ephemeral, not work items**!

**Sources:**
- [Microsoft Azure DevOps](https://learn.microsoft.com/en-us/azure/devops/repos/git/git-branching-guidance)
- [GitKraken Best Practices](https://www.gitkraken.com/learn/git/best-practices/git-branch-strategy)

**Implication for DevSteps:**
- Chores should use feature branches (existing pattern)
- Ephemeral flag controls archiving, NOT branching

---

### Finding 5: AI Agent Automation Patterns

**Microsoft Copilot Agents:**
- **Task automation** - Repetitive work
- **Workflow automation** - Multi-step processes  
- **Decision support** - Based on data/patterns

**But NO guidance on:**
- How agents decide work item types
- When to create vs skip work items
- Auto-cleanup of temporary items

**Key Insight:** AI agent work item creation is **uncharted territory**!

**Sources:**
- [Microsoft Copilot AI Agents](https://www.microsoft.com/en-us/microsoft-copilot/copilot-101/ai-agents-types-and-uses)
- [Copilot Studio](https://www.microsoft.com/en-us/microsoft-365-copilot/microsoft-copilot-studio)

---

### Finding 6: Automation Best Practices

**Industry Trends:**
- Auto-triage rules (Linear)
- Status automation based on triggers
- Auto-archiving of **completed cycles** (not individual items)
- Recurring task generation

**What's MISSING:**
- Auto-deletion of done items
- Ephemeral work item lifecycle
- AI-driven type selection

**Source:** [ZenHub Sprint Planning Tools](https://www.zenhub.com/blog-posts/the-best-sprint-planning-tools-for-project-managers-2025)

---

## 💡 Research Conclusions

### 1. DevSteps Is Pioneering

**Unique aspects:**
- AI-generated ephemeral work items → **Novel**
- Auto-delete on done → **No precedent**
- Product/Sprint separation in ONE tool → **Uncommon**

**We're NOT following patterns - we're creating them!**

### 2. Closest Analogies

| DevSteps Concept | Industry Equivalent | Difference |
|------------------|---------------------|------------|
| `chore` type | Sprint technical task | We track it, they often don't |
| `ephemeral` flag | Feature branch lifecycle | We apply to items, not branches |
| Product/Sprint split | Jira Product vs Sprint Backlog | Ours is in ONE system |

### 3. What We CAN Learn

**From Backlog Management:**
- Clear ownership (PO vs Team)
- DEEP framework (detail levels)
- Regular refinement cadence

**From Git Workflows:**
- Feature branches for isolation
- Delete branches, not work items
- Cherry-pick for aggregation

**From AI Automation:**
- Rule-based triggers
- Context-aware decisions
- Human oversight checkpoints

---

## 🏆 FINAL RECOMMENDATION: Phased Approach (Updated)

### Phase 1: Minimal Viable Solution (RECOMMENDED)

**Changes:**
1. **New type `chore`** - For technical work without Story parent
2. **`ephemeral` flag** - Can be set on any item type
3. **Auto-delete on done** - If `ephemeral: true`, delete instead of archive
4. **Improved AI instructions** - Clear rules when to use what

**Rationale from Research:**
- Industry has NO auto-delete precedent → We're experimenting
- Start simple, validate concept before complex architecture
- Backlog hygiene is normally manual → Automate carefully

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
  await deleteItem(item.id);  // Not archive - NOVEL APPROACH
} else {
  await archiveItem(item.id);
}
```

### Phase 1 Risks (From Research)

| Risk | Mitigation |
|------|------------|
| Lost work history | Keep deletion in Git log, add "deleted" event |
| Velocity tracking broken | Only auto-delete chores, not tasks |
| Team confusion | Clear docs, opt-in via flag |
| AI over-deletion | Require explicit `ephemeral: true` |

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
   - Feature branches still used for chores? ✅ YES (from research)
   - Or chores developed directly in sprint branch? ❌ NO (anti-pattern)
   - How does this affect cherry-pick strategy? → No impact

### Answers from Research

**Question 4 - RESOLVED:**
> Feature branches for ALL work (including chores) - industry standard

**Feature Branch Workflow applies:**
1. Create `chore/CHORE-001` branch from `main` or `sprint/*`
2. Develop and commit
3. Merge/cherry-pick to target branch
4. Delete feature branch
5. Auto-delete work item if `ephemeral: true`

**Separation:** Branches are ephemeral (always), work items are conditional

---

## Phase 2: Sprint Backlog (Only If Phase 1 Insufficient - Research Says Unlikely)

**Research Finding:** Industry keeps sprint history PERMANENTLY for:
- Velocity calculations
- Retrospectives
- Audit trails

**Recommendation:** Phase 2 may NOT be needed if Phase 1 works!

### Previous Architecture Analysis (Preserved for Reference)

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

#### Unresolved Questions (For Phase 2 - Likely NOT Needed)

[Previous analysis preserved but deprioritized based on research]

---

## Next Steps (DO NOT IMPLEMENT YET)

1. ✅ **Research complete** - Industry has no precedent, we're pioneering
2. ⏳ **Resolve workflow integration questions** (1-3 above, #4 resolved)
3. ⏳ **Update prompts** with ephemeral guidance
4. ⏳ **Rename** devsteps-sprint-execution.prompt.md → devsteps-start-sprint.prompt.md
5. ⏳ **Then** mark spike done and create implementation story

---

## Success Criteria

1. ✅ Clear recommendation: **Phase 1 - `chore` type + `ephemeral` flag**
2. ✅ Phase 2 architecture documented (but likely unnecessary)
3. ✅ Workflow integration considerations documented
4. ✅ **Industry research complete** - Confirmed DevSteps is pioneering
5. ⏳ Open questions for workflow prompts (3 of 4 resolved)
6. ⏳ AI agent instructions update (after implementation)

## References

### Original Sources
- [Scrum.org: Product Backlog Items VS Technical Tasks](https://www.scrum.org/forum/scrum-forum/98769/product-backlog-items-vs-technical-tasks)
- [Medium: Stop Creating Tech Stories](https://medium.com/codex/stop-creating-technical-stories-f5e7bc424ff8)
- [Mountain Goat Software: Product Backlog](https://www.mountaingoatsoftware.com/agile/scrum/scrum-tools/product-backlog)
- [Atlassian: Product Backlog vs Sprint Backlog](https://www.atlassian.com/agile/project-management/sprint-backlog-product-backlog)

### Research Sources (2026-01-06)
- [Azure DevOps: Delete Work Items](https://learn.microsoft.com/en-us/azure/devops/boards/backlogs/remove-delete-work-items)
- [Jira: Done Tasks NOT Auto-Deleted](https://community.atlassian.com/forums/Jira-questions/Done-Tasks-Automatically-Deleting/qaq-p/2282300)
- [Christian Strunk: Backlog Management](https://www.christianstrunk.com/blog/backlog-management)
- [Microsoft: Git Branching Guidance](https://learn.microsoft.com/en-us/azure/devops/repos/git/git-branching-guidance)
- [GitKraken: Feature Branch Best Practices](https://www.gitkraken.com/learn/git/best-practices/git-branch-strategy)
- [Microsoft Copilot: AI Agents](https://www.microsoft.com/en-us/microsoft-copilot/copilot-101/ai-agents-types-and-uses)
- [ZenHub: Sprint Planning Tools](https://www.zenhub.com/blog-posts/the-best-sprint-planning-tools-for-project-managers-2025)