**User Need:** Users need immediate visual feedback when filters are active in TreeView to avoid confusion about missing items.

**Problem:** Currently filters can be 'invisibly' active - users don't realize items are filtered out until they manually check. This causes confusion and lost time.

**Solution:** Add visual filter status indicator with:
1. Toolbar button (icon toggle: filled when active)
2. Filter count badge in button tooltip
3. Improved TreeView description badge with 'filtered' text
4. One-click 'Clear All Filters'

**Success Criteria:**
- Instant recognition when filters are active
- One-click to clear all filters
- Filter count visible (e.g., '3 filters active')
- Description badge shows 'X/Y filtered' instead of just '(X/Y)'

**UX Pattern:** Based on industry research (Gmail, Jira, GitHub, PatternFly) - icon toggle with badge is most effective for toolbar constraints.

**Phase 2 (later):** Filter chips in Dashboard for granular control.