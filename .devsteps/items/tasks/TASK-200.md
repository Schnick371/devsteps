## Objective
Create .github/workflows/test.yml for automated testing in CI/CD pipeline.

## Implementation
GitHub Actions workflow with:
- Trigger on push to main/develop and PRs
- Matrix testing (Ubuntu/macOS, Node 18/20/22)
- Sequential test execution
- BATS integration via bats-core/bats-action
- Test result artifacts
- Coverage reports

## Test Execution Order
1. Lint (biome check)
2. Unit tests (vitest)
3. Integration tests (BATS CLI tests)
4. Build verification

## Acceptance Criteria
- Workflow runs on push and PR
- All test types execute
- Failures block merges
- Test results uploaded as artifacts
- npm ci used (not npm install)