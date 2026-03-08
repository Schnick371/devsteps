#!/usr/bin/env bash
# Copyright © 2025 Thomas Hertel (the@devsteps.dev)
# Licensed under the Apache License, Version 2.0
#
# VS Code 1.110 Copilot Hook — SubagentStop
# Writes a ring_stop event to .devsteps/events/spider_events.jsonl
# Receives hook context as JSON on stdin.

set -euo pipefail

EVENTS_DIR="${DEVSTEPS_WORKSPACE:-.}/.devsteps/events"
EVENTS_FILE="${EVENTS_DIR}/spider_events.jsonl"
mkdir -p "$EVENTS_DIR"

INPUT=$(cat)

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
DURATION_MS=$(printf '%s' "$INPUT" | grep -oP '"durationMs"\s*:\s*\K[0-9]+' 2>/dev/null \
  || printf '%s' "$INPUT" | grep -oP '"duration_ms"\s*:\s*\K[0-9]+' 2>/dev/null \
  || echo "null")
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")

RING=$(printf '%s' "$AGENT_NAME" | grep -oP 'R\K[0-9]+' 2>/dev/null || echo "0")

case "$RING" in
  0) RING_PHASE="Hub" ;;
  1) RING_PHASE="Analysis" ;;
  2) RING_PHASE="Validation" ;;
  3) RING_PHASE="Planning" ;;
  4) RING_PHASE="Execution" ;;
  5) RING_PHASE="Gate" ;;
  *) RING_PHASE="Unknown" ;;
esac

AGENT_TYPE=$(printf '%s' "$AGENT_NAME" | sed -E 's/^devsteps-R[0-9]+-//' | sed -E 's/-.*//')

# Format duration_ms: number or null (no quotes around numbers)
DUR_VALUE="$DURATION_MS"
if [ "$DUR_VALUE" = "null" ] || [ -z "$DUR_VALUE" ]; then
  DUR_VALUE="null"
fi

EVENT_LINE=$(printf '{"event":"ring_stop","ring":%s,"agent_name":"%s","agent_type":"%s","ring_phase":"%s","timestamp":"%s","session_id":"%s","parent_session_id":%s,"duration_ms":%s,"mandate_id":null}\n' \
  "$RING" "$AGENT_NAME" "$AGENT_TYPE" "$RING_PHASE" "$TIMESTAMP" "$SESSION_ID" \
  "$([ -n "$PARENT_SESSION_ID" ] && printf '"%s"' "$PARENT_SESSION_ID" || printf 'null')" \
  "$DUR_VALUE")

TMPFILE=$(mktemp "${EVENTS_DIR}/.spider_XXXXXX")
printf '%s\n' "$EVENT_LINE" > "$TMPFILE"
cat "$TMPFILE" >> "$EVENTS_FILE"
rm -f "$TMPFILE"

printf '{"continue":true}\n'
