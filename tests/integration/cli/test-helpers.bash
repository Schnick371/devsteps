#!/usr/bin/env bash

# =============================================================================
# BATS Test Helpers - Isolated Test Environment
# =============================================================================
# These helpers ensure tests run in isolated temporary directories,
# never polluting the project's actual .devsteps/ data.
# =============================================================================

# Standard setup function - creates isolated temp directory
# Usage: Add this to your @test setup() function
setup_isolated_test() {
  # Store original directory
  export ORIG_DIR="$(pwd)"
  
  # Move to project root to access CLI
  cd "${BATS_TEST_DIRNAME}/../../.." || exit 1
  export PROJECT_ROOT="$(pwd)"
  
  # Verify CLI is built
  if [ ! -f "$PROJECT_ROOT/packages/cli/dist/index.js" ]; then
    skip "CLI not built. Run 'npm run build' first."
  fi
  
  # Create isolated temp directory for this test
  export TEST_DIR=$(mktemp -d -t devsteps-test-XXXXXX)
  
  # Convenient CLI command variable
  export CLI="$PROJECT_ROOT/packages/cli/dist/index.js"
  
  # Change to temp directory - all commands run here
  cd "$TEST_DIR" || exit 1
}

# Standard teardown function - cleans up temp directory
# Usage: Add this to your @test teardown() function
teardown_isolated_test() {
  # Return to original directory
  cd "$ORIG_DIR" || true
  
  # Clean up temp directory unless debugging
  if [ -z "$DEVSTEPS_DEBUG_TESTS" ] && [ -d "$TEST_DIR" ]; then
    rm -rf "$TEST_DIR"
  elif [ -n "$DEVSTEPS_DEBUG_TESTS" ]; then
    echo "# Debug mode: Test artifacts preserved at: $TEST_DIR" >&3
  fi
}

# Helper to initialize a devsteps project in the temp directory
# Usage: init_test_project "project-name" "methodology"
# methodology: scrum (default), waterfall, or hybrid
init_test_project() {
  local project_name="${1:-test-project}"
  local methodology="${2:-scrum}"
  run node "$CLI" init "$project_name" --methodology "$methodology"
  assert_success
  # Note: init command initializes in current directory, not a subdirectory
}

# Helper to extract item ID from CLI output
# Example: "✔ Created EPIC-001: Title" → "EPIC-001"
# Example: "✔ Created REQ-001: Title" → "REQ-001"
extract_item_id() {
  echo "$1" | grep -oE '(EPIC|STORY|TASK|BUG|SPIKE|REQ|FEAT|TEST)-[0-9]+' | head -1
}
