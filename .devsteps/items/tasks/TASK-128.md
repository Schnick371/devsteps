**Objective:** Add tested-by and required-by relationships to TreeView node display (critical relations).

**Changes Needed:**
1. types.ts: Add 'tested-by' and 'required-by' to WorkItem.linked_items interface
2. workItemNode.ts: Collect testedBy and requiredBy in getChildren()
3. workItemNode.ts: Update hasImplementedByLinks() to check all hierarchy + critical relations

**Scope:** ONLY tested-by and required-by (critical). Other flexible relations (depends-on, tests, supersedes, superseded-by) go to Dashboard (STORY-018).

**Validation:** Build, check no errors, verify TreeView displays both new relations.