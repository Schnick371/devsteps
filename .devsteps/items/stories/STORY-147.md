## Ziel

Automatisches Surfacing von relevantem Knowledge an den richtigen Stellen im Workflow.

### Integration Points

1. **Session Start** (devsteps-20-start-work.prompt.md):
   - `get_relevant_knowledge(item_id: current_task)` → "3 Conventions apply, 1 Anti-Pattern to avoid"
   - Automatisch in den Kontext des Arbeits-Prompts eingebaut

2. **Mid-Implementation** (T2-impl Agent):
   - Vor jeder Dateiänderung: `get_relevant_knowledge(files: [target_file])`
   - Convention-Violations als Warnung

3. **Code Review** (devsteps-25-review.prompt.md):
   - `query_knowledge(kind: convention, status: active, path: changed_files_glob)`
   - Convention-Verletzung → Rejection mit CONV-ID Referenz

4. **Post-Implementation**:
   - Wenn etwas Unerwartetes entdeckt wurde: `write_knowledge(entry, type: discovery)`
   - Wenn ein neues Pattern etabliert wurde: `write_knowledge(convention)`

### Context Enhancement

Erweitere `devsteps_context(standard)` Response:
```
knowledge_summary: {
  total_adrs, total_conventions, total_entries,
  recent_adrs: [{id, title, status, date}],
  last_updated
}
```

### Acceptance Criteria

- [ ] Context-Tool gibt Knowledge-Summary zurück
- [ ] Mindestens 2 Prompt-Files erweitert
- [ ] get_relevant_knowledge in Review-Workflow integriert
- [ ] Convention-Warnings in T2-impl Agent Instructions