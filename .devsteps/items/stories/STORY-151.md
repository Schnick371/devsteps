## Ziel

Persistente asynchrone Fragen zwischen KI und Mensch.

### Problem

KI-Fragen gehen verloren wenn die Session endet. "⚠️ DECISION REQUIRED" im Chat ist ephemeral.

### Tools

1. **devsteps_ask** (write) — KI stellt Frage:
```
devsteps_ask({
  question: 'Token Refresh: Sliding Window oder Fixed Expiry?',
  item_id?: 'TASK-042',
  context?: 'JWT Token Management',
  options?: ['Sliding Window', 'Fixed Expiry', 'Hybrid'],
  urgency: 'blocking' | 'important' | 'nice-to-know'
})
```

2. **devsteps_answers** (read) — KI liest Antworten:
```
devsteps_answers({ status: 'answered' | 'pending' | 'all' })
```

### Human-Side

- CLI: `devsteps answer Q-001 "Sliding Window weil..."`
- Extension: Panel mit offenen Fragen
- Session-Resume: Unbeantwortete Fragen auto-inkludiert

### Storage

`.devsteps/questions/Q-{NNN}.json`

### Acceptance Criteria

- [ ] Fragen persistent über Sessions
- [ ] CLI-Command zum Beantworten
- [ ] Resume integriert unbeantwortete Fragen
- [ ] Urgency-Level für Priorisierung