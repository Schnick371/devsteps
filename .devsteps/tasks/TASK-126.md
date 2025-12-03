## Objective

Update HIERARCHY-COMPACT.md to reflect Jira 2025 semantics with `blocks` as hierarchy for Bug.

## Changes

**File: .devsteps/HIERARCHY-COMPACT.md**

**Section "Allowed Links (implements)" - Lines ~20-24:**
```markdown
**Hierarchy Relations:**
- **implements**: Epic→Story|Spike, Story→Task, Feature→Task, Requirement→Feature|Spike
- **blocks**: Bug→Epic|Story|Requirement|Feature (Jira hierarchy + blocking)

**Note:** Task implements Bug for fix implementation.
```

**Section "Flexible Relations (any to any)" - Lines ~28 and ~55:**
```markdown
**Flexible Relations (any to any):**
- relates-to, depends-on, tested-by, supersedes
- blocks (for non-Bug types: Story→Story, Task→Task)

**Note:** blocks moved to hierarchy for Bug validation, but remains flexible for other types.
```

**Update industry standard comment - Lines ~5 and ~34:**
```markdown
**Industry Standard (Jira 2025):**
```

Remove "Azure DevOps/" prefix, keep only Jira 2025.

## Validation

- Line count stays ≤60 lines (currently 55)
- Token count stays ≤300 tokens