Write the authoritative architecture document for agent output file management. Must cover:
1. Canonical path hierarchy: session-scoped directories (tmp/{ITEM-ID}/{session}/)
2. Naming convention per ring/agent-type: {ring}-{agent-type}-{ITEM-ID}-session{N}.md
3. Lifecycle state machine: CREATED → LINKED → ARCHIVED → DELETED with valid transitions
4. TTL tiers: 30d default → sprint-close archive → permanent at item done
5. Routing decision tree: when to write to tmp/ vs .devsteps/analysis/ vs docs/research/
6. Migration guide for existing 131 legacy tmp/ files

Affected: docs/architecture/AGENT-OUTPUT-PROTOCOL.md (new file)