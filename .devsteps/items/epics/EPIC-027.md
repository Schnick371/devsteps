# Context Budget Protocol Infrastructure

Implement a structured, machine-readable Context Budget Protocol (CBP) that enables AI agents to exchange compressed analysis verdicts and briefings via JSON envelopes stored in `.devsteps/analysis/`.

## Goals

- Replace prose markdown handoffs between agents with structured JSON envelopes
- Introduce `CompressedVerdict` and `AnalysisBriefing` Zod schemas in `shared`
- Add three MCP tools: `write_analysis_report`, `read_analysis_envelope`, `write_verdict`
- All file writes use atomic semantics (tmp → rename) to prevent stale reads
- CLI `init` creates the `analysis/` directory with `.gitignore`

## Future Upgrade Path

SQLite-backed store when MCP server runs persistently — not in scope now.