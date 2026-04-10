## Context

5 handlers at the core of the Spider Web dispatch protocol have **zero test coverage**. These are the most-called tools by coord agents in production and represent the highest regression risk.

## Handlers to Cover

| Handler | Risk |
|---|---|
| `write_analysis_report` | Atomic write contract, report_path generation, schema validation |
| `write_dispatch_manifest` | Dispatch tracking, triage tier validation |
| `read_mandate_results` | Quorum logic, expected_agent_names matching, envelope structure |
| `read_analysis_envelope` | File read, envelope parsing, missing-file error handling |
| `write_mandate_result` | UUID-keyed write, analyst metadata |

## Acceptance Criteria

- ≥5 tests per handler (happy path, schema validation, atomic write, error cases, edge cases)
- All tests in `packages/mcp-server/tests/handlers/spider-web/`
- Mocks for filesystem operations (no real disk writes in unit tests)
- Integration test for quorum tracking in `read_mandate_results`

## Ishikawa Source

Identified in Ishikawa workspace health scan — Tests bone 🔴 HIGH finding.