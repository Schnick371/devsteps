## Ziel

Strukturierte Acceptance-Criteria als abcheckbare Liste statt Prosa in der Beschreibung.

### Schema-Erweiterung

```typescript
acceptance_criteria: z.array(z.object({
  criterion: z.string(),
  met: z.boolean().default(false),
  evidence: z.string().optional(),
  verified_at: z.string().datetime().optional()
})).default([])
```

### Tool: devsteps_verify

```
devsteps_verify({
  item_id: 'TASK-042',
  criterion_index: 2,
  met: true,
  evidence: 'Unit test in auth.test.ts passing'
})
```

### Integration

- `devsteps_get` zeigt Criteria-Status (3/5 met)
- Reviewer prüft gegen objektive Criteria
- `devsteps_status` zeigt Criteria-Completion pro Sprint

### Acceptance Criteria

- [ ] Schema-Migration für bestehende Items
- [ ] devsteps_verify Tool funktional
- [ ] Criteria-Percentage in devsteps_get Response
- [ ] Reviewer kann Criteria programmatisch prüfen