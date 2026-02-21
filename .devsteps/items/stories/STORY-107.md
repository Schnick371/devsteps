# Agent Prompt Updates

Update aspect agents and impl-subagent prompt files to use structured JSON envelopes (CompressedVerdict / AnalysisBriefing) for handoffs instead of prose markdown.

## Acceptance Criteria

- Aspect agents write `AnalysisBriefing` JSON via `write_analysis_report` MCP tool
- Coordinator reads briefings via `read_analysis_envelope` and writes `CompressedVerdict` via `write_verdict`
- Impl-subagent reads `CompressedVerdict` JSON at session start
- All agent `.agent.md` files updated with new workflow instructions