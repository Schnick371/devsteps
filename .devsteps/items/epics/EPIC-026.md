# Bidirectional Git-DevSteps Synchronization

## Vision

Automatic bidirectional synchronization between code changes and work items, following industry patterns from Azure DevOps and Jira/GitHub integrations.

## Business Value

**Eliminates manual tracking:**
- No manual commit → work item linking
- Automatic status updates from git events
- Complete audit trail from requirement → deployment

**Industry Standard Parity:**
- Azure DevOps "Development" section equivalent
- Jira "Commit Entities" equivalent
- OpsHub-style bidirectional automation

## Scope

### Code → DevSteps (Upstream)
- Detect commits referencing work item IDs
- Extract commit metadata (author, timestamp, files, ±lines)
- Store commit history in work item metadata
- Track branches associated with work items
- Record merge timestamps for traceability

### DevSteps → Code (Downstream)
- Git hooks validate work item references
- Automatic branch creation from work item
- Commit message templates with work item context
- Status validation before commit (prevent commits on draft items)

### Integration Points
- Git post-commit hook → update work item
- Git post-merge hook → mark work item done
- Git pre-commit hook → validate work item status
- CLI `commit` command with automatic work item update
- MCP server event handler for git operations

## Success Criteria

1. Commit creates automatic work item link
2. Work item shows complete commit history
3. Branch lifecycle tracked automatically
4. Pre-commit validation prevents invalid commits
5. Zero manual metadata synchronization

## Technical Architecture

**Storage:**
- `.devsteps/items/{type}/{ID}.json` extended with `commits[]`, `branches[]`, `merged_at`
- `.devsteps/hooks/` Git hooks installation

**Detection:**
- Parse commit messages for `Implements: ID`, `Fixes: ID`, `Related: ID`
- Extract metadata via `git log --numstat --pretty=format:...`

**Automation:**
- Git hooks (post-commit, post-merge, pre-commit)
- CLI integration (devsteps commit)
- MCP server handlers for git events

## Dependencies

- Git CLI available in environment
- Work item ID format enforced (TYPE-NNN)
- Commit message format standards

## Related Work

- EPIC-016: Workflow Branch Strategy (branch separation patterns)
- TASK-042: Mandatory Commit Workflow (commit format enforcement)
- Git hygiene instructions (branch management)

## References

**Industry Examples:**
- Azure DevOps: Development section (branches, commits, PRs, builds)
- Jira/GitHub: OpsHub commit entities with metadata
- Atlassian: End-to-end traceability from requirement to deployment

**DevSteps Patterns:**
- Commit format: `type(ID): subject` + `Implements: ID` footer
- Branch naming: `{type}/{ID}-{description}`
- Status progression: draft → in-progress → review → done