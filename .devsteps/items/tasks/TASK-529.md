Create packages/mcp-server/src/handlers/__tests__/write-analysis-report.test.ts with 5 vitest tests:
1. valid EPIC-/STORY-/TASK-NNN ID → report written successfully
2. PLAN-* ID accepted after schema fix → report written to .devsteps/analysis/
3. invalid ID (random string) → Zod error before any filesystem write
4. concurrent atomic write: two simultaneous calls to same path → exactly one valid JSON, no .tmp ghost file
5. missing required fields (verdict missing) → Zod error

Affected: packages/mcp-server/src/handlers/__tests__/write-analysis-report.test.ts (new)