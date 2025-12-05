# Documentation Update - Eisenhower Matrix Throughout

## Objective
Update all documentation to use Eisenhower Matrix terminology.

## Files to Update

**Core Documentation:**
- .devsteps/HIERARCHY.md - Update priority examples
- .devsteps/HIERARCHY-COMPACT.md - Update examples
- .devsteps/AI-GUIDE.md - Update workflow examples
- .devsteps/AI-GUIDE-COMPACT.md - Update tool descriptions
- README.md - Update feature descriptions

**Agent & Prompts:**
- .github/agents/devsteps.agent.md - Update priority guidance
- .github/prompts/devsteps-plan-work.prompt.md - Update examples
- .github/prompts/devsteps-start-work.prompt.md - Update priority order
- .github/instructions/*.md - Update all references

**Package Documentation:**
- packages/cli/README.md - Update command examples
- packages/mcp-server/README.md - Update tool descriptions
- packages/extension/README.md - Update feature list
- packages/shared/README.md - Update schema docs

## Terminology Changes
- "Priority: critical/high/medium/low" → "Priority: Q1/Q2/Q3/Q4"
- Explain Eisenhower Matrix in main README
- Update all code examples
- Update screenshots (if any)

## Validation
- No references to critical/high/medium/low remain
- Consistent Q1/Q2/Q3/Q4 usage
- Color mapping explained (🔴🟠🟡🟢)