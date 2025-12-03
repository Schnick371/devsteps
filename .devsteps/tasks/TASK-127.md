## Objective

Update AI-GUIDE-COMPACT.md to explain Jira blocks semantics (hierarchy + flexible).

## Changes

**File: .devsteps/AI-GUIDE-COMPACT.md**

**Section "Relation Types" - Lines ~80-115:**

**Update implements section:**
```markdown
**implements (strict hierarchy):**
- Parent-child relationships only
- Scrum: Epic→Story|Spike, Story→Task, Bug→Task
- Waterfall: Requirement→Feature|Spike, Feature→Task, Bug→Task
```

**Update blocks section (currently line ~95):**
```markdown
**blocks/blocked-by (dual purpose - Jira 2025):**
- **Hierarchy mode**: Bug blocks Epic/Story/Requirement/Feature (parent-child + blocking)
- **Flexible mode**: Story→Story, Task→Task, etc. (sequencing/dependencies, no validation)
- Jira semantics: One issue prevents another from progressing
- Use for Bug when it both belongs to AND prevents completion of Epic/Story
```

**Remove affects section entirely (lines ~87-94)**

**Update relates-to section:**
```markdown
**relates-to (flexible):**
- Cross-references without hierarchy or blocking
- Use for general context, informational links
- Spike informs Story/Feature via relates-to
```

## Validation

- Line count stays ≤130 lines (currently 123)
- Explains dual nature of blocks clearly
- No mention of affects/affected-by