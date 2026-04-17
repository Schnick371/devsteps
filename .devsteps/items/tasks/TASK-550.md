## Context
When SA-NEW-1 (auto-link from related_items frontmatter) ships, STORY nodes in the TreeView
will accumulate 10–20 DOC `implemented-by` children. This is useful for traceability but
can visually crowd the view.

## Change
Add VS Code settings entry: `devsteps.treeView.hideDocChildren: boolean` (default: `false`)
When `true`: DOC items linked as `implemented-by` children of a STORY/TASK node are hidden
from the TreeView (still queriable via MCP / CLI).

## Acceptance Criteria
- [ ] Setting `devsteps.treeView.hideDocChildren` registered in `package.json` contributes
- [ ] TreeView provider reads the setting and filters DOC children when `true`
- [ ] Default `false` — no behavior change for existing users