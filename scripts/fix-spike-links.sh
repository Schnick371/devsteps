#!/bin/bash

# Fix Spike Links - Spikes müssen Epic implementieren, nicht Story!
# Scrum Hierarchie: Epic → [Story | Spike | Bug] → Task
# Spike ist auf gleicher Ebene wie Story!

set -e

echo "🔧 Fixing Spike Links - Correcting Hierarchy..."

# SPIKE-001: MCP Server Architecture Research
echo "  Updating SPIKE-001..."
jq '.linked_items.implements = ["EPIC-003"]' .devsteps/spikes/SPIKE-001.json > /tmp/spike-001.json
mv /tmp/spike-001.json .devsteps/spikes/SPIKE-001.json

# SPIKE-002: WebView Performance Optimization Research
echo "  Updating SPIKE-002..."
jq '.linked_items.implements = ["EPIC-003"]' .devsteps/spikes/SPIKE-002.json > /tmp/spike-002.json
mv /tmp/spike-002.json .devsteps/spikes/SPIKE-002.json

# Update EPIC-003: Add Spikes to implemented-by
echo "  Updating EPIC-003..."
jq '.linked_items."implemented-by" = ["STORY-004", "SPIKE-001", "SPIKE-002"]' .devsteps/epics/EPIC-003.json > /tmp/epic-003.json
mv /tmp/epic-003.json .devsteps/epics/EPIC-003.json

# Update STORY-004: Remove Spikes from implemented-by
echo "  Updating STORY-004..."
jq 'del(.linked_items."implemented-by"[] | select(. == "SPIKE-001" or . == "SPIKE-002"))' .devsteps/stories/STORY-004.json > /tmp/story-004.json
mv /tmp/story-004.json .devsteps/stories/STORY-004.json

# Update index.json timestamps
echo "  Updating index..."
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
jq --arg ts "$TIMESTAMP" '
  .items |= map(
    if .id == "SPIKE-001" or .id == "SPIKE-002" or .id == "EPIC-003" or .id == "STORY-004" 
    then .updated = $ts 
    else . 
    end
  )
' .devsteps/index.json > /tmp/index.json
mv /tmp/index.json .devsteps/index.json

echo "✅ Spike links corrected!"
echo ""
echo "Corrected hierarchy:"
echo "  EPIC-003"
echo "  ├── STORY-004 (Stories implement Epic)"
echo "  ├── SPIKE-001 (Spikes implement Epic, not Story!)"
echo "  └── SPIKE-002 (Spikes implement Epic, not Story!)"
