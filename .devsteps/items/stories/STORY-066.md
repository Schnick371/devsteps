# MCP Server Update - Eisenhower Priority System

## Objective
Update MCP tool descriptions and handlers to use eisenhower instead of priority.

## Tool Updates

**devsteps-add tool:**
- Description: "priority: Q1|Q2|Q3|Q4 (Eisenhower Matrix)"
- Handler: Accept Q1/Q2/Q3/Q4 values
- Map to eisenhower field

**devsteps-list tool:**
- Update priority filter to accept Q1/Q2/Q3/Q4
- Handler uses eisenhower field

**devsteps-update tool:**
- Update priority parameter description
- Handler maps to eisenhower

## Resource Updates

**devsteps://docs/hierarchy:**
- Update examples to use Q1/Q2/Q3/Q4
- Remove critical/high/medium/low references

**devsteps://docs/ai-guide:**
- Update workflow examples
- Explain Eisenhower Matrix briefly

## Handler Files
- packages/mcp-server/src/handlers/add.ts
- packages/mcp-server/src/handlers/list.ts
- packages/mcp-server/src/handlers/update.ts
- packages/mcp-server/src/tools/index.ts