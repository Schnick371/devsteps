#!/usr/bin/env bash
# Copyright © 2025 Thomas Hertel (the@devsteps.dev)
# Licensed under the Apache License, Version 2.0
#
# VS Code 1.110 Copilot Hook — Stop
# Writes a session_end event to .devsteps/events/spider_events.jsonl
# Receives hook context as JSON on stdin.

set -euo pipefail

EVENTS_DIR="${DEVSTEPS_WORKSPACE:-.}/.devsteps/events"
EVENTS_FILE="${EVENTS_DIR}/spider_events.jsonl"
mkdir -p "$EVENTS_DIR"

INPUT=$(cat)

SESSION_ID=$(printf '%s' "$INPUT" | grep -oP '"sessionId"\s*:\s*"\K[^"]+' 2>/dev/null \
  || printf '%s' "$INPUT" | grep -oP '"session_id"\s*:\s*"\K[^"]+' 2>/dev/null \
  || echo "unknown")
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")

EVENT_LINE=$(printf '{"event":"session_end","ring":0,"agent_name":"session","agent_type":"session","ring_phase":"Hub","timestamp":"%s","session_id":"%s","parent_session_id":null,"duration_ms":null,"mandate_id":null}\n' \
  "$TIMESTAMP" "$SESSION_ID")

TMPFILE=$(mktemp "${EVENTS_DIR}/.spider_XXXXXX")
printf '%s\n' "$EVENT_LINE" > "$TMPFILE"
cat "$TMPFILE" >> "$EVENTS_FILE"
rm -f "$TMPFILE"

printf '{"continue":true}\n'
