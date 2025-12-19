# Story: AI-Powered Path Conflict Detection

## User Value
**As a** DevSteps developer,  
**I want** automatic detection of overlapping affected_paths with proactive warnings,  
**so that** I avoid redundant work and conflicts with other work items.

## Context

Multiple work items may affect the same files/directories. Currently, developers must manually search for overlapping work, leading to:
- Duplicate implementations
- Merge conflicts
- Wasted effort on already-completed work

## Acceptance Criteria

### Automatic Link Creation
- [ ] When work item marked as `done`, MCP scans open items for path overlap
- [ ] Creates `potentially-affects` / `potentially-affected-by` links automatically
- [ ] Uses glob pattern matching for intelligent path comparison

### Proactive Warnings
- [ ] **Status → in-progress**: Critical warning if overlapping items exist
- [ ] **Work item creation**: Informational notice during planning
- [ ] **Pre-commit**: Final safety check before committing changes

### Warning Format
```
⚠️  Potentially affected by STORY-023 (in-progress)
   Overlapping paths: .github/agents/*.agent.md
   Suggestion: Review implementation to avoid conflicts
```

### AI-Enhanced Detection (AITK Integration)
- [ ] Use AI Toolkit evaluation for smart conflict analysis
- [ ] Distinguish between real conflicts vs. safe parallel work
- [ ] Context-aware suggestions (not just path string matching)

## Implementation Notes

**Relation Type:** `potentially-affects` / `potentially-affected-by`
- Non-hierarchical (horizontal like `relates-to`)
- Signals uncertainty (overlap detection, not guaranteed conflict)
- Actionable (developer evaluates actual impact)

**Scope:** File/directory paths only (NO function-level tracking)
- Current `affected_paths` approach sufficient
- Keeps DevSteps lean and performant

**Integration Points:**
- MCP `update` tool (status change detection)
- MCP `add` tool (creation-time warnings)
- CLI `start` command (pre-work warnings)

## Dependencies

- AI Toolkit integration (EPIC-022)
- MCP server path comparison logic
- Link relationship support for new relation type

## Technical Considerations

**Performance:** Path comparison should be fast (glob matching, not AI for every check)
**AI Usage:** Reserve AITK evaluation for ambiguous cases only
**Alert Fatigue:** Warnings must be actionable, not noise