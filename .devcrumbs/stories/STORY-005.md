# Relationship Validation & Methodology Enforcement

## User Value
As a development team, we want the system to enforce Scrum/Waterfall methodology rules so that our work item hierarchy remains consistent and traceable.

## Problem
Currently, DevCrumbs allows creating ANY relationship between ANY item types without validation. This violates methodology principles and leads to inconsistent project structures.

## Solution
Implement relationship validation engine that enforces:

**Scrum Hierarchy:**
- Epic → Story|Spike → Task
- Bug/Test can implement Epic OR relate to Story/Spike

**Waterfall Hierarchy:**
- Requirement → Feature|Spike → Task  
- Bug/Test can implement Requirement OR relate to Feature/Spike

**Flexible Relations:**
- "relates-to" allowed between ANY items (cross-references, dependencies)

## Acceptance Criteria
- [ ] Shared validation engine validates all "implements" relationships
- [ ] CLI `link` command enforces validation with helpful errors
- [ ] MCP tools enforce validation with AI-friendly error messages
- [ ] `--force` flag available for edge cases
- [ ] Comprehensive error messages guide users to correct relationships

## Implementation Components
1. TASK-038: Core validation engine in shared package
2. TASK-039: CLI enforcement in link/add commands  
3. TASK-040: MCP enforcement with contextual AI errors

## Technical Notes
- Validation only for "implements/implemented-by" relationships
- Other relation types ("relates-to", "blocks", "depends-on") remain flexible
- Spike can act as Story-level item (research that has child Tasks)