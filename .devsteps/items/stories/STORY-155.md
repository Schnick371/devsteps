## Ziel

devsteps_add soll vor dem Erstellen automatisch auf ähnliche bestehende Items prüfen.

### Problem

Prompt-Guidance sagt "search before create" aber die KI überspringt das oft. Doppelte Items entstehen.

### Implementation

Vor dem Erstellen: Fuzzy-Suche über Titel-Similarity + Tag-Overlap + affected_paths-Overlap.

```
Response:
{
  created: item,
  potential_duplicates: [
    { id: 'TASK-040', title: '...', similarity: 0.85 }
  ],
  // Wenn similarity > 0.8: require force: true
  warning: 'Similar item exists: TASK-040'
}
```

### Acceptance Criteria

- [ ] Fuzzy-Matching mit konfigurierbarem Threshold
- [ ] Warnungen bei hoher Similarity
- [ ] force:true für Override
- [ ] Performance < 200ms für 500 Items