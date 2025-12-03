## Objective

Move `blocks/blocked-by` from FLEXIBLE to HIERARCHY relationships, enabling Bug→Epic/Story/Requirement/Feature hierarchy (Jira 2025 alignment).

## Implementation Complete ✅

**All 4 Tasks Completed:**

1. ✅ TASK-125: Added Bug blocks validation rules in validation.ts
2. ✅ TASK-124: Moved blocks to HIERARCHY_RELATIONSHIPS in relationships.ts
3. ✅ TASK-126: Updated HIERARCHY-COMPACT.md documentation
4. ✅ TASK-127: Updated AI-GUIDE-COMPACT.md for MCP agents

**Breaking Changes:**
- blocks/blocked-by now enforce Bug→Epic/Story/Requirement/Feature hierarchy
- Non-Bug blocks (Story→Story, Task→Task) bypass validation (remain flexible)
- Validation activates Jira 2025 standard for Bug blocking relationships

**Validation Results:**
- ✅ All packages build successfully
- ✅ TypeScript compilation clean
- ✅ Documentation reflects Jira 2025 semantics
- ✅ Supersedes STORY-049 (affects removal)

**Commits:**
- bc1df8d: TASK-125 validation rules
- b9073f9: TASK-124 relationships array
- adaeb47: TASK-126 hierarchy docs
- [current]: TASK-127 AI guide docs