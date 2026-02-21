# Shared Schemas and Types

Add Zod schemas and TypeScript types for `CompressedVerdict` and `AnalysisBriefing` JSON envelopes to the `shared` package.

## Acceptance Criteria

- `packages/shared/src/schemas/analysis.ts` created with Zod schemas
- `CompressedVerdict` schema: structured JSON (not prose), machine-readable
- `AnalysisBriefing` schema: structured JSON briefing format
- Schemas re-exported from `packages/shared/src/schemas/index.ts`
- Inferred TypeScript types exported from `packages/shared/src/types/index.ts`