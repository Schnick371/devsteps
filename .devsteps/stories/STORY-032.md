# Story: Knowledge Aging & Maintenance

## User Story
As a technical lead, I want to track knowledge item freshness and identify outdated content so that the knowledge base remains accurate and relevant.

## Acceptance Criteria
- [ ] Add `reviewed_at` timestamp to knowledge items
- [ ] Status field for knowledge items:
  - Active (current, verified)
  - Needs Review (>6 months old)
  - Deprecated (superseded by newer solution)
  - Obsolete (no longer applicable)
- [ ] Periodic review prompts:
  - `devsteps knowledge review` → Shows items needing review
  - Mark as verified: `devsteps update PATTERN-001 --reviewed`
- [ ] Supersede workflow:
  - `devsteps update PATTERN-001 --superseded-by PATTERN-042`
  - Old pattern marked deprecated, links to new one
- [ ] Dashboard warning: "⚠️ 3 knowledge items need review"

## Example
```bash
$ devsteps knowledge review

⚠️  Knowledge Items Needing Review (3):

PATTERN-001: FileDecorationProvider... [Last reviewed: 8 months ago]
  Options: 
  1. Mark as verified (still valid)
  2. Update content (needs changes)
  3. Supersede (replaced by newer pattern)
  4. Deprecate (no longer recommended)

Choose action for PATTERN-001: [1/2/3/4] _
```

## Technical Notes
- Auto-flag items older than 6 months without review
- Send email reminders (optional setting)
- Metrics: Knowledge decay rate, review velocity