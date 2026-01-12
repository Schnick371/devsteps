# Story: Architecture Decision Log (ADR-style)

## User Story
As a technical lead, I want to document architectural decisions with context and trade-offs so that future developers understand why choices were made.

## Acceptance Criteria
- [ ] Create `devsteps add decision <title>` command
- [ ] Follow **Enhanced ADR template** (Michael Nygard + Fitness Functions):
  - Context (why decision needed)
  - Options considered (alternatives + trade-offs)
  - Decision (what was chosen)
  - **Fitness Functions** (how to validate decision holds) ⭐ NEW
  - Consequences (positive + negative impacts)
  - Review date (when to revisit)
- [ ] Auto-create decisions from Spike completions
- [ ] Auto-suggest fitness functions based on decision type
- [ ] Link decisions to resulting Stories
- [ ] Status: proposed → accepted → superseded → deprecated

## Enhanced ADR Template (Evolutionary Architecture)

Based on:
- Michael Nygard's ADR template (industry standard)
- ThoughtWorks Fitness Functions (automation)
- "Evolutionäre Architektur" (Heise 2025) - measurable validation

### Template Structure
```markdown
# ADR-XXX: [Decision Title]

## Status
[proposed | accepted | superseded | deprecated]

## Context
Why is this decision needed? What problem are we solving?

## Options Considered
1. **Option A:** Description
   - Pros: ...
   - Cons: ...
   - Trade-offs: ...

2. **Option B:** Description
   - Pros: ...
   - Cons: ...
   - Trade-offs: ...

## Decision
We will [chosen option] because [rationale].

## Fitness Functions ⭐ NEW
Automated checks to ensure this decision remains valid:

1. **[Fitness Function Name]**
   - Type: [Performance | Coupling | Security | Maintainability]
   - Metric: [What to measure]
   - Threshold: [Pass/Fail criteria]
   - Tool: [How to measure]
   - Frequency: [When to check]

Example:
- **Package Independence Check**
  - Type: Coupling
  - Metric: Dependencies of shared package
  - Threshold: Zero dependencies on CLI/MCP/Extension
  - Tool: Madge dependency analysis
  - Frequency: Pre-commit hook

## Consequences
### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Drawback 1]
- [Mitigation: how to address]

## Review Date
[When to revisit this decision - e.g., 6 months]

## References
- [Link to spike/experiment that validated this]
- [External documentation]
```

## Example (Enhanced with Fitness Functions)
```bash
$ devsteps add decision "Use FileDecorationProvider for status badges" \\
  --context "Need visual status indicators in TreeView" \\
  --option "TreeItem.description: Simple but not in separate column" \\
  --option "FileDecorationProvider: Native VS Code API, proper badges" \\
  --chosen "FileDecorationProvider with custom URI scheme" \\
  --fitness-function "Badge Rendering Performance" \\
    --type performance \\
    --metric "TreeView render time with 100 items" \\
    --threshold "<200ms" \\
    --tool "VS Code performance profiler" \\
  --consequence "Pro: Native appearance, theme-adaptive" \\
  --consequence "Con: Requires custom URI scheme handling" \\
  --links-to SPIKE-002

✅ Created DECISION-001 (status: accepted)
💡 Fitness function will run on pre-commit
```

## Integration with STORY-091 (Fitness Functions)
- ADRs can **reference** fitness functions defined in STORY-091
- Fitness functions can be **auto-created** from ADRs
- Link: `DECISION-XXX validated-by FITNESS-YYY`

## Example ADR with Fitness Function
```markdown
# ADR-001: Use Refs-Style Index Architecture

## Status
Accepted

## Context
Needed scalable index architecture for 1000+ work items.
Monolithic index.json caused merge conflicts in teams.

## Decision
Implement Git-inspired refs-style index with separate files per type.

## Fitness Functions
1. **Index Read Performance**
   - Metric: Time to load 1000 items
   - Threshold: < 100ms
   - Tool: Benchmark in shared package tests
   - Frequency: CI pipeline on every PR

2. **Memory Footprint**
   - Metric: Peak memory usage during index load
   - Threshold: < 50MB for 1000 items
   - Tool: Node.js --inspect memory profiler
   - Frequency: Weekly performance tests

3. **Merge Conflict Rate**
   - Metric: Git conflicts in .devsteps/refs/
   - Threshold: 0 conflicts in concurrent feature branches
   - Tool: Git merge simulation in CI
   - Frequency: Pre-merge checks

## Consequences
Positive:
- Eliminates monolithic index merge conflicts
- Faster partial index updates (only changed types)

Negative:
- More complex file structure
- Requires migration for existing projects

## Review Date
2026-07-01 (6 months)

## References
- SPIKE-008: Git-Inspired Index Research
- STORY-069: Refs-Style Implementation
```

## Success Metrics
- ADRs created: > 10 in first quarter
- ADRs with fitness functions: 100%
- Fitness function validation failures caught: > 0 (proves they work)
- Decision reversals due to lack of validation: 0

## References
- **Michael Nygard ADR Template:** https://github.com/joelparkerhenderson/architecture-decision-record
- **ThoughtWorks Fitness Functions:** https://www.thoughtworks.com/radar/techniques/architectural-fitness-function
- **Heise Article:** "Evolutionäre Architektur in dynamischen Umfeldern" (2025)
- **Microsoft Azure ADR format**
- **AWS Prescriptive Guidance ADR process**