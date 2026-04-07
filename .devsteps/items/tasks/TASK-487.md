## Context

BUG-072 ("treeView/utils/itemLoader.ts returns null for DOC-NNN items (regex excludes DOC prefix)") is stale. 
The current code at `packages/extension/src/treeView/utils/itemLoader.ts` line 35 already includes DOC in the regex 
`/^(EPIC|STORY|TASK|REQ|FEAT|BUG|SPIKE|TEST|DOC)-(\d+)$/` and typeMap at line 47 (`DOC: 'doc'`).

## Steps
1. Confirm fix is present in current code (done — verified)
2. Add minimal unit test: `loadItemWithLinks` with `DOC-001` → resolves to `type: 'doc'`
3. Mark BUG-072 status → `done` with append_description explaining the fix

## Affected Paths
- packages/extension/src/treeView/utils/itemLoader.ts (verify only)
- new test file for itemLoader