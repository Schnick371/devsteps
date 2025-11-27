# Add Item Hierarchy Rules to Agent

## Objective
Add concise section clarifying Epic/Story/Task roles without verbose examples.

## Changes Needed

### New Section: "Item Hierarchy" (before "Tool Usage Strategy")
```markdown
## Item Hierarchy

**Epic:** Business initiative (WHAT we're building, business value)
**Story:** User problem or feature need (WHY users need it, acceptance criteria)  
**Task:** Technical implementation (HOW to build it, solution details, code changes)
**Bug:** Problem report → Create Task for fix implementation
**Spike:** Research question → Create Stories from findings

**Rule:** Document solutions in Tasks, not Stories. Stories describe problems.
```

### Section to Compress: "Workflow Process" (currently 15 lines → target 8 lines)
Remove redundant explanations, keep only essential steps references.

## Key Principle
Trust Copilot - minimal rules, maximum clarity. No examples.