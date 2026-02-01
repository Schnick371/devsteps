#!/usr/bin/env bats

# =============================================================================
# BATS Tests - Complete Waterfall Hierarchy
# =============================================================================
# Tests comprehensive Waterfall workflows:
# - Requirement → Feature → Task hierarchy
# - Requirement → Spike → Task (technical investigation)
# - Feature → Bug → Task (bug blocking feature)
# - All relationship types (implements, depends-on, relates-to, tested-by, blocks)
# - Verification via status, list, and trace commands
# =============================================================================

load '../../.bats-helpers/bats-support/load'
load '../../.bats-helpers/bats-assert/load'
load 'test-helpers'

setup() {
  setup_isolated_test
  init_test_project "test-waterfall" "waterfall"
}

teardown() {
  teardown_isolated_test
}

# =============================================================================
# Test 1: Basic Requirement → Feature → Task Hierarchy
# =============================================================================

@test "Create complete Waterfall hierarchy: Requirement → Feature → Task" {
  # Create Requirement
  run node "$CLI" add requirement "System Requirements"
  assert_success
  REQ_ID=$(extract_item_id "$output")
  assert [ -n "$REQ_ID" ]
  
  # Create Feature
  run node "$CLI" add feature "Authentication Module"
  assert_success
  FEAT_ID=$(extract_item_id "$output")
  assert [ -n "$FEAT_ID" ]
  
  # Link Feature to Requirement
  run node "$CLI" link "$FEAT_ID" implements "$REQ_ID"
  assert_success
  
  # Create Task
  run node "$CLI" add task "Implement login endpoint"
  assert_success
  TASK_ID=$(extract_item_id "$output")
  assert [ -n "$TASK_ID" ]
  
  # Link Task to Feature
  run node "$CLI" link "$TASK_ID" implements "$FEAT_ID"
  assert_success
  
  # Verify hierarchy with trace
  run node "$CLI" trace "$REQ_ID"
  assert_success
  assert_output --partial "$REQ_ID"
  assert_output --partial "$FEAT_ID"
  assert_output --partial "$TASK_ID"
}

# =============================================================================
# Test 2: Requirement → Multiple Features → Multiple Tasks
# =============================================================================

@test "Create Requirement with multiple Features and Tasks" {
  # Create Requirement
  run node "$CLI" add requirement "User Management System"
  assert_success
  REQ_ID=$(extract_item_id "$output")
  
  # Create Feature 1
  run node "$CLI" add feature "User Registration"
  assert_success
  FEAT1_ID=$(extract_item_id "$output")
  
  # Create Feature 2
  run node "$CLI" add feature "User Profile Management"
  assert_success
  FEAT2_ID=$(extract_item_id "$output")
  
  # Link both features to Requirement
  run node "$CLI" link "$FEAT1_ID" implements "$REQ_ID"
  assert_success
  
  run node "$CLI" link "$FEAT2_ID" implements "$REQ_ID"
  assert_success
  
  # Create Tasks for Feature 1
  run node "$CLI" add task "Create registration form"
  assert_success
  TASK1_ID=$(extract_item_id "$output")
  
  run node "$CLI" add task "Validate email addresses"
  assert_success
  TASK2_ID=$(extract_item_id "$output")
  
  # Link tasks to Feature 1
  run node "$CLI" link "$TASK1_ID" implements "$FEAT1_ID"
  assert_success
  
  run node "$CLI" link "$TASK2_ID" implements "$FEAT1_ID"
  assert_success
  
  # Create Task for Feature 2
  run node "$CLI" add task "Build profile editor"
  assert_success
  TASK3_ID=$(extract_item_id "$output")
  
  run node "$CLI" link "$TASK3_ID" implements "$FEAT2_ID"
  assert_success
  
  # Verify complete hierarchy
  run node "$CLI" trace "$REQ_ID"
  assert_success
  assert_output --partial "$FEAT1_ID"
  assert_output --partial "$FEAT2_ID"
  assert_output --partial "$TASK1_ID"
  assert_output --partial "$TASK2_ID"
  assert_output --partial "$TASK3_ID"
}

# =============================================================================
# Test 3: Requirement → Spike → Task (Technical Investigation)
# =============================================================================

@test "Create Requirement with Spike for technical investigation" {
  # Create Requirement
  run node "$CLI" add requirement "High-Performance Database"
  assert_success
  REQ_ID=$(extract_item_id "$output")
  
  # Create Spike (technical investigation)
  run node "$CLI" add spike "Research database solutions"
  assert_success
  SPIKE_ID=$(extract_item_id "$output")
  
  # Link Spike to Requirement
  run node "$CLI" link "$SPIKE_ID" implements "$REQ_ID"
  assert_success
  
  # Create Tasks for Spike
  run node "$CLI" add task "Benchmark PostgreSQL"
  assert_success
  TASK1_ID=$(extract_item_id "$output")
  
  run node "$CLI" add task "Evaluate MongoDB"
  assert_success
  TASK2_ID=$(extract_item_id "$output")
  
  # Link tasks to Spike
  run node "$CLI" link "$TASK1_ID" implements "$SPIKE_ID"
  assert_success
  
  run node "$CLI" link "$TASK2_ID" implements "$SPIKE_ID"
  assert_success
  
  # Verify hierarchy
  run node "$CLI" trace "$REQ_ID"
  assert_success
  assert_output --partial "$SPIKE_ID"
  assert_output --partial "$TASK1_ID"
  assert_output --partial "$TASK2_ID"
}

# =============================================================================
# Test 4: Feature → Bug → Task (Bug Blocks Feature)
# =============================================================================

@test "Create Feature with Bug that blocks completion" {
  # Create Requirement
  run node "$CLI" add requirement "Payment Processing"
  assert_success
  REQ_ID=$(extract_item_id "$output")
  
  # Create Feature
  run node "$CLI" add feature "Credit Card Payment"
  assert_success
  FEAT_ID=$(extract_item_id "$output")
  
  # Link Feature to Requirement
  run node "$CLI" link "$FEAT_ID" implements "$REQ_ID"
  assert_success
  
  # Create Bug
  run node "$CLI" add bug "Payment gateway timeout"
  assert_success
  BUG_ID=$(extract_item_id "$output")
  
  # Link Bug to Feature (Bug implements/belongs to Feature)
  run node "$CLI" link "$BUG_ID" implements "$FEAT_ID"
  assert_success
  
  # Bug blocks Feature
  run node "$CLI" link "$BUG_ID" blocks "$FEAT_ID"
  assert_success
  
  # Create Task to fix Bug
  run node "$CLI" add task "Increase timeout configuration"
  assert_success
  TASK_ID=$(extract_item_id "$output")
  
  # Link Task to Bug
  run node "$CLI" link "$TASK_ID" implements "$BUG_ID"
  assert_success
  
  # Verify hierarchy
  run node "$CLI" trace "$REQ_ID"
  assert_success
  assert_output --partial "$FEAT_ID"
  assert_output --partial "$BUG_ID"
  assert_output --partial "$TASK_ID"
}

# =============================================================================
# Test 5: Feature Dependencies (depends-on)
# =============================================================================

@test "Create Features with dependencies between them" {
  # Create Requirement
  run node "$CLI" add requirement "API Platform"
  assert_success
  REQ_ID=$(extract_item_id "$output")
  
  # Create Feature 1 (base feature)
  run node "$CLI" add feature "API Authentication"
  assert_success
  FEAT1_ID=$(extract_item_id "$output")
  
  # Create Feature 2 (depends on Feature 1)
  run node "$CLI" add feature "User Endpoints"
  assert_success
  FEAT2_ID=$(extract_item_id "$output")
  
  # Link both to Requirement
  run node "$CLI" link "$FEAT1_ID" implements "$REQ_ID"
  assert_success
  
  run node "$CLI" link "$FEAT2_ID" implements "$REQ_ID"
  assert_success
  
  # Feature 2 depends on Feature 1
  run node "$CLI" link "$FEAT2_ID" depends-on "$FEAT1_ID"
  assert_success
  
  # Create Tasks
  run node "$CLI" add task "Implement JWT tokens"
  assert_success
  TASK1_ID=$(extract_item_id "$output")
  
  run node "$CLI" link "$TASK1_ID" implements "$FEAT1_ID"
  assert_success
  
  run node "$CLI" add task "Create user CRUD endpoints"
  assert_success
  TASK2_ID=$(extract_item_id "$output")
  
  run node "$CLI" link "$TASK2_ID" implements "$FEAT2_ID"
  assert_success
  
  # Verify hierarchy and dependencies
  run node "$CLI" trace "$REQ_ID"
  assert_success
  assert_output --partial "$FEAT1_ID"
  assert_output --partial "$FEAT2_ID"
  
  # Verify dependency relationship
  run node "$CLI" get "$FEAT2_ID"
  assert_success
  assert_output --partial "depends-on"
}

# =============================================================================
# Test 6: Test Items with tested-by Relationship
# =============================================================================

@test "Create Test items linked with tested-by relationship" {
  # Create Requirement
  run node "$CLI" add requirement "Data Validation"
  assert_success
  REQ_ID=$(extract_item_id "$output")
  
  # Create Feature
  run node "$CLI" add feature "Input Validation"
  assert_success
  FEAT_ID=$(extract_item_id "$output")
  
  # Link Feature to Requirement
  run node "$CLI" link "$FEAT_ID" implements "$REQ_ID"
  assert_success
  
  # Create Test for Feature
  run node "$CLI" add test "Validate email format"
  assert_success
  TEST1_ID=$(extract_item_id "$output")
  
  run node "$CLI" add test "Validate phone numbers"
  assert_success
  TEST2_ID=$(extract_item_id "$output")
  
  # Link tests to Feature with tested-by
  run node "$CLI" link "$FEAT_ID" tested-by "$TEST1_ID"
  assert_success
  
  run node "$CLI" link "$FEAT_ID" tested-by "$TEST2_ID"
  assert_success
  
  # Verify Feature shows test relationships
  run node "$CLI" get "$FEAT_ID"
  assert_success
  assert_output --partial "tested-by"
  assert_output --partial "$TEST1_ID"
  assert_output --partial "$TEST2_ID"
  
  # Verify trace includes tests
  run node "$CLI" trace "$REQ_ID"
  assert_success
  assert_output --partial "$TEST1_ID"
  assert_output --partial "$TEST2_ID"
}

# =============================================================================
# Test 7: Complex Waterfall with Mixed Relationships
# =============================================================================

@test "Create complex Waterfall hierarchy with multiple relationship types" {
  # Create Requirement
  run node "$CLI" add requirement "E-Commerce Platform"
  assert_success
  REQ_ID=$(extract_item_id "$output")
  
  # Create Feature 1
  run node "$CLI" add feature "Shopping Cart"
  assert_success
  FEAT1_ID=$(extract_item_id "$output")
  
  # Create Feature 2
  run node "$CLI" add feature "Checkout Process"
  assert_success
  FEAT2_ID=$(extract_item_id "$output")
  
  # Link to Requirement
  run node "$CLI" link "$FEAT1_ID" implements "$REQ_ID"
  assert_success
  
  run node "$CLI" link "$FEAT2_ID" implements "$REQ_ID"
  assert_success
  
  # Checkout depends on Shopping Cart
  run node "$CLI" link "$FEAT2_ID" depends-on "$FEAT1_ID"
  assert_success
  
  # Create Bug for Feature 1
  run node "$CLI" add bug "Cart doesn't persist items"
  assert_success
  BUG_ID=$(extract_item_id "$output")
  
  run node "$CLI" link "$BUG_ID" implements "$FEAT1_ID"
  assert_success
  
  run node "$CLI" link "$BUG_ID" blocks "$FEAT1_ID"
  assert_success
  
  # Create Task for Bug
  run node "$CLI" add task "Add localStorage persistence"
  assert_success
  TASK1_ID=$(extract_item_id "$output")
  
  run node "$CLI" link "$TASK1_ID" implements "$BUG_ID"
  assert_success
  
  # Create Test for Feature 2
  run node "$CLI" add test "Verify checkout flow"
  assert_success
  TEST_ID=$(extract_item_id "$output")
  
  run node "$CLI" link "$FEAT2_ID" tested-by "$TEST_ID"
  assert_success
  
  # Verify complete structure
  run node "$CLI" trace "$REQ_ID"
  assert_success
  assert_output --partial "$FEAT1_ID"
  assert_output --partial "$FEAT2_ID"
  assert_output --partial "$BUG_ID"
  assert_output --partial "$TASK1_ID"
  assert_output --partial "$TEST_ID"
}

# =============================================================================
# Test 8: Verify Status Command with Waterfall Items
# =============================================================================

@test "Verify status command reports Waterfall items correctly" {
  # Create various Waterfall items
  run node "$CLI" add requirement "System Security"
  assert_success
  REQ_ID=$(extract_item_id "$output")
  
  run node "$CLI" add feature "Encryption"
  assert_success
  FEAT_ID=$(extract_item_id "$output")
  
  run node "$CLI" add task "Implement AES-256"
  assert_success
  TASK_ID=$(extract_item_id "$output")
  
  run node "$CLI" add bug "Weak password hashing"
  assert_success
  BUG_ID=$(extract_item_id "$output")
  
  run node "$CLI" add test "Security audit"
  assert_success
  TEST_ID=$(extract_item_id "$output")
  
  # Run status command
  run node "$CLI" status
  assert_success
  
  # Verify all item types are reported
  assert_output --partial "requirement"
  assert_output --partial "feature"
  assert_output --partial "task"
  assert_output --partial "bug"
  assert_output --partial "test"
  
  # Verify counts
  assert_output --partial "Total: 5"
}
