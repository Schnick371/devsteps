# CLI Integration Tests

This directory contains BATS (Bash Automated Testing System) integration tests for the DevSteps CLI.

## Structure

```
tests/
├── .bats-helpers/           # Symlinks to BATS helper libraries
│   ├── bats-support/        -> ../../node_modules/bats-support
│   └── bats-assert/         -> ../../node_modules/bats-assert
└── integration/
    └── cli/                 # CLI integration tests
        └── setup.bats       # Basic setup verification tests
```

## Running Tests

```bash
# Run all CLI integration tests
npm run test:cli

# Run specific test file
npx bats tests/integration/cli/setup.bats

# Run with verbose output
npx bats -t tests/integration/cli/setup.bats
```

## Writing Tests

### Basic Test Structure

```bash
#!/usr/bin/env bats

# Load BATS helpers
load '../../.bats-helpers/bats-support/load'
load '../../.bats-helpers/bats-assert/load'

setup() {
  cd "${BATS_TEST_DIRNAME}/../../.." || exit 1
}

@test "description of test" {
  run node packages/cli/dist/index.js command
  assert_success
  assert_output --partial "expected output"
}
```

### Available Assertions

From `bats-assert`:
- `assert_success` - Command exited with status 0
- `assert_failure` - Command exited with non-zero status
- `assert_output` - Check exact output
- `assert_output --partial` - Check output contains substring
- `assert_line` - Check specific line of output
- `refute_output` - Assert output is empty or doesn't match

From `bats-support`:
- Helper functions for better error messages
- `fail` - Explicitly fail a test
- Improved assertion output formatting

## Best Practices

1. **Isolation**: Each test should be independent and not rely on state from other tests
2. **Build First**: Tests assume CLI is built (`packages/cli/dist/index.js` exists)
3. **Cleanup**: Use `teardown()` to clean up any test artifacts
4. **Skip When Needed**: Use `skip` for tests that require specific conditions
5. **Descriptive Names**: Test names should clearly describe what is being tested

## References

- [BATS Documentation](https://bats-core.readthedocs.io/)
- [bats-support](https://github.com/bats-core/bats-support)
- [bats-assert](https://github.com/bats-core/bats-assert)
