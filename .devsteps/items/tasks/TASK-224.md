Add inferred TypeScript type exports:
```ts
export type CompressedVerdict = z.infer<typeof CompressedVerdictSchema>
export type AnalysisBriefing = z.infer<typeof AnalysisBriefingSchema>
```