# Story: Anti-Pattern Registry

## User Story
As a developer, I want to document failed approaches and their symptoms so that my team doesn't repeat the same mistakes.

## Acceptance Criteria
- [ ] Create `devsteps add antipattern <title>` command
- [ ] Required fields:
  - Symptoms (how to recognize the problem)
  - Why it fails (root cause explanation)
  - Better alternative (link to PATTERN)
- [ ] Mark existing work items as antipatterns:
  - `devsteps update BUG-016 --mark-as-antipattern "FileDecorationProvider doesn't work - WRONG"`
- [ ] Show antipattern warnings in search results
- [ ] Dashboard section: "⚠️ Common Pitfalls"

## Example
```bash
$ devsteps add antipattern "Using Uri.parse() for custom URI schemes" \\
  --symptoms "FileDecorations not appearing, wrong scheme in logs" \\
  --why-fails "Uri.parse() treats custom scheme as file path" \\
  --better-alternative PATTERN-001 \\
  --relates-to BUG-017

✅ Created ANTIPATTERN-001
```

## Technical Notes
- Antipatterns should be highly visible in search
- Consider "Did you mean to avoid...?" suggestions
- Link to superseding patterns