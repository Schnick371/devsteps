Add 3 tool definition objects to the tools array in `packages/mcp-server/src/tools/index.ts`:
- `write_analysis_report`: inputSchema mirrors AnalysisBriefingSchema fields
- `read_analysis_envelope`: inputSchema `{ filename: string }`
- `write_verdict`: inputSchema mirrors CompressedVerdictSchema fields