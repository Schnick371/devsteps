Create new file `packages/mcp-server/src/handlers/analysis.ts`.

Implement:
- `handleWriteAnalysisReport(args)` — validate with `AnalysisBriefingSchema`, write JSON to `.devsteps/analysis/<analyst>-<timestamp>.json` using atomic write (tmp → rename)
- `handleReadAnalysisEnvelope(args)` — read and parse JSON from `.devsteps/analysis/<filename>`
- `handleWriteVerdict(args)` — validate with `CompressedVerdictSchema`, write JSON to `.devsteps/analysis/verdict-<timestamp>.json` using atomic write (tmp → rename)

Atomic write pattern: `fs.writeFile(path + '.tmp', ...)` then `fs.rename(path + '.tmp', path)`.