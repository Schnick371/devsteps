Author the foundational specification that all other agent artifact stories depend on. Covers: canonical path hierarchy (session-scoped dirs), naming convention by ring (analyst-{type}-{ITEM-ID}-sessionN.md), lifecycle states (CREATED→LINKED→ARCHIVED→DELETED), TTL tiers (30d default, sprint-close archive, done=permanent), and routing rules (when to use tmp/ vs .devsteps/analysis/ vs docs/research/).

Deliverables:
1. docs/architecture/AGENT-OUTPUT-PROTOCOL.md (full specification)
2. .github/instructions/devsteps-agent-output-protocol.instructions.md (applyTo: .github/agents/**)

Must be completed before: Schema Story, CLI Story, Agent Updates Story, Migration Story.