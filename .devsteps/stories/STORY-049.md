# Flexible Bug Relationship Types

## Problem
Bug → Epic uses "implements" which is semantically incorrect. A Bug doesn't "implement" an Epic, it affects or relates to it.

## Industry Research (2025)
- **Jira Standard**: "relates to" for general context, "affects" for impact traceability
- **Azure DevOps**: Bugs configurable at Story/Task level, NO fixed hierarchy with "implements"
- **ALM Traceability**: Uses "links back to" for Defects → Requirements, NOT "implements"

## Solution
Enable two semantic relationship types for Bugs:
1. **"relates-to"**: General context/association (Bug relates to Epic scope)
2. **"affects"**: Impact traceability (Bug affects Epic deliverables)

## Acceptance Criteria
- [ ] "affects/affected-by" added to FLEXIBLE_RELATIONSHIPS in shared schema
- [ ] Bug validation allows both "relates-to" and "affects" to Epic/Requirement
- [ ] CLI `devsteps link` supports both types
- [ ] MCP `mcp_devsteps_link` supports both types
- [ ] Documentation updated (agent.md, relationship rules)
- [ ] Tests cover both relationship types

## Benefits
- **Semantic clarity**: "relates-to" = context, "affects" = impact
- **Industry alignment**: Matches Jira/Azure DevOps 2025 best practices
- **Flexibility**: Users choose appropriate semantic based on situation