# Story: New Knowledge Item Types

## User Story
As a developer, I want to create specialized knowledge items (lessons, patterns, antipatterns, decisions) so that I can systematically document and categorize different types of organizational learning.

## Acceptance Criteria
- [ ] Add `lesson`, `pattern`, `antipattern`, `decision` to ItemType enum
- [ ] Extend schemas with knowledge-specific fields:
  - **Lesson**: problem, context, solution, outcome, learned_at
  - **Pattern**: use_cases, code_examples, pros_cons, related_patterns
  - **Antipattern**: symptoms, why_fails, better_alternative
  - **Decision**: context, options_considered, chosen_option, consequences, review_date
- [ ] Update TypeScript types in shared package
- [ ] Add validation schemas for knowledge items
- [ ] Update CLI/MCP to recognize new types

## Technical Notes
Follow ADR format for `decision` type (Microsoft Azure style):
```typescript
interface Decision {
  context: string;           // Why decision needed
  options: Option[];         // Alternatives considered
  chosen: string;           // What was decided
  consequences: string;     // Trade-offs and impacts
  review_date?: Date;       // When to revisit
}
```

## References
- Architecture Decision Records (ADR) format
- Lesson Learned templates from Knowledge Management best practices