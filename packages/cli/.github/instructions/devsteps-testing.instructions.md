---
applyTo: "**/*.{test,spec}.{ts,js},tests/**/*.{ts,js,bats,bash},vitest.config.ts"
description: "Testing standards for unit, integration, and CLI tests"
---

# Testing Standards

## Test Framework

**Vitest for TypeScript/JavaScript:**
- Unit tests colocated with source
- Integration tests in tests/ directory
- Shared test utilities in test-helpers
- Coverage thresholds enforced

## BATS for CLI

**Bash Automated Testing System:**
- Integration tests for CLI commands
- Test helpers for setup/teardown
- Isolated test environments
- Cleanup after test runs

## Test Structure

**Arrange-Act-Assert pattern:**
- Clear test setup phase
- Single action under test
- Explicit assertions
- Descriptive test names

## Naming Conventions

**Test file naming:**
- `*.test.ts` for unit tests
- `*.spec.ts` for integration tests
- `*.bats` for CLI integration tests
- Match source file names

**Test case naming:**
- Describe behavior, not implementation
- Use "should" or "when" phrasing
- Include context in nested describes
- Avoid test case numbering

## Test Coverage

**Quality over quantity:**
- Focus on critical paths and edge cases
- Public APIs fully covered
- Error handling validated
- Integration points tested

## Mocking Strategy

**Minimal mocking:**
- Mock external dependencies only
- Prefer test doubles over complex mocks
- Reset mocks between tests
- Document mock behavior

## Test Data

**Isolated and predictable:**
- Use test fixtures for complex data
- Generate random data for uniqueness tests
- Clean up test data after runs
- Avoid dependencies on external services

## CI/CD Integration

**Automated testing:**
- All tests run on pull requests
- Fast feedback for failures
- Parallel execution where possible
- Clear failure messages
