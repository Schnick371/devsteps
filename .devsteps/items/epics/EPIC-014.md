## Objective

Align DevSteps with Jira 2025 link semantics by removing Azure DevOps-specific relations and migrating blocks to hierarchy.

## Implementation Complete ✅

**Two Stories Completed:**

### STORY-053: Remove Azure DevOps affects/affected-by Relations
1. ✅ TASK-118: Corrected STORY-049 documentation
2. ✅ TASK-119: Removed affects from relationships.ts
3. ✅ TASK-120: Removed affects from schema types + add.ts
4. ✅ TASK-121: Removed affects from MCP handlers/tools
5. ✅ TASK-122: Removed affects from CLI commands
6. ✅ TASK-123: Removed affects from Extension TreeView

### STORY-054: Move blocks/blocked-by to Hierarchy Relations
7. ✅ TASK-125: Added Bug blocks validation rules
8. ✅ TASK-124: Moved blocks to HIERARCHY_RELATIONSHIPS
9. ✅ TASK-126: Updated HIERARCHY-COMPACT.md
10. ✅ TASK-127: Updated AI-GUIDE-COMPACT.md

**Breaking Changes:**
- `affects/affected-by` completely removed from codebase
- `blocks/blocked-by` now hierarchy for Bug, flexible for others
- Bug blocks Epic/Story (Scrum) or Requirement/Feature (Waterfall) validated

**Jira 2025 Standard Achieved:**
- ✅ implements/implemented-by: Standard hierarchy
- ✅ blocks/blocked-by: Hierarchy for Bug, flexible for others
- ✅ relates-to: Flexible cross-references
- ✅ depends-on, tested-by, supersedes: Flexible
- ❌ affects: Removed (Azure DevOps CMMI only)

**Validation:**
- All packages build successfully
- TypeScript compilation clean
- Documentation updated
- 10 commits with full traceability

**Supersedes:** STORY-049 (affects implementation based on incomplete research)