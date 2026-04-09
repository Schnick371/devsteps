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
- new: packages/extension/src/treeView/utils/methodologyDetector.test.ts**Done (2026-04-07):** Cross-cutting classification tests were fully implemented as part of BUG-083 in `packages/extension/src/treeView/utils/methodologyDetector.test.ts` (13 tests). Covers: doc → cross-cutting, parentless test → cross-cutting, parent-inheritance (scrum/waterfall/cross-cutting), bug relates-to inheritance. No additional tests required.