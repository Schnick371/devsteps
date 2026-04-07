Implement `devsteps add --type doc` with validated metadata schema.

**DOC metadata Zod schema:**
```typescript
z.object({
  doc_path: z.string(),              // "docs/architecture/deployment.md"
  anchor: z.string().optional(),     // "#phase-2-deployment"
  diataxis_type: z.enum(['tutorial', 'how-to', 'reference', 'explanation']).optional(),
  arch_node_id: z.string().optional(),  // "ARCH-042" — bridge to docs-map ARCH tree
  confidence: z.number().min(0).max(1).optional(),  // AI-generated confidence
  keywords: z.array(z.string()).optional(),  // CRITICAL for search quality
})
```

**Notes:**
- `line_number` is explicitly EXCLUDED (fragile — stale on every file edit; use docs-map-positions.json instead)
- `doc_subtype` is excluded (use metadata.classification.topic from taxonomy)
- `source_spike` is excluded (use linked_items.documented-by relation)
- `keywords` is the MOST CRITICAL field — enables `mcp_devsteps_search` to find doc content

Research preservation pipeline: `git mv tmp/analyst-X.md docs/research/` → `devsteps add --type doc --path docs/research/analyst-X.md --keywords "..."` → `devsteps link DOC-001 documented-by SPIKE-041`