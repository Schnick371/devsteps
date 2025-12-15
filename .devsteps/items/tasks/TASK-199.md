## Objective
Add VS Code tasks to .vscode/tasks.json for convenient manual test execution.

## Implementation
Add to .vscode/tasks.json:
- Test: All (default, runs all tests sequentially)
- Test: Unit (vitest)
- Test: CLI Integration (BATS)
- Test: Watch (vitest watch mode)

## Pattern
Sequential execution: lint → unit → integration
Dedicated panels for each test type
Problem matchers for error detection

## Acceptance Criteria
- Can run all tests via VS Code Command Palette
- BATS tests accessible from Tasks menu
- Test failures show in Problems panel
- Default test task runs full suite