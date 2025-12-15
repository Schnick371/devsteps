#!/usr/bin/env bats

# Load BATS helpers
load '../../.bats-helpers/bats-support/load'
load '../../.bats-helpers/bats-assert/load'

# Setup function runs before each test
setup() {
  # Change to project root directory
  cd "${BATS_TEST_DIRNAME}/../../.." || exit 1
  
  # Ensure CLI is built
  if [ ! -f "packages/cli/dist/index.js" ]; then
    skip "CLI not built. Run 'npm run build' first."
  fi
}

@test "BATS framework is working" {
  run echo "Hello BATS"
  assert_success
  assert_output "Hello BATS"
}

@test "DevSteps CLI is accessible" {
  run node packages/cli/dist/index.js --version
  assert_success
}

@test "DevSteps CLI shows help output" {
  run node packages/cli/dist/index.js --help
  # Help command may exit with status 1, but should show output
  assert_output --partial "devsteps"
}

@test "DevSteps CLI init command is available" {
  run node packages/cli/dist/index.js --help
  # Help command may exit with status 1, but should show output
  assert_output --partial "init"
}
