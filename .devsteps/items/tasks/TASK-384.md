Extend `DocsMapNode` type in `packages/shared/src/types/docs-map.ts` with two new optional fields:

```typescript
doc_subtype?: 'tutorial' | 'how-to' | 'reference' | 'explanation' | 'architecture' | 'research'
generated?: boolean  // true = AI-generated agent output, false/undefined = human-authored
```

**Rationale (Extended Diataxis):**
- `tutorial`, `how-to`, `reference`, `explanation` map to the 4 Diataxis quadrants
- `architecture` is a specialization of `explanation` for system design docs
- `research` is a 5th non-Diataxis category for investigation outputs, SPIKE briefs, analyst/aspect reports
- `generated: true` distinguishes AI-generated files from human-authored docs

**Downstream updates required:**
1. `DocsMapNode` type definition
2. `DocsMapPositionEntry` shadow type (if it mirrors DocsMapNode fields)
3. `docs-map.ts` `writeDocsMap()` and `rebuildDocsMapShadow()` — passthrough (additive, no breaking change)