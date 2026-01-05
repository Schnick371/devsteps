## Research Question

How should DevSteps handle **ephemeral/technical tasks** that don't require long-term traceability?

## Core Distinction

| Aspekt | Product Backlog (DevSteps) | Sprint Backlog (ephemere Tasks) |
|--------|---------------------------|--------------------------------|
| **Zweck** | Langfristige Traceability & Dokumentation | Kurzfristige Ausführungsplanung |
| **Lebensdauer** | Unbegrenzt (Archiviert, nie gelöscht) | Sprint-Dauer (2-4 Wochen) |
| **Wert** | Geschäfts-/Nutzerwert | Technischer Umsetzungsschritt |
| **Owner** | Product Owner/Team | Developers |
| **Granularität** | WHY + WHAT | HOW |
| **Beispiele** | Epic, Story, Feature, Bug | Fix Tests, Refactoring, Code Review Findings |

## Background

AI agents (like GitHub Copilot) often create standalone Tasks for immediate technical fixes (e.g., "Fix Mock Assertions for Config Functions"). These tasks:
- Have no connection to Stories/Features
- Provide no long-term documentation value
- Clutter the archive with noise
- Don't represent requirements or implementations

## Research Areas

### 1. Definition of Tracked (DoT)
- What criteria determine if work belongs in DevSteps (Product Backlog)?
- Clear rules for AI agents and developers
- When does technical work become trackable?

### 2. Item Type Options
Evaluate introducing new concepts:
- `chore` type - Ephemeral technical work, auto-deleted after completion
- `ephemeral: true` flag - Mark any task as non-archivable
- Sprint Backlog separation - DevSteps = Product Backlog only

### 3. Industry Best Practices
- Scrum.org: Technical tasks belong in Sprint Backlog (developer-owned)
- Product Backlog vs Sprint Backlog distinction
- Technical debt tracking patterns

## Success Criteria

1. Clear recommendation for DevSteps policy (Product Backlog vs Sprint Backlog boundary)
2. If new type/flag recommended: Implementation proposal
3. Updated AI agent instructions to prevent improper task creation

## References

- [Scrum.org: Product Backlog Items VS Technical Tasks](https://www.scrum.org/forum/scrum-forum/98769/product-backlog-items-vs-technical-tasks)
- [Medium: Stop Creating Tech Stories](https://medium.com/codex/stop-creating-technical-stories-f5e7bc424ff8)
- [Mountain Goat Software: Product Backlog](https://www.mountaingoatsoftware.com/agile/scrum/scrum-tools/product-backlog)
- [Atlassian: Product Backlog vs Sprint Backlog](https://www.atlassian.com/agile/project-management/sprint-backlog-product-backlog)