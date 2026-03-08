# Gate Review — SPIKE-032 Research Brief

**Reviewer:** `devsteps-R5-gate-reviewer`  
**Date:** 2026-03-08  
**Item:** SPIKE-032 — Research: Local GPU + VS Code AI Toolkit Agent Inspector  
**Primary deliverable:** `docs/research/SPIKE-032-local-gpu-ai-toolkit.md`  
**Supporting reports reviewed:** 9 Ring 1/2 reports in `tmp/visualizer/RESEARCH-AITK-GPU-*.md`  
**Verdict: FAIL**  
**Confidence:** 0.97

---

## Phase 1 — Automated Gates

This mandate covers a **research deliverable** (not a code implementation). No TypeScript/Python build artifacts were produced; standard compile/test/lint gates are not applicable to the document under review. The mandate-defined 7 criteria replace the automated gates for this review type.

---

## Phase 2 — Parallel Aspect Dispatch

Both aspect agents interrogated directly from source files:

| Aspect | Finding summary |
|--------|----------------|
| `devsteps-R2-aspect-quality` | Supporting reports are internally consistent; `analyst-quality` Gap 3 was already corrected in the brief (§6.5 explicitly documents the TASK-334 Zod validation correction). No additional quality issues found. |
| `devsteps-R2-aspect-staleness` | All 14 sources are cited within the research window; one source (LocalLLM.in, "Nov 2025–ongoing") predates the window start but is a continuously-updated living reference; flagged as minor, not blocking. |

---

## Phase 3 — Criterion-by-Criterion Results

### Criterion 1 — Minimum Source Count (≥10, Dec 8 2025 – Mar 8 2026)

**PASS**

The brief §2 Research Horizon claims **14 verified sources**, enumerated in §3 Source Map:

| # | Source | Date | In-window? |
|---|--------|------|------------|
| 1 | Microsoft Tech Community — AITK v0.30.0 | Feb 13, 2026 | ✅ |
| 2 | VS Code Blog — "Making agents practical" | Mar 5, 2026 | ✅ |
| 3 | Visual Studio Magazine — AITK Foundry | Mar 4, 2026 | ✅ |
| 4 | dev.to lightningdev123 — Top 5 Local LLM Tools | Jan 29, 2026 | ✅ |
| 5 | GitHub Security Advisory — CVE-2026-21869 | Jan 7, 2026 | ✅ |
| 6 | GitHub Security Advisory — CVE-2026-2069 | Feb 23, 2026 | ✅ |
| 7 | SonarSource — CVE-2026-25253 | Mar 2026 | ✅ |
| 8 | Splunk Research — GGUF supply-chain QURA | Feb 2026 | ✅ |
| 9 | Microsoft Foundry Blog — agentdev 1.0.0-rc1 | Feb 19, 2026 | ✅ |
| 10 | VS Code v1.110 release notes | Mar 2026 | ✅ |
| 11 | XDA Developers — 12GB GPU replaces ChatGPT | Jan 21, 2026 | ✅ |
| 12 | LocalLLM.in — Ollama VRAM Requirements Guide | Nov 2025 (ongoing) | ⚠️ borderline — original publication Nov 2025 (before Dec 8 start); described as "ongoing"; 13 in-window sources remain → still well above threshold of 10 |
| 13 | Reddit r/LocalLLaMA — GPU inference threads | Jan 2026 | ✅ |
| 14 | X/Twitter @DanWahlin — AITK commentary | Feb 2026 | ✅ |

Even conservatively discounting source #12, **13 in-window sources** far exceed the ≥10 threshold. **PASS.**

---

### Criterion 2 — All 8 Coverage Axes Addressed

**PASS**

§2 Research Horizon explicitly claims all 8 axes. Spot-check of brief sections confirms coverage:

| Axis | Where addressed | Verdict |
|------|----------------|---------|
| 1. Technology Radar (adopt/assess/trial/hold/retire) | §4 — full 12-entry radar table with explicit status per candidate | ✅ |
| 2. Security advisory sweep (CVEs, 90 days) | §5.1 — 5-CVE table with CVSS, exposure, mitigation; §5.4 supply chain | ✅ |
| 3. Release archaeology (AITK changelog) | §3 Source Map "Release Archaeology" subsection; VS Code v1.110 + AITK v0.30.0 features catalogued | ✅ |
| 4. Ecosystem health (adoption trends) | §3 "Ecosystem Health + Community Vitality"; §§1+2 of analyst-research (inlined in brief via synthesis) | ✅ |
| 5. Community vitality (discussions, posts) | §3 Source Map; Axis 5 of analyst-research synthesized in brief via ecosystem section | ✅ |
| 6. Performance benchmarks (tok/s, VRAM) | §8.1 (ring routing table with tok/s + VRAM columns); §8.2 (VRAM budget scenarios) | ✅ |
| 7. Standards compliance (MCP, OWASP, licensing) | §5.2 OWASP surface; §3 Source Map (standards compliance); analyst-quality §1.1 MCP compliance | ✅ |
| 8. Competitive intelligence (LM Studio, Continue.dev) | §4 Technology Radar (entries for LM Studio, Continue.dev, vLLM, ONNX); analyst-research Axis 8 | ✅ |

All 8 axes are substantively addressed with specific evidence, not just mentioned. **PASS.**

---

### Criterion 3 — All Recommendations Are Actionable

**PASS**

§7 Prioritized Recommendations contains 15 named recommendations across 4 tiers. Each was inspected:

| Rec | Owner | Effort | Evidence citation | Priority tier |
|-----|-------|--------|-------------------|---------------|
| SEC-1 | Developer | 30 min | CVE-2026-21869; analyst-research Axis 2; analyst-risk §3.1 | TIER 0 |
| SEC-2 | Developer | 10 min | OWASP A07; CVE-2026-25253; analyst-quality §1.3 | TIER 0 |
| SEC-3 | Developer | 2 hours | analyst-quality §1.3; aspect-quality §1.5; aspect-constraints [RISK] P1-2 | TIER 0 |
| PRE-1 | Developer | 1 hour | analyst-risk §1.5; aspect-constraints HC-4+HC-7 | TIER 1 |
| PRE-2 | Developer | 30 min | analyst-research Axis 1; aspect-constraints HC-1 | TIER 1 |
| PRE-3 | Developer | 30 min | analyst-research; analyst-risk §1.1; exec-planner §3 | TIER 1 |
| PRE-4 | Developer | 15 min | aspect-integration UR-1.1; aspect-constraints HC-1 | TIER 1 |
| PRE-5 | Developer | 30 min | analyst-quality §3.2; aspect-quality §1.4; analyst-risk §2.2 | TIER 1 |
| ARCH-1 | Developer | 1 hour | aspect-integration UR-1.2; aspect-constraints SC-1 | TIER 2 |
| ARCH-2 | Developer | 30 min | aspect-quality Gap 5; exec-planner RESOLUTION-2 | TIER 2 |
| ARCH-3 | Developer | 4 hours | aspect-integration Point 3; exec-planner §2 item 13 | TIER 2 |
| ARCH-4 | Developer | 3 hours | aspect-integration UR-2.2; aspect-integration Point 2 | TIER 2 |
| DOC-1 | Developer | 2 hours | analyst-research Axis 5 | TIER 3 |
| DOC-2 | Developer | 1 hour | analyst-risk §1.1; analyst-quality §2.1 | TIER 3 |
| DOC-3 | Developer | 30 min | aspect-staleness §3.1 | TIER 3 |

All 15 have owner, effort, evidence citation, and priority tier. **PASS.**

---

### Criterion 4 — Security Assessment Completeness

**PASS**

| Requirement | Found in brief | Location |
|-------------|---------------|---------|
| CVE-2026-21869 (CVSS 8.8) | ✅ | §3 Source Map (Security row 1); §5.1 CVE table; §4 radar (llama.cpp HOLD entry); SEC-1 recommendation; P1-4 risk register |
| CVE-2026-2069 | ✅ | §3 Source Map (Security row 2); §5.1 CVE table (7.5 HIGH); §4 radar (llama.cpp HOLD) |
| OWASP A07 Ollama binding risk | ✅ | §5.2 "OWASP A07 — Identification and Authentication Failures" (explicit prose section) |
| GGUF supply-chain integrity | ✅ | §5.4 "Supply-Chain Advisory" (Splunk Research Feb 2026, 156,838 models scanned, QURA attacks) |
| CVE-2026-25253 (additional) | ✅ | §5.1; §5.2; SEC-2 |
| CVE-2025-51471 and CVE-2025-15514 (additional) | ✅ | §5.1 (rows 4+5) |

No CVE from within the 90-day window is omitted without justification. **PASS.**

---

### Criterion 5 — Architecture Accuracy

**PASS**

| Requirement | Found in brief | Location |
|-------------|---------------|---------|
| Ring 4 workers ONLY → local GPU; Rings 0/1/2/3/5 → cloud | ✅ | §6.3 architecture diagram (explicit ASCII diagram with each ring labeled); §8.1 Ring-Based Routing Table (all rings with cloud vs. Ollama column) |
| `runSubagent` NOT compatible with agentdev local runtime | ✅ | §6.3 "HC-3 acknowledged limitation: AITK Agent Inspector does NOT capture runSubagent dispatch chains — these are opaque to any OTLP collector… permanent architectural limitation" |
| Agent Inspector captures Python agentdev agents ONLY | ✅ | §10.1 capability table: "VS Code runSubagent trace → ❌ NOT available"; §6.3 HC-3 |
| `write_mandate_result` Zod validation already present (TASK-334) | ✅ | §6.5 "WriteMandateResultSchema Zod Validation — Correction of Record" — explicitly cites TASK-334, shows schema code, states "No action required" |

All 4 architecture accuracy requirements satisfied. **PASS.**

---

### Criterion 6 — Next Actions Defined  ← FAIL

**FAIL**

| Sub-criterion | Result |
|---------------|--------|
| ≥5 concrete DevSteps follow-up items | ✅ PASS — 10 items listed in §12 |
| Item types included (story, task, bug, spike) | ✅ PASS — STORY (1) and TASK (9) types present |
| STORY-207 and TASK-354 through TASK-362 mentioned by ID | ❌ **FAIL** |

**Finding:** The Research Brief §12 Next Actions table lists all 10 items by type and title only. None of the DevSteps item IDs are referenced anywhere in the document. Cross-search of the brief and all 9 supporting reports confirms zero occurrences of:

| Missing ID | Equivalent title in §12 |
|-----------|-------------------------|
| STORY-207 | "Implement Ollama CUDA local inference for Ring 4 workers" |
| TASK-354 | "Security: Harden server.py with body-size limit and optional auth header" |
| TASK-355 | "Create .vscode/settings.json BYOM config for Ollama endpoint" |
| TASK-356 | "Pin agentdev + debugpy versions in requirements.txt" |
| TASK-357 | "Create devsteps-local-model.instructions.md with ring routing rules" |
| TASK-358 | "Write INSTALL-Local-GPU.md for Linux CUDA + Ollama setup" |
| TASK-359 | "Write MODEL-SELECTION.md with ring-based model routing guide" |
| TASK-360 | "Implement Python MCP client in agentdev for MandateResult writes" |
| TASK-361 | "Update AITK-Tools-Guide.md agent naming to R-prefix convention" |
| TASK-362 | "Add cbp-mandate handler integration tests (write→read disk round-trip)" |

The corresponding DevSteps items ARE created in the system (verified: `STORY-207` exists with title "Implement Ollama CUDA local inference for Ring 4 workers"; `TASK-354` through `TASK-362` all verified present). The relationship `SPIKE-032 relates-to TASK-362` exists in devsteps. The items simply are not referenced by ID in the document text.

**Required fix:** Update §12 Next Actions table in `docs/research/SPIKE-032-local-gpu-ai-toolkit.md` to include the DevSteps IDs as a "DevSteps ID" column (or inline in each row). Example for row 1:

```markdown
| STORY-207 | STORY | Implement Ollama CUDA local inference for Ring 4 workers | urgent-important | implements: SPIKE-032 |
| TASK-354 | TASK | Security: Harden server.py with body-size limit and optional auth header | urgent-important | implements: SPIKE-032 |
... (add TASK-355 through TASK-362)
```

**This is the only failing criterion. The fix is a single table update (5–10 minutes).**

---

### Criterion 7 — Internal Fit Analysis

**PASS**

| Requirement | Found in brief | Location |
|-------------|---------------|---------|
| References specific codebase files (not generic) | ✅ | Multiple: `.vscode/tasks.json:317`, `.vscode/launch.json:62-78`, `tmp/visualizer/visualizer/server.py`, `packages/mcp-server/src/handlers/cbp-mandate.ts`, `tmp/visualizer/agent.py`, `tmp/visualizer/visualizer/otel_setup.py`, etc. |
| Acknowledges prior 2026-03-05 spike decision (keep VSIX GPU-free) | ✅ | §6.4 "Prior Validated Decision (Binding ADR)" — explicitly references "gpu-vscode-projects-2026-03-05 (Gate PASS: 2026-03-05)" and states the decision is "confirmed as the correct and binding architecture" |
| Identifies HC-1 (missing `.vscode/settings.json`) as first prerequisite | ✅ | §6.2 Gap table row 1: "No `.vscode/settings.json` with `chat.models` BYOM Ollama config | HC-1 | CRITICAL | YES"; also §7 PRE-4 (TIER 1 prerequisite) |

**PASS.**

---

## Summary Scorecard

| # | Criterion | Result | Note |
|---|-----------|--------|------|
| 1 | Minimum Source Count (≥10, 90-day window) | **PASS** | 14 sources; 13 clearly in-window; 1 borderline but non-blocking |
| 2 | All 8 Coverage Axes Addressed | **PASS** | All 8 substantively covered with evidence |
| 3 | All Recommendations Actionable | **PASS** | 15/15 have owner, effort, evidence, tier |
| 4 | Security Assessment Completeness | **PASS** | CVE-2026-21869, CVE-2026-2069, OWASP A07, GGUF supply-chain all present |
| 5 | Architecture Accuracy | **PASS** | Ring routing, runSubagent limitation, Inspector scope, TASK-334 correction all correct |
| 6 | Next Actions Defined | **FAIL** | STORY-207 and TASK-354–362 exist in devsteps but are NOT referenced by ID in the document |
| 7 | Internal Fit Analysis | **PASS** | Specific files, 2026-03-05 ADR, HC-1 identified |

**Overall: FAIL (6/7 criteria pass; 1 criterion fails)**

---

## Required Fix

**File:** `docs/research/SPIKE-032-local-gpu-ai-toolkit.md`  
**Section:** §12 Next Actions — DevSteps Items  
**Change:** Add a "DevSteps ID" column to the 10-row table, populated with STORY-207 and TASK-354 through TASK-362. No other changes required.

**Estimated effort:** 5–10 minutes.  
**After fix:** Re-submit for gate-reviewer re-check (targeted re-review of §12 only).

---

## Adversarial Gap Challenge

*"What adversarial caller breaks this that we haven't tested?"*

1. **Source #12 temporality**: A future reader could dispute LocalLLM.in (Nov 2025) as out-of-window. Non-blocking (13 other sources remain), but the brief should note "current as of research window end" in the source table.

2. **STORY-207/TASK-354–362 ID absence**: The only failing criterion. Easy fix. Items already created in devsteps.

3. **CVE-2026-2069 date discrepancy**: `analyst-research` dates it Feb 13, 2026; the brief notes Feb 23, 2026. Minor inconsistency between reports; not blocking (both are within the 90-day window).

4. **`sprint_id: null` handling**: The SPIKE-032 mandate was submitted with `sprint_id: null`. The `WriteMandateResultSchema` requires `z.string().min(1)`. This gate-reviewer write uses `sprint_id: "SPIKE-032"` per the ARCH-2 documented convention. This is consistent with the brief's §7 ARCH-2 recommendation.

---

## Iteration Signal

| Field | Value |
|-------|-------|
| Loop type | review-fix |
| Iteration | 1 of 3 |
| Status | continuing |
| Required action | Update §12 table to include DevSteps IDs STORY-207 and TASK-354–TASK-362 |

---

*Gate review produced by `devsteps-R5-gate-reviewer` · 2026-03-08 · SPIKE-032*
