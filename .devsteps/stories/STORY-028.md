# Story: Advanced Knowledge Search & Discovery

## User Story
As a developer, I want to search across all knowledge items with semantic understanding so that I can find relevant lessons, patterns, and solutions even when I don't know exact keywords.

## Acceptance Criteria
- [ ] Full-text search across lessons/patterns/antipatterns/decisions
- [ ] Search by problem domain, tags, affected paths
- [ ] "Similar to current task" suggestions based on:
  - File paths being modified
  - Error messages in recent commits
  - Tags from active work items
- [ ] Search result ranking by relevance + recency
- [ ] Highlight matching text snippets
- [ ] Filter results by knowledge type

## Example
```bash
$ devsteps search knowledge "TreeView badges not showing"

📚 Found 3 knowledge items:

💡 LESSON-001: Uri.from() for custom URI schemes [Match: 95%]
   Problem: FileDecorations not appearing in TreeView
   Solution: Use Uri.from({ scheme: 'devsteps', ... })
   → View: devsteps get LESSON-001

✅ PATTERN-001: FileDecorationProvider with custom URI [Match: 87%]
   Use case: Add badges to TreeView items
   Code: packages/extension/src/decorationProvider.ts:125-134

⚠️  ANTIPATTERN-001: Uri.parse() for custom schemes [Match: 78%]
   Why fails: Treats custom scheme as file path
   Better: PATTERN-001
```

## Technical Notes
- Implement fuzzy search with Levenshtein distance
- Consider integrating AI-based semantic search (future enhancement)
- Cache search index for performance