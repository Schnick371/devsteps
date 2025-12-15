# BATS Test Pattern for Isolated Test Environments

## Overview

This document defines the standard pattern for BATS integration tests that need to manipulate data in isolated temporary directories. This prevents tests from polluting the project's `.devsteps` directory and ensures each test runs in a clean environment.

## Standard Pattern

### Complete Setup and Teardown Functions

```bash
#!/usr/bin/env bats

load '../../.bats-helpers/bats-support/load'
load '../../.bats-helpers/bats-assert/load'

# Global variables set in setup()
# - PROJECT_ROOT: Absolute path to the project root (where CLI is built)
# - TEST_TEMP_DIR: Temporary directory for this test (auto-cleanup)
# - CLI: Path to the DevSteps CLI binary

setup() {
  # Store original directory
  export ORIG_DIR="$(pwd)"
  
  # Navigate to project root (3 levels up from tests/integration/cli/)
  cd "${BATS_TEST_DIRNAME}/../../.." || exit 1
  export PROJECT_ROOT="$(pwd)"
  
  # Verify CLI is built
  if [ ! -f "$PROJECT_ROOT/packages/cli/dist/index.js" ]; then
    skip "CLI not built. Run 'npm run build' first."
  fi
  
  # Set CLI path for convenience
  export CLI="$PROJECT_ROOT/packages/cli/dist/index.js"
  
  # Create isolated temporary directory for this test
  # Use BATS_TEST_TMPDIR as base (cleaned by BATS) or fallback to mktemp
  if [ -n "$BATS_TEST_TMPDIR" ]; then
    TEST_TEMP_DIR="$BATS_TEST_TMPDIR/devsteps-test-$$-$RANDOM"
  else
    TEST_TEMP_DIR=$(mktemp -d)
  fi
  export TEST_TEMP_DIR
  
  mkdir -p "$TEST_TEMP_DIR"
  
  # Change to temporary directory - all commands run here
  cd "$TEST_TEMP_DIR" || exit 1
  
  # Optional: Set flag to preserve temp dir for debugging
  # Controlled via environment variable: DEVSTEPS_DEBUG_TESTS=1
  if [ "${DEVSTEPS_DEBUG_TESTS:-0}" = "1" ]; then
    echo "# Test temp directory: $TEST_TEMP_DIR" >&3
  fi
}

teardown() {
  # Return to original directory first (required before cleanup)
  cd "$ORIG_DIR" || true
  
  # Clean up temporary directory unless debugging
  if [ "${DEVSTEPS_DEBUG_TESTS:-0}" != "1" ]; then
    if [ -n "$TEST_TEMP_DIR" ] && [ -d "$TEST_TEMP_DIR" ]; then
      rm -rf "$TEST_TEMP_DIR"
    fi
  else
    # In debug mode, report location
    if [ -n "$TEST_TEMP_DIR" ] && [ -d "$TEST_TEMP_DIR" ]; then
      echo "# Test artifacts preserved at: $TEST_TEMP_DIR" >&3
    fi
  fi
}
```

## Usage in Tests

### Example 1: Initialize and Test Project

```bash
@test "Initialize DevSteps project in isolated directory" {
  # Initialize a new project (in TEST_TEMP_DIR)
  run node "$CLI" init "test-project"
  assert_success
  
  # Verify .devsteps directory was created
  [ -d ".devsteps" ]
  [ -f ".devsteps/config.json" ]
  [ -f ".devsteps/index.json" ]
  
  # Run status command
  run node "$CLI" status
  assert_success
  assert_output --partial "test-project"
}
```

### Example 2: Create Items and Test Hierarchy

```bash
@test "Create and link items in isolated environment" {
  # Initialize project first
  run node "$CLI" init "hierarchy-test"
  assert_success
  
  # Create epic
  run node "$CLI" add epic "Test Epic" --description "Test epic description"
  assert_success
  EPIC_ID=$(echo "$output" | grep -oE 'EPIC-[0-9]+' | head -1)
  
  # Create story
  run node "$CLI" add story "Test Story" --description "Test story description"
  assert_success
  STORY_ID=$(echo "$output" | grep -oE 'STORY-[0-9]+' | head -1)
  
  # Link story to epic
  run node "$CLI" link "$STORY_ID" implements "$EPIC_ID"
  assert_success
  
  # Verify link
  run node "$CLI" get "$STORY_ID"
  assert_success
  assert_output --partial "$EPIC_ID"
  
  # No cleanup needed - teardown() handles it
}
```

### Example 3: Test with Multiple Projects

```bash
@test "Can switch between multiple DevSteps projects" {
  # Create first project
  mkdir -p project1
  cd project1
  run node "$CLI" init "project-one"
  assert_success
  
  # Create item in project1
  run node "$CLI" add task "Task One"
  assert_success
  
  # Create second project
  cd "$TEST_TEMP_DIR"
  mkdir -p project2
  cd project2
  run node "$CLI" init "project-two"
  assert_success
  
  # Create item in project2
  run node "$CLI" add task "Task Two"
  assert_success
  
  # Verify isolation
  cd "$TEST_TEMP_DIR/project1"
  run node "$CLI" list
  assert_success
  assert_output --partial "Task One"
  refute_output --partial "Task Two"
  
  cd "$TEST_TEMP_DIR/project2"
  run node "$CLI" list
  assert_success
  assert_output --partial "Task Two"
  refute_output --partial "Task One"
}
```

## Key Features

### 1. Automatic Cleanup
- `teardown()` always runs, even if test fails
- Temporary directory is completely removed
- No manual cleanup needed in tests

### 2. Debugging Support
```bash
# Run tests with preserved temp directories
DEVSTEPS_DEBUG_TESTS=1 bats tests/integration/cli/my-test.bats

# Output shows:
# Test temp directory: /tmp/bats-test-12345/devsteps-test-67890
# Test artifacts preserved at: /tmp/bats-test-12345/devsteps-test-67890
```

### 3. Isolation Guarantees
- Each test runs in unique temporary directory
- No pollution of project `.devsteps` directory
- Tests can run in parallel (if needed)
- Clean slate for every test

### 4. Convenient Variables
- `$PROJECT_ROOT` - Path to devsteps project (for accessing CLI)
- `$CLI` - Direct path to CLI binary: `node "$CLI" command`
- `$TEST_TEMP_DIR` - Current test's temporary directory
- `$ORIG_DIR` - Original working directory

## Migration Guide

### Old Pattern (Pollutes Project)
```bash
setup() {
  cd "${BATS_TEST_DIRNAME}/../../.." || exit 1
  export PROJECT_ROOT="$(pwd)"
  export CREATED_ITEMS=()
}

teardown() {
  # Manual cleanup of items from project .devsteps
  if [ -f "/tmp/devsteps-test-items-$$.txt" ]; then
    while IFS= read -r item_path; do
      rm -rf "$item_path" 2>/dev/null || true
    done < "/tmp/devsteps-test-items-$$.txt"
    rm -f "/tmp/devsteps-test-items-$$.txt"
  fi
}

@test "Create item" {
  run node "$PROJECT_ROOT/packages/cli/dist/index.js" add task "Test"
  # Item created in PROJECT .devsteps directory!
}
```

### New Pattern (Isolated)
```bash
setup() {
  export ORIG_DIR="$(pwd)"
  cd "${BATS_TEST_DIRNAME}/../../.." || exit 1
  export PROJECT_ROOT="$(pwd)"
  
  if [ ! -f "$PROJECT_ROOT/packages/cli/dist/index.js" ]; then
    skip "CLI not built. Run 'npm run build' first."
  fi
  
  export CLI="$PROJECT_ROOT/packages/cli/dist/index.js"
  
  if [ -n "$BATS_TEST_TMPDIR" ]; then
    TEST_TEMP_DIR="$BATS_TEST_TMPDIR/devsteps-test-$$-$RANDOM"
  else
    TEST_TEMP_DIR=$(mktemp -d)
  fi
  export TEST_TEMP_DIR
  
  mkdir -p "$TEST_TEMP_DIR"
  cd "$TEST_TEMP_DIR" || exit 1
}

teardown() {
  cd "$ORIG_DIR" || true
  if [ "${DEVSTEPS_DEBUG_TESTS:-0}" != "1" ]; then
    [ -n "$TEST_TEMP_DIR" ] && [ -d "$TEST_TEMP_DIR" ] && rm -rf "$TEST_TEMP_DIR"
  fi
}

@test "Create item" {
  # Initialize project in temp directory
  run node "$CLI" init "test-project"
  assert_success
  
  # Create item in isolated environment
  run node "$CLI" add task "Test"
  assert_success
  # Item created in TEST_TEMP_DIR/.devsteps, auto-cleaned!
}
```

## Best Practices

1. **Always Initialize** - Start each test with `node "$CLI" init "project-name"`
2. **Use `$CLI` variable** - Shorter than full path: `node "$CLI" command`
3. **No Manual Cleanup** - Let `teardown()` handle it
4. **Debug When Needed** - Use `DEVSTEPS_DEBUG_TESTS=1` to inspect artifacts
5. **Test in Isolation** - Don't rely on project's `.devsteps` directory
6. **Verify Assumptions** - Check that files exist: `[ -f ".devsteps/config.json" ]`

## Common Pitfalls

### ❌ Don't: Run commands without init
```bash
@test "Create task" {
  run node "$CLI" add task "Test"  # FAILS - no .devsteps directory
}
```

### ✅ Do: Initialize first
```bash
@test "Create task" {
  run node "$CLI" init "test-project"
  assert_success
  
  run node "$CLI" add task "Test"
  assert_success
}
```

### ❌ Don't: Manually clean up temp directory
```bash
teardown() {
  rm -rf "$TEST_TEMP_DIR"  # Already handled by standard teardown()
}
```

### ✅ Do: Use standard teardown
```bash
teardown() {
  cd "$ORIG_DIR" || true
  if [ "${DEVSTEPS_DEBUG_TESTS:-0}" != "1" ]; then
    [ -n "$TEST_TEMP_DIR" ] && [ -d "$TEST_TEMP_DIR" ] && rm -rf "$TEST_TEMP_DIR"
  fi
}
```

### ❌ Don't: Use absolute paths for test data
```bash
@test "Check file" {
  [ -f "/tmp/specific-path/file.txt" ]  # Fragile
}
```

### ✅ Do: Use relative paths in temp directory
```bash
@test "Check file" {
  [ -f ".devsteps/items/tasks/TASK-001.json" ]  # In TEST_TEMP_DIR
}
```

## Testing the Pattern

Run basic verification:
```bash
# Standard test run
bats tests/integration/cli/setup.bats

# Debug mode (preserves temp directories)
DEVSTEPS_DEBUG_TESTS=1 bats tests/integration/cli/setup.bats

# Verify no pollution of project .devsteps
ls -la .devsteps/items/  # Should only show project items, not test items
```

## Reference

- BATS Documentation: https://bats-core.readthedocs.io/
- `BATS_TEST_TMPDIR`: Built-in BATS variable for temporary files
- `mktemp -d`: Creates unique temporary directory (fallback)
- `trap 'cmd' EXIT`: Not needed in BATS (teardown() handles cleanup)
