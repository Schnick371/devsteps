# Story: Knowledge Item Templates System

## User Story
As a developer, I want customizable templates for different knowledge types so that I can create consistent, well-structured documentation quickly.

## Acceptance Criteria
- [ ] Built-in templates for:
  - Lesson Learned (Problem-Solution-Outcome)
  - Design Pattern (Context-Forces-Solution-Consequences)
  - Anti-Pattern (Symptoms-Causes-Better Alternative)
  - ADR (Context-Options-Decision-Consequences)
- [ ] Custom template creation:
  - `devsteps template create lesson --name "Security Incident"`
  - Template stored in `.devsteps/templates/`
- [ ] Template variables: `{{problem}}`, `{{solution}}`, `{{author}}`
- [ ] Interactive wizard fills template
- [ ] Organization-wide templates (sync via central repo)

## Example Template
```markdown
# 💡 Lesson Learned: {{title}}

## Problem
{{problem_description}}

## Context
- When did this occur? {{date}}
- What were we trying to achieve? {{goal}}
- What triggered the issue? {{trigger}}

## Attempted Solutions
{{failed_approaches}}

## Working Solution
{{solution}}

## Why It Worked
{{explanation}}

## Takeaways
{{lessons}}

## Related
- Implements: {{implements_id}}
- Related Patterns: {{patterns}}
```

## Technical Notes
- Support Markdown + Mustache templating
- Validate required fields
- Preview before creating item