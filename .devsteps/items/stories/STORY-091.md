# Story: Fitness Functions Framework

## User Story
As a **software architect**, I want **automated architectural quality validation** so that I can ensure code changes don't violate architectural principles without manual code review.

## Background (Evolutionary Architecture)
**Fitness Functions** = Automated tests for architectural characteristics
- Borrowed from evolutionary computing (ThoughtWorks, Building Evolutionary Architectures)
- Replace manual governance with objective, automated checks
- Enable autonomous team decisions with guardrails

**Example from DevSteps:**
```typescript
// Fitness Function: Package Coupling Constraint
test('shared package has zero dependencies on CLI/MCP/Extension', () => {
  const dependencies = analyzeCoupling('packages/shared');
  expect(dependencies.external).not.toContain('cli', 'mcp-server', 'extension');
});
```

## Acceptance Criteria

### 1. Coupling Analysis (Madge Integration)
- [ ] Install Madge for TypeScript dependency analysis
- [ ] Define fitness function: `shared` package must not depend on other packages
- [ ] Define fitness function: Circular dependencies = fail
- [ ] CLI command: `devsteps fitness coupling --package <name>`
- [ ] Pre-commit hook: Block commits with coupling violations

### 2. Cyclomatic Complexity Tracking
- [ ] Extract complexity metrics from Biome output
- [ ] Define threshold: Functions > 15 complexity = warning
- [ ] Store complexity trends in `.devsteps/metrics/complexity.json`
- [ ] CLI command: `devsteps fitness complexity --trend`
- [ ] Dashboard: Complexity heatmap per package

### 3. Performance Budget Automation
- [ ] Measure build time per package (via `npm run build`)
- [ ] Measure bundle size (extension VSIX, CLI/MCP dist/)
- [ ] Define budgets: Extension < 500KB, MCP < 200KB, CLI < 150KB
- [ ] Pre-publish check: Fail if budget exceeded
- [ ] Trend tracking: Detect bundle bloat

### 4. Dependency Freshness Check
- [ ] Scan `package.json` for outdated dependencies
- [ ] Flag dependencies > 6 months old (security risk)
- [ ] CLI command: `devsteps fitness dependencies --max-age 6m`
- [ ] Weekly automated report via GitHub Actions

### 5. Custom Fitness Functions
- [ ] Schema for user-defined fitness functions
- [ ] Example: Test coverage > 80% for shared package
- [ ] Example: No `any` types in shared/src/types
- [ ] Store in `.devsteps/fitness-functions.json`
- [ ] Execute via `devsteps fitness run --all`

### 6. MCP Integration
- [ ] MCP tool: `validate-fitness-functions` (for AI agents)
- [ ] Input: Work item ID → Check fitness for affected paths
- [ ] Output: Pass/Fail + violation details

### 7. CI/CD Integration
- [ ] GitHub Actions workflow: Run fitness functions on PR
- [ ] Comment PR with fitness function results
- [ ] Block merge if critical fitness functions fail

## Success Metrics
- Fitness function coverage: 100% of packages
- Violation detection rate: > 0 (proves it's working)
- False positive rate: < 5%
- CI execution time: < 2 minutes

## Technical Implementation
```bash
# Example fitness function execution
$ devsteps fitness run --all

🔍 Running Fitness Functions...

✅ Coupling Analysis
  └─ shared → No external package dependencies
  └─ No circular dependencies detected

⚠️  Cyclomatic Complexity
  └─ extension/src/treeView/devstepsTreeDataProvider.ts:142
      Function getChildren() = 18 (threshold: 15)

✅ Performance Budgets
  └─ Extension VSIX: 423KB (budget: 500KB) ✓
  └─ MCP Server: 187KB (budget: 200KB) ✓

❌ Dependency Freshness
  └─ @types/node: 18 months old (max: 6 months)

Summary: 3 passed, 1 warning, 1 failed
```

## References
- **ThoughtWorks:** Architectural Fitness Functions (https://www.thoughtworks.com/radar/techniques/architectural-fitness-function)
- **Tools:** Madge (coupling), c8 (coverage), depcheck (dependencies)
- **Book:** Building Evolutionary Architectures, 2nd Edition