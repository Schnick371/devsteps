# Story: Knowledge Impact Metrics & Analytics

## User Story
As a technical lead, I want to see metrics on knowledge base usage and impact so that I can measure ROI and identify valuable content.

## Acceptance Criteria
- [ ] Track metrics:
  - Most referenced patterns (by work item links)
  - Most searched keywords
  - Time saved estimates (based on similar problem resolutions)
  - Knowledge reuse rate (cross-project imports)
- [ ] Dashboard analytics section:
  - Top 5 most valuable patterns
  - Trending topics (last 30 days)
  - Knowledge contribution leaderboard (gamification)
  - Search analytics (what people look for)
- [ ] Reports:
  - `devsteps knowledge metrics --month 2025-11`
  - Weekly digest email (optional)

## Metrics Examples
```
📊 Knowledge Base Analytics (Last 30 Days)

Most Referenced:
1. PATTERN-001: FileDecorationProvider (23 references)
2. LESSON-005: Debugging TypeScript Builds (18 references)
3. DECISION-003: Monorepo Architecture (15 references)

Top Contributors:
1. john@example.com (12 knowledge items)
2. jane@example.com (8 knowledge items)

Time Saved: ~47 hours (based on similar issue resolution times)
```

## Technical Notes
- Store analytics in SQLite (local) or PostgreSQL (central repo)
- Privacy-first: Anonymize data for central repo
- Export reports as CSV/JSON