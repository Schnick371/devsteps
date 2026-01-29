# Code → DevSteps Commit Tracking

## User Story

**As a** developer  
**I want** commits to automatically link to work items  
**So that** I have complete traceability without manual updates

## Acceptance Criteria

1. ✅ Commit with `Implements: TASK-042` automatically links to TASK-042
2. ✅ Work item JSON stores commit metadata (sha, message, author, timestamp, files, ±lines)
3. ✅ Multiple commits accumulate in `commits[]` array
4. ✅ Branch name extracted and stored in `branches[]`
5. ✅ Git post-commit hook triggers automatic update

## Technical Implementation

**Git Hook Integration:**
```bash
# .devsteps/hooks/post-commit
#!/bin/bash
# Extract commit metadata
SHA=$(git rev-parse HEAD)
MSG=$(git log -1 --pretty=%B)
AUTHOR=$(git log -1 --pretty=%ae)
TIMESTAMP=$(git log -1 --format=%cI)
FILES=$(git show --numstat --pretty="" $SHA | awk '{print $3}')
INSERTIONS=$(git show --numstat --pretty="" $SHA | awk '{sum+=$1} END {print sum}')
DELETIONS=$(git show --numstat --pretty="" $SHA | awk '{sum+=$2} END {print sum}')
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Parse work item IDs from footer
IDS=$(echo "$MSG" | grep -oP '(?<=Implements: )[A-Z]+-[0-9]+')

# Update each referenced work item
for ID in $IDS; do
  devsteps git-commit-link "$ID" "$SHA"
done
```

**CLI Command:**
```bash
devsteps git-commit-link TASK-042 abc123
```

**MCP Handler:**
```typescript
// mcp_devsteps_git_commit_link
{
  itemId: "TASK-042",
  commitSha: "abc123"
}
```

**Schema Extension:**
```typescript
interface ItemMetadata {
  // ... existing fields
  commits: CommitMetadata[];
  branches: string[];
  merged_at?: string;
}

interface CommitMetadata {
  sha: string;
  message: string;
  author: string;
  timestamp: string; // ISO 8601
  files: string[];
  insertions: number;
  deletions: number;
  branch: string;
}
```

## Dependencies

- Git CLI available
- Work item ID parsing from commit message
- Atomic file updates (prevent corruption)

## Testing

```bash
# Create work item
devsteps add task "Test commit tracking"
# Returns: TASK-042

# Make commit with reference
git commit -m "feat(TASK-042): Add feature

Implements: TASK-042"

# Verify automatic link
devsteps get TASK-042
# Should show commit in metadata

# Verify multiple commits
git commit --amend -m "feat(TASK-042): Add feature v2

Implements: TASK-042"

# Check accumulation
devsteps get TASK-042
# Should show both commits
```

## UI/UX Considerations

**Extension TreeView:**
- Show commit count badge: "3 commits"
- Tooltip displays latest commit message
- Click expands commit history

**Dashboard WebView:**
- Commits timeline section
- Files changed visualization
- Contributor activity graph