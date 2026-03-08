#!/usr/bin/env bats

# =============================================================================
# Spider Web Hook Scripts — Integration Tests
# Tests the VS Code 1.110 Copilot hook shell scripts that emit JSONL events.
# =============================================================================

load '../../.bats-helpers/bats-support/load'
load '../../.bats-helpers/bats-assert/load'
load 'test-helpers'

setup() {
  setup_isolated_test
  export HOOKS_DIR="$PROJECT_ROOT/.github/hooks"
  export DEVSTEPS_WORKSPACE="$TEST_DIR"
  export EVENTS_FILE="$TEST_DIR/.devsteps/events/spider_events.jsonl"
}

teardown() {
  teardown_isolated_test
}

# --- spider-ring-start.sh ---

@test "ring-start: creates events dir and JSONL file" {
  run bash "$HOOKS_DIR/spider-ring-start.sh" <<< '{"agentName":"devsteps-R1-analyst-archaeology","sessionId":"sess-001"}'
  assert_success
  assert_output --partial '"continue":true'
  [ -f "$EVENTS_FILE" ]
}

@test "ring-start: emits valid ring_start event with correct fields" {
  run bash "$HOOKS_DIR/spider-ring-start.sh" <<< '{"agentName":"devsteps-R1-analyst-archaeology","sessionId":"sess-002"}'
  assert_success

  # Read the JSONL line
  line=$(head -1 "$EVENTS_FILE")
  echo "# JSONL: $line" >&3

  # Validate fields
  echo "$line" | grep -q '"event":"ring_start"'
  echo "$line" | grep -q '"ring":1'
  echo "$line" | grep -q '"agent_name":"devsteps-R1-analyst-archaeology"'
  echo "$line" | grep -q '"agent_type":"analyst"'
  echo "$line" | grep -q '"ring_phase":"Analysis"'
  echo "$line" | grep -q '"session_id":"sess-002"'
}

@test "ring-start: extracts ring 0 for coord agent" {
  run bash "$HOOKS_DIR/spider-ring-start.sh" <<< '{"agentName":"devsteps-R0-coord-sprint","sessionId":"sess-003"}'
  assert_success

  line=$(head -1 "$EVENTS_FILE")
  echo "$line" | grep -q '"ring":0'
  echo "$line" | grep -q '"ring_phase":"Hub"'
}

@test "ring-start: falls back to agent_type field name" {
  run bash "$HOOKS_DIR/spider-ring-start.sh" <<< '{"agent_type":"devsteps-R4-exec-impl","sessionId":"sess-004"}'
  assert_success

  line=$(head -1 "$EVENTS_FILE")
  echo "$line" | grep -q '"agent_name":"devsteps-R4-exec-impl"'
  echo "$line" | grep -q '"ring":4'
}

@test "ring-start: defaults to unknown when no agent field present" {
  run bash "$HOOKS_DIR/spider-ring-start.sh" <<< '{"sessionId":"sess-005"}'
  assert_success

  line=$(head -1 "$EVENTS_FILE")
  echo "$line" | grep -q '"agent_name":"unknown"'
}

@test "ring-start: handles parentSessionId" {
  run bash "$HOOKS_DIR/spider-ring-start.sh" <<< '{"agentName":"devsteps-R2-aspect-impact","sessionId":"sess-006","parentSessionId":"parent-001"}'
  assert_success

  line=$(head -1 "$EVENTS_FILE")
  echo "$line" | grep -q '"parent_session_id":"parent-001"'
}

# --- spider-ring-stop.sh ---

@test "ring-stop: emits ring_stop with duration_ms" {
  run bash "$HOOKS_DIR/spider-ring-stop.sh" <<< '{"agentName":"devsteps-R1-analyst-risk","sessionId":"sess-010","durationMs":4200}'
  assert_success
  assert_output --partial '"continue":true'

  line=$(head -1 "$EVENTS_FILE")
  echo "# JSONL: $line" >&3

  echo "$line" | grep -q '"event":"ring_stop"'
  echo "$line" | grep -q '"ring":1'
  echo "$line" | grep -q '"agent_name":"devsteps-R1-analyst-risk"'
  echo "$line" | grep -q '"duration_ms":4200'
  echo "$line" | grep -q '"session_id":"sess-010"'
}

@test "ring-stop: uses null for missing duration" {
  run bash "$HOOKS_DIR/spider-ring-stop.sh" <<< '{"agentName":"devsteps-R5-gate-reviewer","sessionId":"sess-011"}'
  assert_success

  line=$(head -1 "$EVENTS_FILE")
  echo "$line" | grep -q '"duration_ms":null'
}

# --- spider-session-end.sh ---

@test "session-end: emits session_end event" {
  run bash "$HOOKS_DIR/spider-session-end.sh" <<< '{"sessionId":"sess-020"}'
  assert_success
  assert_output --partial '"continue":true'

  line=$(head -1 "$EVENTS_FILE")
  echo "# JSONL: $line" >&3

  echo "$line" | grep -q '"event":"session_end"'
  echo "$line" | grep -q '"ring":0'
  echo "$line" | grep -q '"agent_name":"session"'
  echo "$line" | grep -q '"session_id":"sess-020"'
}

@test "session-end: falls back to session_id field name" {
  run bash "$HOOKS_DIR/spider-session-end.sh" <<< '{"session_id":"sess-021"}'
  assert_success

  line=$(head -1 "$EVENTS_FILE")
  echo "$line" | grep -q '"session_id":"sess-021"'
}

# --- Multi-event append ---

@test "multiple events append correctly to same JSONL" {
  bash "$HOOKS_DIR/spider-ring-start.sh" <<< '{"agentName":"devsteps-R1-analyst-archaeology","sessionId":"sess-030"}'
  bash "$HOOKS_DIR/spider-ring-start.sh" <<< '{"agentName":"devsteps-R1-analyst-risk","sessionId":"sess-030"}'
  bash "$HOOKS_DIR/spider-ring-stop.sh" <<< '{"agentName":"devsteps-R1-analyst-archaeology","sessionId":"sess-030","durationMs":1500}'
  bash "$HOOKS_DIR/spider-session-end.sh" <<< '{"sessionId":"sess-030"}'

  # Should have 4 lines
  line_count=$(wc -l < "$EVENTS_FILE")
  [ "$line_count" -eq 4 ]

  # Verify event types in order
  sed -n '1p' "$EVENTS_FILE" | grep -q '"event":"ring_start"'
  sed -n '2p' "$EVENTS_FILE" | grep -q '"event":"ring_start"'
  sed -n '3p' "$EVENTS_FILE" | grep -q '"event":"ring_stop"'
  sed -n '4p' "$EVENTS_FILE" | grep -q '"event":"session_end"'
}
