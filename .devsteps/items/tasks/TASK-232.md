Edit impl-subagent `.agent.md` / `.prompt.md` to:
- Call `read_analysis_envelope` with the latest verdict filename at session start
- Parse `CompressedVerdict` JSON to extract `implementationScope`, `decision`, `keyRefinements`
- Use structured data instead of parsing prose markdown