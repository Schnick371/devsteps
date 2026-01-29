# Extension UI for Commit Visualization

## User Story

**As a** project manager or developer  
**I want** to see commit history in the VS Code extension  
**So that** I can track implementation progress visually

## Acceptance Criteria

1. ✅ TreeView shows commit count badge on work items
2. ✅ Tooltip displays latest commit message and author
3. ✅ Dashboard WebView shows commits timeline
4. ✅ Click commit opens file diff in editor
5. ✅ Files changed list with +/- statistics

## Technical Implementation

**TreeView Enhancement:**
```typescript
// packages/extension/src/treeView/WorkItemNode.ts
class WorkItemNode extends vscode.TreeItem {
  constructor(item: WorkItem) {
    super(item.title);
    
    // Add commit badge
    if (item.commits?.length > 0) {
      this.description = `${this.description} · ${item.commits.length} commits`;
    }
    
    // Tooltip with latest commit
    const latest = item.commits?.[0];
    if (latest) {
      this.tooltip = new vscode.MarkdownString(
        `**Latest Commit**\n\n` +
        `${latest.message}\n\n` +
        `*by ${latest.author} on ${formatDate(latest.timestamp)}*\n\n` +
        `Files: ${latest.files.length} (+${latest.insertions}/-${latest.deletions})`
      );
    }
  }
}
```

**Dashboard Commits Section:**
```typescript
// packages/extension/src/webview/dashboard/CommitsSection.ts
interface CommitTimelineProps {
  commits: CommitMetadata[];
}

function CommitsTimeline({ commits }: CommitTimelineProps) {
  return (
    <div class="commits-timeline">
      <h3>Commit History ({commits.length})</h3>
      {commits.map(commit => (
        <div class="commit-entry" data-sha={commit.sha}>
          <div class="commit-header">
            <code class="commit-sha">{commit.sha.substring(0, 7)}</code>
            <span class="commit-author">{commit.author}</span>
            <time>{formatRelative(commit.timestamp)}</time>
          </div>
          <p class="commit-message">{commit.message}</p>
          <div class="commit-stats">
            <span class="files-changed">{commit.files.length} files</span>
            <span class="insertions">+{commit.insertions}</span>
            <span class="deletions">-{commit.deletions}</span>
          </div>
          <ul class="file-list">
            {commit.files.map(file => (
              <li>
                <a href="#" data-file={file} data-sha={commit.sha}>
                  {file}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

**File Diff Integration:**
```typescript
// Click handler opens diff
panel.webview.onDidReceiveMessage(async msg => {
  if (msg.command === 'showDiff') {
    const { sha, file } = msg;
    
    // Open git diff in editor
    const uri = vscode.Uri.parse(`git:${file}?ref=${sha}^..${sha}`);
    await vscode.commands.executeCommand('vscode.diff', 
      uri.with({ query: `ref=${sha}^` }),
      uri.with({ query: `ref=${sha}` }),
      `${file} (${sha.substring(0, 7)})`
    );
  }
});
```

**Activity Graph:**
```typescript
// Commits per day/week visualization
interface ActivityData {
  date: string;
  count: number;
  authors: Set<string>;
}

function generateActivityGraph(commits: CommitMetadata[]): ActivityData[] {
  const grouped = commits.reduce((acc, commit) => {
    const day = commit.timestamp.split('T')[0];
    if (!acc[day]) {
      acc[day] = { date: day, count: 0, authors: new Set() };
    }
    acc[day].count++;
    acc[day].authors.add(commit.author);
    return acc;
  }, {} as Record<string, ActivityData>);
  
  return Object.values(grouped).sort((a, b) => 
    a.date.localeCompare(b.date)
  );
}
```

## UI/UX Design

**TreeView Badges:**
```
📋 TASK-042: Implement feature · 3 commits
  └─ Latest: feat(TASK-042): Add validation
     by the@devsteps.dev 2 hours ago
     Files: 4 (+45/-12)
```

**Dashboard Timeline:**
```
Commit History (12)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

abc1234  the@devsteps.dev  2 hours ago
feat(TASK-042): Add validation

Implements: TASK-042

3 files  +45  -12
  ├─ src/validation.ts
  ├─ src/index.ts
  └─ tests/validation.test.ts
```

**Activity Heatmap:**
```
Commits Last 30 Days

Mon  ▓▓░░░░░
Tue  ▓▓▓▓░░░
Wed  ▓▓▓▓▓▓▓
Thu  ▓▓▓░░░░
Fri  ▓▓░░░░░
```

## Dependencies

- Work item commits[] populated
- Git diff API integration
- Dashboard WebView component system

## Testing

1. Create work item with 5 commits
2. Verify TreeView badge shows "5 commits"
3. Hover tooltip displays latest commit
4. Open dashboard, verify commits timeline
5. Click file link, verify diff opens
6. Check activity graph rendering

## Performance Considerations

- Lazy load commit details (initial load shows count only)
- Paginate commit history (show 10, load more)
- Cache git diff results
- Debounce file list rendering