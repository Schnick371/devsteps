#!/usr/bin/env bash
# Copyright © 2025 Thomas Hertel (the@devsteps.dev)
# Licensed under the Apache License, Version 2.0
#
# VS Code 1.110 Copilot Hook — SubagentStart
# Writes a ring_start event to .devsteps/events/spider_events.jsonl
# Receives hook context as JSON on stdin.

set -euo pipefail

EVENTS_DIR="${DEVSTEPS_WORKSPACE:-.}/.devsteps/events"
EVENTS_FILE="${EVENTS_DIR}/spider_events.jsonl"
mkdir -p "$EVENTS_DIR"

# Read hook payload from stdin
INPUT=$(cat)

# Extract fields — try multiple field names for VS Code 1.110 compatibility
# VS Code may use agentName, agent_type, or chatAgent.name depending on event type
AGENT_NAME=$(printf '%s' "$INPUT" | grep -oP '"agentName"\s*:\s*"\K[^"]+' 2>/dev/null \
  || printf '%s' "$INPUT" | grep -oP '"agent_type"\s*:\s*"\K[^"]+' 2>/dev/null \
  || printf '%s' "$INPUT" | grep -oP '"name"\s*:\s*"\K[^"]+' 2>/dev/null \
  || echo "unknown")
SESSION_ID=$(printf '%s' "$INPUT" | grep -oP '"sessionId"\s*:\s*"\K[^"]+' 2>/dev/null \
  || printf '%s' "$INPUT" | grep -oP '"session_id"\s*:\s*"\K[^"]+' 2>/dev/null \
  || echo "unknown")
PARENT_SESSION_ID=$(printf '%s' "$INPUT" | grep -oP '"parentSessionId"\s*:\s*"\K[^"]+' 2>/dev/null \
  || printf '%s' "$INPUT" | grep -oP '"parent_session_id"\s*:\s*"\K[^"]+' 2>/dev/null \
  || echo "")
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")

# Extract ring number from agent name (e.g. devsteps-R1-analyst-archaeology → 1)
RING=$(printf '%s' "$AGENT_NAME" | grep -oP 'R\K[0-9]+' 2>/dev/null || echo "0")

# Derive agent type from ring number
case "$RING" in
  0) RING_PHASE="Hub" ;;
  1) RING_PHASE="Analysis" ;;
  2) RING_PHASE="Validation" ;;
  3) RING_PHASE="Planning" ;;
  4) RING_PHASE="Execution" ;;
  5) RING_PHASE="Gate" ;;
  *) RING_PHASE="Unknown" ;;
esac

# Derive short agent type from name
AGENT_TYPE=$(printf '%s' "$AGENT_NAME" | sed -E 's/^devsteps-R[0-9]+-//' | sed -E 's/-.*//')

# Append JSONL event (atomic via temp file + mv to prevent partial reads)
EVENT_LINE=$(printf '{"event":"ring_start","ring":%s,"agent_name":"%s","agent_type":"%s","ring_phase":"%s","timestamp":"%s","session_id":"%s","parent_session_id":%s,"duration_ms":null,"mandate_id":null}\n' \
  "$RING" "$AGENT_NAME" "$AGENT_TYPE" "$RING_PHASE" "$TIMESTAMP" "$SESSION_ID" \
  "$([ -n "$PARENT_SESSION_ID" ] && printf '"%s"' "$PARENT_SESSION_ID" || printf 'null')")

# Append atomically: write to temp then append via cat (POSIX-safe)
TMPFILE=$(mktemp "${EVENTS_DIR}/.spider_XXXXXX")
printf '%s\n' "$EVENT_LINE" > "$TMPFILE"
cat "$TMPFILE" >> "$EVENTS_FILE"
rm -f "$TMPFILE"

# Signal continuation to VS Code (required stdout JSON)
printf '{"continue":true}\n'
