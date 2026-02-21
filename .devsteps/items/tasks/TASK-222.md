Create new file `packages/shared/src/schemas/analysis.ts`.

Define Zod schemas:
- `CompressedVerdictSchema`: `{ decision, winner, keyRefinements: string[], futureUpgradePath?, timestamp, implementationScope: { filesToChange: { path, description }[], newFiles: string[] } }`
- `AnalysisBriefingSchema`: `{ analyst, topic, summary, findings: { key, value, confidence }[], recommendation, timestamp }`

Use `z.object()`, no prose fields — all structured JSON.