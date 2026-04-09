Create a GitHub Copilot instruction file that makes the agent output protocol machine-applicable for all agent files. Use YAML frontmatter `applyTo: '.github/agents/**'` so it auto-applies to all agent dispatches.

Content: condensed rules from AGENT-OUTPUT-PROTOCOL.md covering naming regex, routing decision (tmp/ vs .devsteps/analysis/), lifecycle transitions, TTL enforcement, and the mandatory write_analysis_report registration step after tmp/ writes.

Affected: .github/instructions/devsteps-agent-output-protocol.instructions.md (new file)