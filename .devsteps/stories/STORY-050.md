## User Story
As a **DevSteps developer**, I want **CLI integration tests using BATS** so that **I can automatically validate CLI behavior across all hierarchy and relationship scenarios**.

## Acceptance Criteria
- ✅ BATS framework installed and configured
- ✅ Test script for complete Scrum hierarchy (Epic → Story → Task with Spikes, Bugs, Tests)
- ✅ Test script for complete Waterfall hierarchy (Requirement → Feature → Task)
- ✅ Test script for all relationship types (implements, depends-on, blocks, relates-to, tested-by, affects, supersedes)
- ✅ Validation tests for invalid relationships (should fail with proper error messages)
- ✅ Tests verify output via `status`, `list`, `trace` commands
- ✅ TAP-compliant output for CI/CD integration
- ✅ Tests clean up after themselves or can be inspected for debugging

## Technical Details

### BATS Test Structure:
```bash
tests/integration/cli/
├── scrum-hierarchy.bats         # Full Scrum: EPIC → STORY → TASK + SPIKE + BUG
├── waterfall-hierarchy.bats     # Full Waterfall: REQ → FEAT → TASK
├── all-relationships.bats       # All relation types with cross-references
└── validation-errors.bats       # Invalid cases that should fail
```

### Test Pattern:
```bash
@test "Create complete Scrum hierarchy" {
  # Setup: Initialize project
  run devsteps init test-project
  
  # Create Epic
  run devsteps add epic "E-Commerce Platform"
  
  # Create Story
  run devsteps add story "User Authentication"
  run devsteps link STORY-001 implements EPIC-001
  
  # Verify
  run devsteps status
  assert_output --partial "EPIC-001"
  assert_output --partial "STORY-001"
}
```

## Dependencies
- BATS installed in CI environment
- DevSteps CLI built and available

## Why BATS?
Research shows BATS is industry standard for CLI testing (2025):
- TAP-compliant (Test Anything Protocol)
- Simple Bash syntax
- No dependencies except Bash
- Excellent CI/CD integration
- Used by major projects for CLI testing