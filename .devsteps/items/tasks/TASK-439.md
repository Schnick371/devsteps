Write unit and BATS integration tests for `adjustHeadingLevels`. Unit test file at `packages/shared/src/utils/heading-shift.test.ts` with ≥ 27 cases: identity (offset=0), offset 1–5, H6 overflow cap (H6 stays H6 regardless of offset), H5 + offset=2 → H6 (not H7), lines inside backtick fences skipped, lines inside tilde fences skipped, nested fence types (`\`\`\`` inside `~~~`) — track fence by first-seen type only, blank lines preserved, non-heading lines unchanged, `#` in HTML comment not shifted, `#` in inline code not shifted. BATS integration test at `tests/integration/export.bats` with ≥ 3 cases: `devsteps export` exits 0 and writes output file, `devsteps export --heading-mode auto` exits 0, `devsteps export --help` shows `--heading-mode` in usage text.

Pre-condition: TASK-436 + TASK-437 + TASK-438 complete.

## Acceptance Criteria
- ≥ 30 total test cases (unit + BATS)
- All H6 overflow cases assert exact `######` output (6 hashes max)
- Fenced block skipping: at least 3 distinct fence scenarios tested