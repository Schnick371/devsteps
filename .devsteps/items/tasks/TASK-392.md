Zero test coverage for `doc` type in the existing test suite. 7 defects were introduced silently because no tests exercise the doc type path.

Add 4 test cases:
1. `index-rebuild.test.ts`: Add doc type to the round-trip test (create → add to index → load via by-type)
2. `list.test.ts`: Add `listItems({ type: 'doc' })` test with fixture
3. `list.test.ts`: Add doc item to prefix decode test (DOC → 'doc')
4. `counter.test.ts` (or init.test.ts): Verify counter key is uppercase DOC after init

All 4 tests must pass after DEFECT fixes are applied.Done: 5 new tests added across index-rebuild.test.ts and auto-migrate.test.ts. All 461 tests pass. Commit 69d8e35.