#!/usr/bin/env bats

# =============================================================================
# BATS Tests - Complete Scrum Hierarchy
# =============================================================================
# Tests comprehensive Scrum workflows:
# - Epic → Story → Task hierarchy
# - Epic → Spike → Task (technical investigation)
# - Story → Bug → Task (bug blocking story)
# - All relationship types (implements, depends-on, relates-to, tested-by, blocks)
# - Verification via status, list, and trace commands
# =============================================================================

load '../../.bats-helpers/bats-support/load'
load '../../.bats-helpers/bats-assert/load'
load 'test-helpers'

setup() {
  setup_isolated_test
  init_test_project "test-scrum"
}

teardown() {
  teardown_isolated_test
}

# =============================================================================
# Test 1: Basic Epic → Story → Task Hierarchy
# =============================================================================

@test "Create complete Scrum hierarchy: Epic → Story → Task" {
  # Create Epic
  run node "$CLI" add epic "E-Commerce Platform"
  assert_success
  EPIC_ID=$(extract_item_id "$output")
  assert [ -n "$EPIC_ID" ]
  
  # Create Story
  run node "$CLI" add story "User Authentication"
  assert_success
  STORY_ID=$(extract_item_id "$output")
  assert [ -n "$STORY_ID" ]
  
  # Link Story to Epic
  run node "$CLI" link "$STORY_ID" implements "$EPIC_ID"
  assert_success
  
  # Create Task
  run node "$CLI" add task "Implement login endpoint"
  assert_success
  TASK_ID=$(extract_item_id "$output")
  assert [ -n "$TASK_ID" ]
  
  # Link Task to Story
  run node "$CLI" link "$TASK_ID" implements "$STORY_ID"
  assert_success
  
  # Verify hierarchy with trace
  run node "$CLI" trace "$EPIC_ID"
  assert_success
  assert_output --partial "$EPIC_ID"
  assert_output --partial "$STORY_ID"
  assert_output --partial "$TASK_ID"
}

# =============================================================================
# Test 2: Epic → Multiple Stories → Multiple Tasks
# =============================================================================

@test "Create Epic with multiple Stories and Tasks" {
  # Create Epic
  run node "$CLI" add epic "Mobile App"
  assert_success
  EPIC_ID=$(extract_item_id "$output")
  
  # Create Story 1
  run node "$CLI" add story "Login Screen"
  assert_success
  STORY1_ID=$(extract_item_id "$output")
  
  # Create Story 2
  run node "$CLI" add story "Dashboard Screen"
  assert_success
  STORY2_ID=$(extract_item_id "$output")
  
  # Link both stories to Epic
  run node "$CLI" link "$STORY1_ID" implements "$EPIC_ID"
  assert_success
  
  run node "$CLI" link "$STORY2_ID" implements "$EPIC_ID"
  assert_success
  
  # Create Tasks for Story 1
  run node "$CLI" add task "Design login UI"
  assert_success
  TASK1_ID=$(extract_item_id "$output")
  
  run node "$CLI" add task "Implement auth API"
  assert_success
  TASK2_ID=$(extract_item_id "$output")
  
  # Link tasks to Story 1
  run node "$CLI" link "$TASK1_ID" implements "$STORY1_ID"
  assert_success
  
  run node "$CLI" link "$TASK2_ID" implements "$STORY1_ID"
  assert_success
  
  # Create Task for Story 2
  run node "$CLI" add task "Create dashboard layout"
  assert_success
  TASK3_ID=$(extract_item_id "$output")
  
  run node "$CLI" link "$TASK3_ID" implements "$STORY2_ID"
  assert_success
  
  # Verify complete hierarchy
  run node "$CLI" trace "$EPIC_ID"
  assert_success
  assert_output --partial "$STORY1_ID"
  assert_output --partial "$STORY2_ID"
  assert_output --partial "$TASK1_ID"
  assert_output --partial "$TASK2_ID"
  assert_output --partial "$TASK3_ID"
}

# =============================================================================
# Test 3: Epic → Spike → Task (Technical Investigation)
# =============================================================================

@test "Create Epic with Spike for technical investigation" {
  # Create Epic
  run node "$CLI" add epic "Performance Optimization"
  assert_success
  EPIC_ID=$(extract_item_id "$output")
  
  # Create Spike (technical investigation)
  run node "$CLI" add spike "Research caching strategies"
  assert_success
  SPIKE_ID=$(extract_item_id "$output")
  
  # Link Spike to Epic
  run node "$CLI" link "$SPIKE_ID" implements "$EPIC_ID"
  assert_success
  
  # Create Tasks for Spike
  run node "$CLI" add task "Benchmark Redis"
  assert_success
  TASK1_ID=$(extract_item_id "$output")
  
  run node "$CLI" add task "Benchmark Memcached"
  assert_success
  TASK2_ID=$(extract_item_id "$output")
  
  # Link tasks to Spike
  run node "$CLI" link "$TASK1_ID" implements "$SPIKE_ID"
  assert_success
  
  run node "$CLI" link "$TASK2_ID" implements "$SPIKE_ID"
  assert_success
  
  # Verify Spike hierarchy
  run node "$CLI" trace "$EPIC_ID"
  assert_success
  assert_output --partial "$SPIKE_ID"
  assert_output --partial "$TASK1_ID"
  assert_output --partial "$TASK2_ID"
}

# =============================================================================
# Test 4: Story → Bug → Task (Bug Blocks Story)
# =============================================================================

@test "Create Bug that blocks Story with Tasks" {
  # Create Epic
  run node "$CLI" add epic "Payment System"
  assert_success
  EPIC_ID=$(extract_item_id "$output")
  
  # Create Story
  run node "$CLI" add story "Process credit card payments"
  assert_success
  STORY_ID=$(extract_item_id "$output")
  
  # Link Story to Epic
  run node "$CLI" link "$STORY_ID" implements "$EPIC_ID"
  assert_success
  
  # Create Bug
  run node "$CLI" add bug "Payment validation fails"
  assert_success
  BUG_ID=$(extract_item_id "$output")
  
  # Bug blocks Story
  run node "$CLI" link "$BUG_ID" blocks "$STORY_ID"
  assert_success
  
  # Create Tasks for Bug
  run node "$CLI" add task "Fix validation regex"
  assert_success
  TASK1_ID=$(extract_item_id "$output")
  
  run node "$CLI" add task "Add unit tests"
  assert_success
  TASK2_ID=$(extract_item_id "$output")
  
  # Link tasks to Bug
  run node "$CLI" link "$TASK1_ID" implements "$BUG_ID"
  assert_success
  
  run node "$CLI" link "$TASK2_ID" implements "$BUG_ID"
  assert_success
  
  # Verify Bug hierarchy
  run node "$CLI" trace "$BUG_ID"
  assert_success
  assert_output --partial "$TASK1_ID"
  assert_output --partial "$TASK2_ID"
  
  # Verify Bug blocks Story
  run node "$CLI" get "$STORY_ID"
  assert_success
  assert_output --partial "$BUG_ID"
}

# =============================================================================
# Test 5: All Relationship Types
# =============================================================================

@test "Test all relationship types: implements, depends-on, relates-to, tested-by" {
  # Create Epic
  run node "$CLI" add epic "API Development"
  assert_success
  EPIC_ID=$(extract_item_id "$output")
  
  # Create Stories
  run node "$CLI" add story "User API"
  assert_success
  USER_STORY_ID=$(extract_item_id "$output")
  
  run node "$CLI" add story "Auth API"
  assert_success
  AUTH_STORY_ID=$(extract_item_id "$output")
  
  # implements relationship
  run node "$CLI" link "$USER_STORY_ID" implements "$EPIC_ID"
  assert_success
  
  run node "$CLI" link "$AUTH_STORY_ID" implements "$EPIC_ID"
  assert_success
  
  # depends-on relationship (User API depends on Auth API)
  run node "$CLI" link "$USER_STORY_ID" depends-on "$AUTH_STORY_ID"
  assert_success
  
  # Create related documentation story
  run node "$CLI" add story "API Documentation"
  assert_success
  DOC_STORY_ID=$(extract_item_id "$output")
  
  # relates-to relationship
  run node "$CLI" link "$DOC_STORY_ID" relates-to "$USER_STORY_ID"
  assert_success
  
  # Create test item
  run node "$CLI" add test "Integration tests for User API"
  assert_success
  TEST_ID=$(extract_item_id "$output")
  
  # tested-by relationship
  run node "$CLI" link "$USER_STORY_ID" tested-by "$TEST_ID"
  assert_success
  
  # Verify all relationships via trace
  run node "$CLI" trace "$EPIC_ID"
  assert_success
  assert_output --partial "$USER_STORY_ID"
  assert_output --partial "$AUTH_STORY_ID"
  
  # Verify dependencies are shown
  run node "$CLI" get "$USER_STORY_ID"
  assert_success
  assert_output --partial "$AUTH_STORY_ID"
  assert_output --partial "$TEST_ID"
}

# =============================================================================
# Test 6: Status Command Verification
# =============================================================================

@test "Verify status command shows hierarchy statistics" {
  # Create minimal hierarchy
  run node "$CLI" add epic "Test Epic"
  assert_success
  EPIC_ID=$(extract_item_id "$output")
  
  run node "$CLI" add story "Test Story"
  assert_success
  STORY_ID=$(extract_item_id "$output")
  
  run node "$CLI" link "$STORY_ID" implements "$EPIC_ID"
  assert_success
  
  run node "$CLI" add task "Test Task"
  assert_success
  TASK_ID=$(extract_item_id "$output")
  
  run node "$CLI" link "$TASK_ID" implements "$STORY_ID"
  assert_success
  
  # Get status
  run node "$CLI" status
  assert_success
  
  # Should show counts for each type
  assert_output --partial "epic"
  assert_output --partial "story"
  assert_output --partial "task"
}

# =============================================================================
# Test 7: List Command with Type Filtering
# =============================================================================

@test "List command filters by item type in hierarchy" {
  # Create hierarchy
  run node "$CLI" add epic "Filter Test"
  assert_success
  EPIC_ID=$(extract_item_id "$output")
  
  run node "$CLI" add story "Story 1"
  assert_success
  STORY1_ID=$(extract_item_id "$output")
  
  run node "$CLI" add story "Story 2"
  assert_success
  STORY2_ID=$(extract_item_id "$output")
  
  run node "$CLI" add task "Task 1"
  assert_success
  TASK_ID=$(extract_item_id "$output")
  
  # List only epics
  run node "$CLI" list --type epic
  assert_success
  assert_output --partial "$EPIC_ID"
  refute_output --partial "$STORY1_ID"
  refute_output --partial "$TASK_ID"
  
  # List only stories
  run node "$CLI" list --type story
  assert_success
  assert_output --partial "$STORY1_ID"
  assert_output --partial "$STORY2_ID"
  refute_output --partial "$EPIC_ID"
  refute_output --partial "$TASK_ID"
  
  # List only tasks
  run node "$CLI" list --type task
  assert_success
  assert_output --partial "$TASK_ID"
  refute_output --partial "$EPIC_ID"
  refute_output --partial "$STORY1_ID"
}

# =============================================================================
# Test 8: Complex Multi-Level Hierarchy with Mixed Relationships
# =============================================================================

@test "Create complex multi-level hierarchy with all Scrum item types" {
  # Create Epic
  run node "$CLI" add epic "Customer Portal"
  assert_success
  EPIC_ID=$(extract_item_id "$output")
  
  # Create Story with Tasks
  run node "$CLI" add story "Customer Login"
  assert_success
  STORY_ID=$(extract_item_id "$output")
  
  run node "$CLI" link "$STORY_ID" implements "$EPIC_ID"
  assert_success
  
  run node "$CLI" add task "Implement OAuth flow"
  assert_success
  TASK1_ID=$(extract_item_id "$output")
  
  run node "$CLI" link "$TASK1_ID" implements "$STORY_ID"
  assert_success
  
  # Create Spike with Tasks
  run node "$CLI" add spike "Evaluate SSO providers"
  assert_success
  SPIKE_ID=$(extract_item_id "$output")
  
  run node "$CLI" link "$SPIKE_ID" implements "$EPIC_ID"
  assert_success
  
  run node "$CLI" add task "Test Auth0"
  assert_success
  TASK2_ID=$(extract_item_id "$output")
  
  run node "$CLI" link "$TASK2_ID" implements "$SPIKE_ID"
  assert_success
  
  # Create Bug that blocks Story
  run node "$CLI" add bug "Session timeout too short"
  assert_success
  BUG_ID=$(extract_item_id "$output")
  
  run node "$CLI" link "$BUG_ID" blocks "$STORY_ID"
  assert_success
  
  run node "$CLI" add task "Update session config"
  assert_success
  TASK3_ID=$(extract_item_id "$output")
  
  run node "$CLI" link "$TASK3_ID" implements "$BUG_ID"
  assert_success
  
  # Create Test that tests Story
  run node "$CLI" add test "E2E login tests"
  assert_success
  TEST_ID=$(extract_item_id "$output")
  
  run node "$CLI" link "$STORY_ID" tested-by "$TEST_ID"
  assert_success
  
  # Verify complete hierarchy
  run node "$CLI" trace "$EPIC_ID"
  assert_success
  assert_output --partial "$STORY_ID"
  assert_output --partial "$SPIKE_ID"
  assert_output --partial "$TASK1_ID"
  assert_output --partial "$TASK2_ID"
  
  # Verify Bug relationship
  run node "$CLI" get "$STORY_ID"
  assert_success
  assert_output --partial "$BUG_ID"
  assert_output --partial "$TEST_ID"
  
  # Verify Bug has Task
  run node "$CLI" trace "$BUG_ID"
  assert_success
  assert_output --partial "$TASK3_ID"
}

# =============================================================================
# Test 9: Update Status Through Hierarchy
# =============================================================================

@test "Update status of items in hierarchy and verify cascading state" {
  # Create hierarchy
  run node "$CLI" add epic "Status Test"
  assert_success
  EPIC_ID=$(extract_item_id "$output")
  
  run node "$CLI" add story "Feature A"
  assert_success
  STORY_ID=$(extract_item_id "$output")
  
  run node "$CLI" link "$STORY_ID" implements "$EPIC_ID"
  assert_success
  
  run node "$CLI" add task "Implement A"
  assert_success
  TASK_ID=$(extract_item_id "$output")
  
  run node "$CLI" link "$TASK_ID" implements "$STORY_ID"
  assert_success
  
  # Update Task status
  run node "$CLI" update "$TASK_ID" --status in-progress
  assert_success
  
  # Verify Task status
  run node "$CLI" get "$TASK_ID"
  assert_success
  assert_output --partial "in-progress"
  
  # Complete the Task
  run node "$CLI" update "$TASK_ID" --status done
  assert_success
  
  # Update Story status
  run node "$CLI" update "$STORY_ID" --status done
  assert_success
  
  # List completed items
  run node "$CLI" list --status done
  assert_success
  assert_output --partial "$TASK_ID"
  assert_output --partial "$STORY_ID"
}

# =============================================================================
# Test 10: Bidirectional Relationship Verification
# =============================================================================

@test "Verify bidirectional relationships work correctly" {
  # Create Epic
  run node "$CLI" add epic "Bidirectional Test"
  assert_success
  EPIC_ID=$(extract_item_id "$output")
  
  # Create Story
  run node "$CLI" add story "Test Story"
  assert_success
  STORY_ID=$(extract_item_id "$output")
  
  # Link using 'implements'
  run node "$CLI" link "$STORY_ID" implements "$EPIC_ID"
  assert_success
  
  # Trace from Epic should show Story
  run node "$CLI" trace "$EPIC_ID"
  assert_success
  assert_output --partial "$STORY_ID"
  
  # Get Story should show it implements Epic
  run node "$CLI" get "$STORY_ID"
  assert_success
  assert_output --partial "$EPIC_ID"
  
  # Test 'blocks' relationship bidirectionality
  run node "$CLI" add bug "Blocker Bug"
  assert_success
  BUG_ID=$(extract_item_id "$output")
  
  run node "$CLI" link "$BUG_ID" blocks "$STORY_ID"
  assert_success
  
  # Story should show it's blocked by Bug
  run node "$CLI" get "$STORY_ID"
  assert_success
  assert_output --partial "$BUG_ID"
  
  # Bug should show it blocks Story
  run node "$CLI" get "$BUG_ID"
  assert_success
  assert_output --partial "$STORY_ID"
}
