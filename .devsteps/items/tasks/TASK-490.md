## Rationale

`packages/extension/src/treeView/utils/methodologyDetector.ts` has zero test coverage. The upcoming 
cross-cutting section fix (see flat view bug) requires a safety net.

## Test Cases
- `doc` item with no parent → `'cross-cutting'`
- `test` item with no parent → `'cross-cutting'`
- `test` item implementing a Story → `'scrum'`
- `task` item implementing a Feature → `'waterfall'`
- `epic` → `'scrum'`
- `requirement` → `'waterfall'`

## Affected Paths
- new: packages/extension/src/treeView/utils/methodologyDetector.test.ts