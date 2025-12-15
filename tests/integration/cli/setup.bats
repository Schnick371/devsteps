#!/usr/bin/env bats

# Load BATS helpers
load '../../.bats-helpers/bats-support/load'
load '../../.bats-helpers/bats-assert/load'
load 'test-helpers'

# Setup function runs before each test
setup() {
  setup_isolated_test
}

# Teardown function runs after each test
teardown() {
  teardown_isolated_test
}

@test "BATS framework is working" {
  run echo "Hello BATS"
  assert_success
  assert_output "Hello BATS"
}

@test "DevSteps CLI is accessible" {
  run node "$CLI" --version
  assert_success
}

@test "DevSteps CLI shows help output" {
  run node "$CLI" --help
  # Help command may exit with status 1, but should show output
  assert_output --partial "devsteps"
}

@test "DevSteps CLI can initialize project in temp directory" {
  # This test verifies we're running in isolation (temp dir, not project root)
  # init command initializes in current working directory (process.cwd())
  run node "$CLI" init "my-project"
  assert_success
  
  # Verify .devsteps was created in current (temp) directory
  [ -d ".devsteps" ]
  
  # Verify we did NOT pollute the project root
  [ ! -d "$PROJECT_ROOT/my-project" ]
}
