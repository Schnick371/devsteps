Two accuracy issues in the burndown section:

1. **Label mismatch:** dashboardPanel.ts HTML template uses heading "📉 Sprint Burndown" — but no sprint entity exists in DevSteps. The chart shows aggregate task completion over calendar time, not sprint velocity. Rename to "📉 Project Burndown" (user request confirmed by research).

2. **Completion date wrong:** burndownProvider.ts uses item.updated as the completion date. item.updated changes on ANY field edit (title, tags, description), causing the burndown curve to retroactively shift. Fix: guard the data point with item.status === 'done' check and document the item.updated approximation in a comment (awaiting completed_at schema field in a future story).

Source: analyst-quality §2, S3 (ScrumDay India burnup article), analyst-research §3.2.

## Acceptance criteria
- Section heading reads "Project Burndown"
- Burndown curve only advances when status === 'done'
- Comment in provider documents the approximation