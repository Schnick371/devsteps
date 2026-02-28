## Ziel

Knowledge-System als eigenes Subsystem mit 3 Schema-Gruppen: ADR, Convention, Knowledge-Entry. Ersetzt den Ansatz aus STORY-022 (Items als Knowledge-Träger) durch ein eigenständiges Datenmodell.

### Problem mit STORY-022

STORY-022 wollte Knowledge als ItemType-Erweiterungen modellieren. Das ist falsch weil:
1. Items haben den falschen Lifecycle (draft→done). Knowledge hat typspezifische Lifecycles (proposed→accepted→deprecated)
2. Items haben irrelevante Felder (eisenhower, estimated_effort). Knowledge braucht andere Felder
3. Queries sind fundamental verschieden ("alle aktiven Konventionen für shared/" ≠ "alle in-progress Stories")

### 8 Knowledge-Typen

| Typ | Lifecycle | Beispiel |
|-----|-----------|---------|
| ADR | proposed→accepted→deprecated→superseded | "JWT statt OAuth2 weil single-tenant" |
| Convention | active→deprecated | "Export alle Schemas aus index.ts" |
| Discovery | unverified→validated→invalidated | "esbuild strippt const enum" |
| Anti-Pattern | documented→resolved | "Nie tsc für Build verwenden" |
| Prerequisite | active→obsolete | "npm run build vor Schema-Änderungen" |
| Environment | active→obsolete | "CI braucht Node 22+" |
| Glossary | active→deprecated | "CBP = Context Budget Protocol" |
| Heuristic | active→refined→superseded | "Story mit >5 Tasks splitten" |

### Zod-Schemas

1. **AdrSchema** — MADR-kompatibel: id (ADR-NNN), title, status, date, deciders[], context, decision, alternatives[{title,pros[],cons[],chosen}], consequences[{description,impact}], triggered_by[], establishes_conventions[], superseded_by?, tags[], affected_paths[]
2. **ConventionSchema** — id (CONV-NNN), rule, rationale, status, enforcement (must/should/may), applies_to[] (globs), packages[], examples[{code,correct,explanation}], source_adr?, tags[]
3. **KnowledgeEntrySchema** — id (KNOW-NNN), type (8 types), title, status, content, what_was_tried?, why_it_failed?, better_alternative?, prerequisite_action?, tags[]

### Storage

```
.devsteps/knowledge/
  ├── index.json (Counter + lightweight index)
  ├── adrs/ADR-001.json (+optional .md companion)
  ├── conventions/CONV-001.json
  └── entries/KNOW-001.json
```

### Acceptance Criteria

- [ ] Alle 3 Schema-Gruppen validieren korrekt
- [ ] MADR-Kompatibilität für ADRs
- [ ] RFC 2119 Enforcement-Level für Conventions
- [ ] Index.json für Auto-ID-Generierung
- [ ] Export über shared/index.ts