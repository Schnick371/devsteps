# Story: DORA Metrics Tracking

## User Story
As a **team lead**, I want **DORA Four Key Metrics** automatically tracked so that I can measure our deployment effectiveness and identify bottlenecks in our development process.

## Background (DORA Research)
**DORA = DevOps Research and Assessment** (Google Cloud)
- Research-backed metrics distinguishing high-performing teams
- Directly supports Evolutionary Architecture feedback loops
- Mentioned in Heise article as empirical validation

**Four Key Metrics:**
1. **Deployment Frequency** - How often we ship
2. **Lead Time for Changes** - Idea → Production duration
3. **Change Failure Rate** - % of deployments causing issues
4. **Time to Restore Service** - Recovery speed from failures

## Acceptance Criteria

### 1. Time-in-Status Tracking
- [ ] Extend item metadata with `status_history`:
  ```json
  "status_history": [
    {"status": "draft", "timestamp": "2026-01-01T10:00:00Z"},
    {"status": "in-progress", "timestamp": "2026-01-02T14:30:00Z"},
    {"status": "review", "timestamp": "2026-01-05T09:15:00Z"},
    {"status": "done", "timestamp": "2026-01-05T16:45:00Z"}
  ]
  ```
- [ ] Auto-update on `devsteps update <ID> --status <status>`
- [ ] Calculate duration per status

### 2. Lead Time for Changes
- [ ] Metric: `created` → `done` duration
- [ ] Break down by type (Epic = months, Task = days)
- [ ] Calculate median lead time (not average - outliers!)
- [ ] CLI: `devsteps metrics lead-time --type task --last 30d`
- [ ] Output: `Median: 2.3 days, P90: 5.1 days`

### 3. Deployment Frequency
- [ ] Count commits per work item (from `commits` array)
- [ ] Calculate deployments per day/week/month
- [ ] CLI: `devsteps metrics deployment-frequency --period month`
- [ ] Trend: Show improvement over time

### 4. Change Failure Rate
- [ ] Metric: Items transitioning to `blocked` status
- [ ] Calculate: `blocked items / total completed items`
- [ ] Track reason for blockage (from item description)
- [ ] CLI: `devsteps metrics failure-rate --last 90d`

### 5. Time to Restore Service
- [ ] Measure duration: `blocked` → `in-progress` (recovery start)
- [ ] Only for Bug items (service restoration)
- [ ] Calculate median recovery time
- [ ] Alert if > threshold (e.g., 4 hours)

### 6. Dashboard Visualization
- [ ] Extension WebView: DORA Metrics section
- [ ] Four metrics displayed with trend arrows (↑↓)
- [ ] Comparison to industry benchmarks:
  - Elite: Deploy multiple times per day, < 1 hour restore
  - High: Deploy daily, < 1 day restore
  - Medium: Weekly-monthly deploys
  - Low: Monthly+ deploys, > 1 week restore

### 7. MCP Integration
- [ ] Tool: `get-dora-metrics --period 30d`
- [ ] AI agents can query metrics for work planning
- [ ] Example: "Should we focus on reducing lead time?"

### 8. Export & Reporting
- [ ] Export metrics to JSON/CSV
- [ ] Generate monthly DORA report (Markdown)
- [ ] Share with stakeholders

## Success Metrics
- All four DORA metrics tracked automatically
- Dashboard shows real-time metrics (updated on item status change)
- Reports generated monthly without manual effort
- Metrics guide sprint planning decisions

## Technical Implementation
```bash
# Example: Query DORA metrics
$ devsteps metrics dora --period 30d

📊 DORA Metrics (Last 30 Days)

1. Deployment Frequency
   ├─ Total Deployments: 42
   ├─ Frequency: 1.4 per day
   └─ Rating: ⭐⭐⭐ High

2. Lead Time for Changes
   ├─ Median: 2.8 days
   ├─ P90: 6.2 days
   └─ Rating: ⭐⭐⭐ High

3. Change Failure Rate
   ├─ Total Completed: 38
   ├─ Blocked: 4
   ├─ Rate: 10.5%
   └─ Rating: ⭐⭐ Medium

4. Time to Restore Service
   ├─ Median: 3.2 hours
   ├─ Max: 18.5 hours
   └─ Rating: ⭐⭐⭐ High

Overall Performance: High 🚀
```

## Storage Schema
```json
// .devsteps/metrics/dora-2026-01.json
{
  "period": "2026-01",
  "deployment_frequency": {
    "total_deployments": 42,
    "per_day": 1.4,
    "trend": "up"
  },
  "lead_time": {
    "median_days": 2.8,
    "p90_days": 6.2,
    "by_type": {
      "task": 1.5,
      "story": 4.2,
      "bug": 0.8
    }
  },
  "change_failure_rate": {
    "total_completed": 38,
    "blocked": 4,
    "rate": 0.105
  },
  "time_to_restore": {
    "median_hours": 3.2,
    "max_hours": 18.5,
    "incidents": 4
  }
}
```

## References
- **DORA:** https://dora.dev/guides/dora-metrics-four-keys/
- **Book:** The Science of Lean Software and DevOps (Forsgren et al., 2018)
- **Heise Article:** Mentions DORA as key empirical data for evolutionary architecture