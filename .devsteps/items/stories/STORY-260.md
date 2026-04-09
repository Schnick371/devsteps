handleWriteAnalysisReport in packages/mcp-server/src/handlers/analysis.ts has ZERO test coverage — concurrent write safety (atomicWriteJson .tmp→rename), schema validation, and path construction are entirely untested.

Test surface:
- 5 unit tests for handleWriteAnalysisReport: valid IDs, PLAN-* ID (after schema fix), invalid ID, concurrent atomic write, missing fields
- 4 BATS integration tests for devsteps artifacts subcommand: status, dry-run clean, clean, archive

Affected: packages/mcp-server/src/handlers/__tests__/ (new), tests/integration/artifacts.bats (new)