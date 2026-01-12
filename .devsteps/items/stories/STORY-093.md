# Story: Hypothesis-Driven Development Items

## User Story
As a **software architect**, I want **experiment items** to track architectural hypotheses and their validation so that decisions are data-driven instead of opinion-based.

## Background (Scientific Method in Software)
From Heise article:
> "Development teams view each release as a hypothesis. They validate this approach as quickly as possible through effective feedback."

**Problem:** Current DevSteps has `spike` for research, but no structured way to:
- Define measurable hypotheses
- Link hypotheses to experiments
- Track experiment outcomes with data
- Convert validated experiments into architectural decisions

## Acceptance Criteria

### 1. Add 'experiment' Item Type
- [ ] Extend `ItemType` enum: `'experiment'`
- [ ] Schema validation for experiment items
- [ ] Storage: `.devsteps/items/experiments/`
- [ ] Counter: `EXPERIMENT-001, EXPERIMENT-002...`

### 2. Experiment Structure
Required fields:
```typescript
interface Experiment {
  id: string;
  type: 'experiment';
  hypothesis: string;         // What we believe
  validation_criteria: {      // How we'll measure success
    metric: string;
    threshold: string;
    measurement_method: string;
  }[];
  outcome?: {                 // After completion
    result: 'validated' | 'invalidated' | 'inconclusive';
    data: Record<string, any>;
    learnings: string;
  };
}
```

### 3. CLI Commands
- [ ] `devsteps add experiment <title>` 
  - Prompt for hypothesis
  - Define validation criteria (interactive)
- [ ] `devsteps update <ID> --outcome validated --data <json>`
- [ ] `devsteps experiment report <ID>` (generate experiment report)

### 4. Workflow Integration
**From Hypothesis to Decision:**
```
1. Create EXPERIMENT-001: "Redis caching improves API latency"
   ├─ Hypothesis: Redis caching reduces API response time by 50%
   ├─ Criteria: Median latency < 100ms (current: 200ms)
   └─ Method: Load test with 1000 req/s

2. Implement & Measure
   └─ TASK-XXX implements EXPERIMENT-001

3. Record Outcome
   ├─ Result: Validated ✅
   ├─ Data: {median_latency: 85ms, improvement: 57.5%}
   └─ Learnings: "Redis connection pool size = 10 optimal"

4. Create Decision
   └─ DECISION-YYY: "Use Redis for API caching"
       └─ Based on EXPERIMENT-001 (validated)
```

### 5. Link to Fitness Functions
- [ ] Experiments can reference fitness functions as validation criteria
- [ ] Example: "Coupling metric must decrease by 20%"
- [ ] Auto-run fitness functions on experiment completion

### 6. Dashboard Integration
- [ ] Extension WebView: "Active Experiments" section
- [ ] Show: Hypothesis, Progress, Expected vs Actual results
- [ ] Visualize validation criteria (gauges, progress bars)

### 7. MCP Integration
- [ ] Tool: `create-experiment` with hypothesis + criteria
- [ ] Tool: `record-experiment-outcome` with structured data
- [ ] AI agents can propose experiments based on context

## Example Workflows

### Example 1: Performance Hypothesis
```bash
$ devsteps add experiment "WebView lazy loading reduces startup time"

📊 Hypothesis: WebView lazy loading reduces startup time
✅ Validation Criteria:
   1. Metric: Extension activation time
      Threshold: < 500ms (current: 1200ms)
      Method: VS Code performance profiling

✅ Created EXPERIMENT-001
```

### Example 2: Architecture Hypothesis
```bash
$ devsteps add experiment "Extract shared TreeView logic to package"

📊 Hypothesis: Shared TreeView reduces code duplication
✅ Validation Criteria:
   1. Metric: Lines of code in extension/src/treeView
      Threshold: Reduce by 30% (current: 843 lines)
      Method: Line count comparison
   2. Metric: Coupling score
      Threshold: < 5 dependencies
      Method: Madge analysis

✅ Created EXPERIMENT-002
```

### Example 3: Record Outcome
```bash
$ devsteps update EXPERIMENT-001 \
  --outcome validated \
  --data '{"activation_time_ms": 420, "improvement_pct": 65}' \
  --learnings "Deferring dashboard render until first open was key"

✅ EXPERIMENT-001 marked as VALIDATED
💡 Next step: Create decision? (y/n)
```

## Success Metrics
- Experiments created per month > 0
- Validation rate (validated + invalidated / total) > 80%
- Decisions based on experiments > 50%
- Time from hypothesis to validation < 2 weeks

## Integration with Existing Items

**Relationships:**
- `EXPERIMENT implements SPIKE` - Spike identifies hypothesis → Experiment validates
- `TASK implements EXPERIMENT` - Task executes the experiment
- `EXPERIMENT leads-to DECISION` - Validated experiment → ADR
- `EXPERIMENT tested-by TASK` - Automated validation

**Example Chain:**
```
SPIKE-001: "Research caching strategies"
  └─ implements → EXPERIMENT-001: "Redis outperforms in-memory cache"
      └─ implemented-by → TASK-042: "Implement Redis prototype"
      └─ leads-to → DECISION-005: "Use Redis for production caching"
```

## References
- **Heise Article:** "Teams view each release as a hypothesis"
- **Scientific Method:** Hypothesis → Experiment → Conclusion
- **ThoughtWorks:** Fitness Function-Driven Development
- **Lean Startup:** Build-Measure-Learn loop