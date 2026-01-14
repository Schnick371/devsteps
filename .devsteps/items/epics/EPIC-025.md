# Epic: Implement Copilot Standards - Branch Hygiene, File Management, Executor Pattern

## Business Value

**Problem:** New Copilot instruction files define critical workflow standards that aren't yet enforced in the DevSteps system. These include:
- Immediate branch merge/archive discipline
- Temporary file output location enforcement
- Coordinator planner-executor separation pattern

**Solution:** Implement enforcement mechanisms and tooling to ensure compliance with documented Copilot standards.

**Impact:**
- Clean remote repository (no stale remote branches)
- Local forensics preserved (archived branches for reference)
- Organized output locations (no root clutter)
- Clear separation of concerns (planning vs. execution)
- Improved traceability and workflow discipline

## Documented Standards (Source of Truth)

### New Instruction Files
1. **devsteps-git-hygiene.instructions.md**
   - Feature branches are ephemeral
   - Merge immediately after `done` status
   - **Remote**: Delete after merge (clean remote)
   - **Local**: Rename to `archive/merged/<name>` (preserve history)
   - Flag branches older than 1 day without merge

2. **temporary-files.instructions.md**
   - NEVER create temp files in project root
   - Designated output directories: `Tests/`, `.devsteps/reports/`, `Logs/`
   - Prohibited: `*-REPORT-*.md`, `EPIC-*.md`, `STORY-*.md` in root

3. **Coordinator Executor Mode** (devsteps-coordinator.agent.md)
   - Coordinator executes plans from sub-agents
   - Delegate analysis/planning to specialists
   - Parallel planning capability

### Modified Workflows
- devsteps-start-work.prompt.md: Step 8 emphasizes immediate merge/cleanup
- devsteps-workflow.prompt.md: "Merge Discipline" section added

## Scope

### In Scope
- Git branch age detection and warnings
- Automated branch cleanup prompts (remote delete + local archive)
- Temporary file location validation
- Pre-commit hooks for file hygiene
- Coordinator delegation patterns
- Parallel planning infrastructure

### Out of Scope
- Automated force-deletion of local branches
- Modification of existing git history
- Changes to core DevSteps data structures

## Success Criteria

1. **Branch Hygiene**: CLI warns about branches older than 1 day
2. **Branch Cleanup**: Automated remote delete + local archive workflow
3. **File Management**: Pre-commit hook blocks temp files in root
4. **Executor Pattern**: Coordinator properly delegates to sub-agents
5. **Documentation**: All enforcement mechanisms documented
6. **Testing**: Automated tests validate standards compliance
/home/th/dev/projekte/playground/devsteps/.devsteps/docs/architecture/repository-strategy.md to the c
## Related Work

- EPIC-005: Workflow Governance
- EPIC-006: Project Health & Data Integrity
- EPIC-024: Story Lifecycle Management

## Timeline

**Priority:** Q2 2026 (urgent-important - standards already documented)
**Dependencies:** None (builds on existing infrastructure)
**Risk:** Low - incremental enforcement