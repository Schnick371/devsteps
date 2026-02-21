In `packages/mcp-server/src/index.ts`:
- Import `handleWriteAnalysisReport`, `handleReadAnalysisEnvelope`, `handleWriteVerdict` from `./handlers/analysis.js`
- Add 3 entries to the tool handler Map
- Add 3 switch cases in the request handler