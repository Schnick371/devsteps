# Story: Architecture Decision Log (ADR-style)

## User Story
As a technical lead, I want to document architectural decisions with context and trade-offs so that future developers understand why choices were made.

## Acceptance Criteria
- [ ] Create `devsteps add decision <title>` command
- [ ] Follow Microsoft ADR template:
  - Context (why decision needed)
  - Options considered (alternatives + trade-offs)
  - Decision (what was chosen)
  - Consequences (positive + negative impacts)
  - Review date (when to revisit)
- [ ] Auto-create decisions from Spike completions
- [ ] Link decisions to resulting Stories
- [ ] Status: proposed → accepted → superseded → deprecated

## Example
```bash
$ devsteps add decision "Use FileDecorationProvider for status badges" \\
  --context "Need visual status indicators in TreeView" \\
  --option "TreeItem.description: Simple but not in separate column" \\
  --option "FileDecorationProvider: Native VS Code API, proper badges" \\
  --chosen "FileDecorationProvider with custom URI scheme" \\
  --consequence "Pro: Native appearance, theme-adaptive" \\
  --consequence "Con: Requires custom URI scheme handling" \\
  --links-to SPIKE-002

✅ Created DECISION-001 (status: accepted)
```

## References
- Microsoft Azure ADR format
- AWS Prescriptive Guidance ADR process