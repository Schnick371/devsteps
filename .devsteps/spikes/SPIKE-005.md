# Technical Spike: Dashboard Visualization Strategy

## Context

**Current State (Technical Debt):**
- chart.js + d3 declared in package.json (~417KB in node_modules)
- **NOT imported** - custom Canvas/SVG implementations used instead
- Comment in code: "In production, we'd bundle Chart.js properly with esbuild"

**TASK-005 Decision (Nov 2024):**
- Installed Chart.js 4.5.1 + D3 7.9.0
- Built lightweight custom alternatives
- Rationale: "Smaller bundle size, no CSP conflicts, full control"
- Tagged as "Future Enhancement": Real Chart.js/D3 integration

## Research Questions

### 1. Bundle Size Analysis
**Question:** What's the actual cost of tree-shaked Chart.js/D3 in production?

**Research Needed:**
- Chart.js modular imports: `import { LineController, LineElement } from 'chart.js'`
- D3 scoped imports: `import { forceSimulation } from 'd3-force'`
- esbuild tree-shaking effectiveness (2025)
- Measure: Custom (~20KB) vs Tree-Shaked Libs (~150-250KB?)

**Success Criteria:**
- Bundle size comparison with/without libraries
- Identify minimum subset for current dashboard needs

### 2. Feature Requirements Assessment
**Question:** Are custom implementations sufficient for MVP?

**Current Dashboard Features:**
- Burndown Chart (line chart, 2 datasets, grid, legend)
- Traceability Graph (circular layout, nodes, edges)

**Missing Professional Features:**
- Tooltips on hover (show exact values)
- Zoom/pan interactions
- Animations (smooth transitions)
- Responsive canvas sizing
- Accessibility (keyboard navigation)

**Decision Matrix:**
| Feature | Custom | Chart.js | D3.js |
|---------|--------|----------|-------|
| Basic Line Chart | ✅ | ✅ | ⚠️ Complex |
| Tooltips | ❌ | ✅ | ✅ |
| Animations | ❌ | ✅ | ✅ |
| Force Graph | ⚠️ Static | ❌ | ✅ |
| Bundle Size | ✅ 20KB | ⚠️ 150KB | ⚠️ 100KB |

**Success Criteria:**
- Define "good enough" threshold for MVP
- Prioritize features vs bundle size

### 3. esbuild Configuration Research
**Question:** How to properly bundle Chart.js/D3 for VS Code WebView?

**Technical Challenges:**
- esbuild doesn't process node_modules by default
- WebView CSP restrictions (no CDN, no eval)
- Need separate bundle for WebView scripts

**Approaches to Test:**
```javascript
// Option 1: Inline scripts with esbuild API
import { build } from 'esbuild';
await build({
  entryPoints: ['src/webview/chart-bundle.ts'],
  bundle: true,
  outfile: 'dist/webview-chart.js',
  format: 'iife', // Self-contained for WebView
  minify: true
});

// Option 2: Pre-built UMD bundles
// Copy chart.js/dist/chart.umd.js to media/
// Load via webview.asWebviewUri()

// Option 3: Inline via nonce-script
const chartCode = fs.readFileSync('node_modules/chart.js/dist/chart.umd.js');
html += `<script nonce="${nonce}">${chartCode}</script>`;
```

**Success Criteria:**
- Working proof-of-concept with Chart.js bundled
- CSP compliance verified
- Build time impact measured

### 4. Community Best Practices
**Question:** How do other popular extensions solve this?

**Extensions to Study:**
- GitHub Pull Requests (uses webview with visualizations)
- GitLens (complex graph visualizations)
- REST Client (syntax highlighting, likely Prism.js bundled)

**Research Method:**
- Check their GitHub repos for esbuild/webpack configs
- Look for chart library usage patterns
- Identify common CSP solutions

**Success Criteria:**
- Document 3 real-world patterns from successful extensions
- Identify recommended approach for 2025

## Deliverables

### Research Report
1. **Bundle Size Comparison Table**
   - Current: Custom implementation
   - Option A: Tree-shaked Chart.js only
   - Option B: Tree-shaked D3 only  
   - Option C: Both libraries (modular)

2. **Feature Gap Analysis**
   - What custom implementation lacks
   - Which features justify library overhead
   - User impact assessment

3. **Technical Implementation Guide**
   - Step-by-step esbuild configuration
   - CSP policy adjustments needed
   - Build script modifications

4. **Recommendation**
   - Keep custom OR migrate to libraries
   - If migrate: which libraries, which modules
   - If keep: remove dependencies OR document "future use"

## Acceptance Criteria

- [ ] Bundle size measured for all options (with tree-shaking)
- [ ] Feature comparison documented (custom vs libraries)
- [ ] esbuild proof-of-concept working (if migration recommended)
- [ ] 3 community examples documented
- [ ] Clear recommendation with reasoning
- [ ] Either: Remove deps OR document proper usage plan

## Follow-Up Stories

**If Recommendation = "Keep Custom":**
- STORY: Remove chart.js/d3 from package.json (cleanup)
- STORY: Enhance custom charts (tooltips, animations)

**If Recommendation = "Migrate to Libraries":**
- STORY: Implement proper Chart.js bundling with esbuild
- STORY: Replace custom burndown with Chart.js Line Chart
- STORY: Replace custom graph with D3 force-directed layout

## References

- TASK-005: Original dashboard implementation (custom approach)
- Internet Research: esbuild tree-shaking, Chart.js 4.x modular imports
- VS Code WebView CSP: https://code.visualstudio.com/api/extension-guides/webview#content-security-policy
