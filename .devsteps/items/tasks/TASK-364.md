Both coord files are at 150/150 lines — zero headroom. Work in canonical source first.

**Canonical source:** packages/mcp-server/.github/agents/devsteps-R0-coord.agent.md and devsteps-R0-coord-sprint.agent.md

**Step 1 — Compress Scope-Split Fan-Out section (frees ~7 lines):**
Replace current ~7-line 'Scope-Split Fan-Out' prose section with: '### Scope-Split Fan-Out\nSee [ADP §1 — I-13 and I-14](./AGENT-DISPATCH-PROTOCOL.md) for triggers, write-path constraints, MAX_SPLIT=4 concern-split guard, and synthesis responsibilities.'

**Step 2 — Add Step 0.5 after 'Step 0: MCP Preflight':**
'### Step 0.5: Pre-Scan (FULL tier only — skip at QUICK/STANDARD)\nRun ≤3 targeted search calls on affected_paths. From results, select ≤8 most-relevant file paths. Append Relevant files: {path1, path2, ...} to every Ring 1, Ring 2, and Ring 3 DPF dispatch for this item.'

**Step 3 — Add Relevant files injection note to Ring 3 dispatch step:**
Add note: 'For FULL tier: also append Relevant files: from Step 0.5 to the Ring 3 exec-planner DPF.'

**Line budget:** Compression frees ~7 lines; Step 0.5 block ≤5 lines. Both files must remain ≤150 lines. Both files must contain identical changes (they are maintained in sync).

## Done When
Both canonical files contain Step 0.5; Scope-Split section is reference pointer; both files ≤150 lines.