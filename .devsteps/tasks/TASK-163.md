# Update MCP Tool Descriptions for Status Workflow

## Objective
Update MCP tool descriptions and documentation to include review/testing phase in status progression.

## Changes Required

### Tool: devsteps_update
**Current Description:**
```
Update an existing item. Can update status, eisenhower, assignee, etc.
```

**Enhanced Description:**
```
Update an existing item. Can update status, eisenhower, assignee, etc.

Status Progression: draft → planned → in-progress → review → done
- Use 'review' status when testing/validating before marking done
- Mark 'done' only after all quality gates pass
```

### Tool: devsteps_add
**Add to Description:**
```
Status defaults to 'draft'. Standard progression:
draft → planned → in-progress → review → done
```

### packages/mcp-server/README.md
Add section on status workflow:

```markdown
## Status Workflow

### Standard Progression
1. **draft**: Item created, not started
2. **planned**: Ready to implement, dependencies clear
3. **in-progress**: Active development
4. **review**: Testing/validation phase
5. **done**: All quality gates passed

### Quality Gates (Review Phase)
Before marking 'done':
- Tests pass (unit, integration, E2E when applicable)
- Build succeeds with no errors
- Manual testing complete
- Documentation updated
- No regressions detected
```

## Success Criteria
- MCP tools mention review phase
- Status progression documented
- Quality gates clear
- AI agents understand testing requirement
