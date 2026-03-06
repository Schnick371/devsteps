# Anti-Repeat Patterns for AI Coding Agents — Research Report

**Date:** 2026-03-01  
**Scope:** How to prevent AI coding agents from retrying failed approaches, with focus on VS Code Copilot agent workflows

---

## 1. Anti-Repeat Patterns Found in Modern AI Agent Frameworks

### 1.1 Wink: Self-Intervention at Scale (Meta, Feb 2026)

The most rigorous production system found is **Wink** ([arxiv.org/html/2602.17037v2](https://arxiv.org/html/2602.17037v2)), deployed at Meta across thousands of developers. Key findings:

- **~30% of all agent trajectories exhibit misbehaviors** in production
- **Three misbehavior categories**: Specification Drift (22.6%), Tool Call Failures (14%), Infinite Loops (5.2%)
- **Infinite loops defined as**: "agent invoking the same or similar tool calls 3+ times in a row, repeated code edits to the same file, or verbose reasoning without advancing toward a solution"

**Wink's Anti-Repeat Architecture:**

1. **Asynchronous Observer**: An LLM classifier runs alongside the main agent, inspecting trajectories at fixed intervals (every k steps)
2. **Misbehavior Detection**: Binary classification of current trajectory against a taxonomy (loop? drift? tool failure?)
3. **Course-Correction Injection**: Guidance is injected via `system-reminder` XML tags invisible to the user — DOs and DON'Ts that nudge the agent to take alternative actions
4. **Results**: 90% recovery rate for single-intervention, 79% for multi-intervention. 5.3% reduction in tokens/session, 4.2% fewer human interventions

**Key insight**: 37% of non-recoveries occurred because the agent **ignored** the course-correction instructions — the model simply disregarded the anti-repeat nudge.

### 1.2 EnCompass: Branching Search Over Execution Paths (Caltech/MIT, Jan 2026)

The **EnCompass** framework ([NeurIPS 2025](https://openreview.net/pdf?id=IKVkpjSJzJ)) addresses the core problem differently:

- Instead of detecting loops after the fact, **mark decision points as "branchpoints"** and evaluation points as "scores"
- Separates **core logic from search strategy** — the agent's reasoning code doesn't change, but the framework can try multiple paths
- Supports **beam search** (explore N best partial paths simultaneously), **global best-of-N** (run N times, pick best), and **local best-of-N** (at each step, try N times, pick best)
- Reduced code for search logic by 80%, improved accuracy from 15% → 40% on code translation tasks

**Application to anti-repeat**: Instead of retrying the same approach, the framework naturally explores multiple approaches simultaneously. Failed branches are pruned, not retried.

### 1.3 LATS: Language Agent Tree Search

From the [Agentic AI Handbook](https://www.nibzard.com/agentic-handbook) (113 patterns catalog):

- **LATS** combines MCTS-like tree search with LLM evaluation/reflection
- Explores **multiple reasoning paths** rather than committing to one
- Each path is scored; low-scoring paths are abandoned
- Trade-off: significantly more compute, but avoids the "single path, retry same thing" trap

### 1.4 Reflection Loop with Real Checks (not "vibes")

The handbook's foundational anti-repeat pattern:

```python
for attempt in range(max_iters):
    draft = generate()
    results = run_checks(draft)  # tests/lints/validators/evals
    if results.pass:
        return draft
    # KEY: fix_from changes approach based on SPECIFIC failure signal
    draft = fix_from(results)
```

**Critical distinction**: The loop works only when anchored to **deterministic signals** (tests, lints, compilation). Self-critique without objective checks leads to the model "rationalizing" the same approach.

### 1.5 Action Trace Monitoring with Kill Switches

From the handbook — explicit hard gates:

- Stop on unexpected tool use
- Stop if diff exceeds N lines
- Stop on touching forbidden files
- **Stop on failing tests twice without narrowing scope** ← directly addresses anti-repeat
- Stop on same tool call with same arguments appearing 3+ times

### 1.6 Ralph Wiggum: Iteration as a Feature (but with guardrails)

The [Ralph Wiggum technique](https://www.leanware.co/insights/ralph-wiggum-ai-coding) explicitly embraces iteration, BUT adds:

- **Max iteration limits** (`--max-iterations`)
- **Completion promises** — agent must output specific token when truly done
- **Circuit breakers** in community implementations (ralph-orchestrator)
- **Git checkpointing** — each iteration commits, so bad approaches can be rolled back
- **Fresh context per iteration** — prevents context drift but forces re-orientation

### 1.7 Microsoft Multi-Agent Patterns (Feb 2026)

[Microsoft Copilot Studio guidance](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/architecture/multi-agent-patterns):

- "Design for **descriptive errors** so that agents can self-correct based on error messages"
- "Design for **parallelism**, limit inter-agent context to what is strictly necessary"
- "Use **short-term memory** to avoid redundant work"
- "Include users in the workflow... Require **human approvals** for high-impact cross-agent actions"
- "Allow **cancel and skip** on long-running steps"

---

## 2. Gaps in Existing Agent Files Regarding Failure Recovery

### 2.1 What the DevSteps agents DO have

The existing agent hierarchy has several anti-failure mechanisms:

| Mechanism | Where | What it does |
|---|---|---|
| **Max RESOLVE rounds** | `devsteps-R4-exec-impl` | "Maximum 2 RESOLVE rounds. If unresolved → ESCALATED" |
| **Bounded Review-Fix loop** | `devsteps-R5-gate-reviewer`, `devsteps-R1-analyst-quality` | `write_iteration_signal` + `write_rejection_feedback`, max 3 iterations |
| **ESCALATED verdict** | All T2 agents | Surfaces to user with `⚠️ DECISION REQUIRED` |
| **Contradiction detection** | `devsteps-R4-exec-impl` Phase 2 | Checks if web-fetched API differs from impl assumption |
| **Adversarial gap challenge** | `devsteps-R1-analyst-research` | "What approach did I dismiss without adequate investigation?" |
| **Absence audit** | `devsteps-R4-exec-impl`, `devsteps-R1-analyst-research` | Checks for missing steps/uncovered approaches |
| **Parallel fan-out** | `devsteps-R1-analyst-research` | Dispatches web + internal analysts simultaneously |
| **Clarification loop cap** | `devsteps-R1-analyst-research` | `MAX_CLARIFICATION_ROUNDS=2` |

### 2.2 Critical GAPS — What's Missing

**GAP 1: No attempt tracking / failure memory across approaches**

None of the agents maintain a record of "approaches tried and why they failed." When `worker-impl` is re-dispatched after a RESOLVE round, it receives the error context but NOT a structured list of:
- What was already tried
- Why it failed specifically
- What approaches are explicitly excluded

This is exactly the condition that causes the "retry same approach" problem.

**GAP 2: No approach differentiation requirement on re-dispatch**

When `devsteps-R4-exec-impl` re-dispatches `worker-impl` for RESOLVE, it says:

> "Re-dispatch `worker-impl` with corrected API surface" / "with error context"

But there is no requirement that the new approach must be **demonstrably different** from the failed one. The agent could receive the same error context and try the exact same fix.

**GAP 3: No parallel alternative exploration on failure**

The research agent (`analyst-research`) dispatches web+internal in parallel, but the implementation agent (`exec-impl`) always dispatches a **single** `worker-impl`. When approach A fails, it re-dispatches the same single agent instead of:
- Dispatching 2-3 `worker-impl` instances with **different approach constraints**
- Comparing results and selecting the best

**GAP 4: No "approach A failed" injection into system context**

Wink's key mechanism — injecting course-correction guidance as system-reminders — has no equivalent. When a RESOLVE round fires, the re-dispatched agent gets error context but no explicit "DO NOT repeat approach X" instruction.

**GAP 5: No loop detection for aspect agents within a single dispatch**

While T2 agents have bounded loops, aspect agents (especially `worker-impl`) have no internal mechanism to detect when they're making the same edit repeatedly. They rely entirely on the T2 layer to detect failure — but T2 checks only happen between dispatches, not within a T3 execution.

**GAP 6: No disabled-tool handling protocol**

None of the agents specify what to do when a required tool (like `runSubagent` or any MCP tool) is disabled/unavailable. The current behavior defaults to the model's training bias, which is to work around the limitation silently.

---

## 3. Concrete Agent File Modifications to Implement Anti-Repeat Behavior

### 3.1 Add Attempt Tracking to T2-Impl RESOLVE Phase

**File:** `devsteps-R4-exec-impl.agent.md`  
**Where:** Phase 3: RESOLVE section

Add after the RESOLVE table:

```markdown
### RESOLVE Attempt Registry

Before each re-dispatch, maintain a structured attempt log:

```json
{
  "resolve_round": 1,
  "approach_tried": "Used Array.map() with inline type assertion",
  "failure_reason": "TS2345: Argument of type 'unknown' is not assignable",
  "files_modified": ["src/handler.ts#L45-L60"],
  "excluded_approaches": ["inline type assertion on Array.map()"]
}
```

Pass `excluded_approaches` to `worker-impl` on re-dispatch. T3-impl MUST:
1. Acknowledge excluded approaches in its reasoning
2. Propose a demonstrably different approach before any edit
3. If no alternative exists → return verdict=ESCALATED immediately
```

### 3.2 Add Anti-Repeat Behavioral Rules to T3-Impl

**File:** `devsteps-R4-worker-impl.agent.md`  
**Where:** Critical Rules section

Add:

```markdown
## Anti-Repeat Protocol

When re-dispatched after a failed RESOLVE round:

1. **Read excluded_approaches** from dispatch context
2. **Before any edit**, state in reasoning: "Previous approach X failed because Y. My alternative approach is Z, which differs because [specific difference]."
3. **If the approach you're about to try matches an excluded approach** → STOP and return verdict=ESCALATED with message "No alternative approach available"
4. **Self-check every 5 tool calls**: "Am I editing the same file with the same change pattern as a previous attempt?" If yes → STOP, document the loop, return ESCALATED

### Loop Detection Signals (self-monitor)
- Same `replace_string_in_file` target appearing 2+ times
- Same terminal command executed 2+ times with same arguments
- Same error message received 2+ times from build/test
- Diff between current file state and 5-steps-ago is < 10 lines changed
```

### 3.3 Add Parallel Alternative Dispatch to T2-Impl RESOLVE

**File:** `devsteps-R4-exec-impl.agent.md`  
**Where:** Phase 3: RESOLVE section, as a new strategy

```markdown
### Competitive RESOLVE (for round 2+)

If RESOLVE round 1 failed AND the failure is not a simple typo/API mismatch:

1. Dispatch **2 parallel `worker-impl` instances** with DIFFERENT approach constraints:
   - Instance A: "Solve using [alternative pattern from planner alternatives]"
   - Instance B: "Solve using a fundamentally different approach — do NOT use [failed approach]"
2. Read both envelopes via `read_analysis_envelope`
3. Select the instance with:
   - Fewer compile errors
   - More test passes
   - Higher confidence score
4. If both fail → ESCALATED
```

### 3.4 Add Disabled-Tool Protocol (ALL agents)

Add to every agent's Behavioral Rules:

```markdown
## Disabled/Unavailable Tool Protocol

If a tool listed in your `tools:` header is unavailable, disabled, or returns "tool not found":

1. **STOP** — do NOT attempt to work around the missing tool
2. **Report to user/dispatcher**: "⚠️ TOOL UNAVAILABLE: [tool_name] is required for this mandate but is currently disabled/unavailable. Cannot proceed without it."
3. **Set verdict = BLOCKED** with `blocked_reason: "required_tool_unavailable: [tool_name]"`
4. **NEVER**:
   - Silently skip the tool and try manual alternatives
   - Say "I'll do it myself instead"
   - Pretend the tool doesn't exist in your instructions
   - Use terminal commands as a workaround for disabled edit/search tools
```

### 3.5 Add System-Reminder Injection (Wink-style) to T2-Impl

**File:** `devsteps-R4-exec-impl.agent.md`  
**Where:** New section after Phase 2

```markdown
### Course-Correction Injection

When re-dispatching after failure, prepend to the aspect dispatch prompt:

<system-reminder>
ANTI-REPEAT GUARD: The following approach was already tried and FAILED:
- Approach: [description]
- Error: [specific error]
- Files affected: [list]

You MUST use a DIFFERENT approach. Suggested alternatives:
1. [alternative from planner recommendations]
2. [alternative from research MandateResult, if available]

DO NOT: retry the same code pattern, same API call sequence, or same file edit strategy.
DO: consider a fundamentally different solution path.
</system-reminder>
```

---

## 4. Parallel Alternative Testing — Structuring Competing Subagent Dispatches

### 4.1 How runSubagent Works for Parallel Alternatives

Based on research from [Reddit](https://www.reddit.com/r/GithubCopilot/comments/1pah594/) and community discussions:

```
// Dispatch 3 parallel approaches
runSubagent(
  agentName: "devsteps-R4-worker-impl",
  description: "Approach A: event-driven solution",
  prompt: "Implement feature X using event-driven pattern. 
           CONSTRAINT: Do NOT use polling or direct mutation.
           Write to: .devsteps/cbp/approach-a/"
)

runSubagent(
  agentName: "devsteps-R4-worker-impl", 
  description: "Approach B: reactive streams",
  prompt: "Implement feature X using reactive streams.
           CONSTRAINT: Do NOT use events or direct mutation.
           Write to: .devsteps/cbp/approach-b/"
)

runSubagent(
  agentName: "devsteps-R4-worker-impl",
  description: "Approach C: simple mutation with validation",
  prompt: "Implement feature X using direct state mutation with validation.
           CONSTRAINT: Do NOT use events or streams.
           Write to: .devsteps/cbp/approach-c/"
)
```

### 4.2 Comparing Results from Parallel Subagents

After all subagents complete, the T2 conductor reads each envelope and scores:

```markdown
### Parallel Approach Evaluation Matrix

| Criterion | Weight | Approach A | Approach B | Approach C |
|---|---|---|---|---|
| Compiles clean | 30% | ✅/❌ | ✅/❌ | ✅/❌ |
| Tests pass | 30% | count | count | count |
| Lines changed | 10% | N | N | N |
| Codebase fit | 15% | score | score | score |
| Confidence | 15% | 0.0-1.0 | 0.0-1.0 | 0.0-1.0 |

Selection: highest weighted score wins. Tie → fewer lines changed.
```

### 4.3 When to Use Parallel vs. Sequential

| Situation | Strategy |
|---|---|
| First attempt, approach clear | Single aspect dispatch |
| First RESOLVE round, error specific | Sequential re-dispatch with error context |
| Second RESOLVE round, approach unclear | **Parallel competitive dispatch** (2-3 alternatives) |
| Multiple compile errors, unclear root cause | Parallel: one tries fix-forward, one tries revert-and-redo |
| Research returned 3+ viable approaches | Parallel from the start |

---

## 5. Disabled-Tool Handling — Making Agents STOP and ASK

### 5.1 The Problem

From [Reddit](https://www.reddit.com/r/GithubCopilot/comments/1pah594/) and [GitHub issues](https://github.com/microsoft/vscode/issues/279014):

- Claude models claim `runSubagent` is "disabled" or "doesn't exist" when it's actually available
- When a tool genuinely IS disabled, agents silently work around it instead of reporting the constraint
- Models hallucinate tool unavailability, then proceed to do the work manually (often worse)

### 5.2 Root Causes

1. **Parameter naming confusion**: Using `agent` instead of `agentName` causes "tool not found" errors that the model interprets as "tool disabled"
2. **Model training bias**: Models are trained to be helpful, so when a tool seems unavailable, they default to "I'll do it myself" rather than stopping
3. **No explicit protocol**: Agent files don't specify what to do when tools are unavailable

### 5.3 Concrete Fix: copilot-instructions.md Addition

```markdown
## Tool Availability Protocol

### runSubagent Correct Usage
The `runSubagent` tool is ENABLED and AVAILABLE. Use parameter name `agentName` (not `agent`).

### When Any Tool Appears Disabled
1. Try the tool call ONCE with correct parameters before concluding it's disabled
2. If genuinely disabled:
   - DO NOT silently work around it
   - DO NOT say "I'll handle it myself"
   - DO report: "⚠️ Tool [name] is unavailable. This mandate requires it. Returning BLOCKED."
   - Set verdict = BLOCKED

### Specifically for runSubagent
- If runSubagent fails: check parameter names (must be `agentName`, `description`, `prompt`)
- If still fails after correct parameters: report to user, do NOT inline the subagent work
- Available agents are listed in your `agents:` header — never claim they don't exist
```

### 5.4 Agent-Level Enforcement

Add to each agent that uses subagents (T1, T2):

```markdown
## Subagent Dispatch Rules
- ALWAYS use `runSubagent` with `agentName` parameter
- If `runSubagent` returns an error, check parameter names FIRST
- If tool is genuinely unavailable: STOP and inform user
- NEVER inline subagent work — the isolation boundary exists for context management
- If tempted to say "I'll do it myself instead of dispatching": STOP — that violates the tier boundary
```

---

## 6. Summary: Priority Implementation Order

| Priority | Change | Impact | Effort |
|---|---|---|---|
| **P0** | Add disabled-tool protocol to copilot-instructions.md | Prevents silent workarounds | Low |
| **P0** | Add anti-repeat self-check rules to T3-impl | Prevents same-edit loops | Low |
| **P1** | Add attempt tracking (excluded_approaches) to exec-impl RESOLVE | Prevents re-trying failed approaches | Medium |
| **P1** | Add course-correction injection template | Gives T3 explicit "do not repeat" context | Low |
| **P2** | Add competitive parallel dispatch on RESOLVE round 2+ | Explores alternatives instead of retrying | Medium |
| **P2** | Add loop detection signals to all aspect agents | Self-monitoring for repetitive tool calls | Medium |
| **P3** | Implement full Wink-style async observer | Production-grade misbehavior detection | High |

---

## Sources

1. **Wink** — Nanda et al., Meta (Feb 2026). "Recovering from Misbehaviors in Coding Agents." [arxiv.org/html/2602.17037v2](https://arxiv.org/html/2602.17037v2)
2. **EnCompass** — Li et al., Caltech/MIT (NeurIPS 2025). "Search Over Program Execution Paths." [openreview.net/pdf?id=IKVkpjSJzJ](https://openreview.net/pdf?id=IKVkpjSJzJ)
3. **Agentic AI Handbook** — Balić (Jan 2026). 113 production-ready patterns. [nibzard.com/agentic-handbook](https://www.nibzard.com/agentic-handbook)
4. **Ralph Wiggum** — Huntley (2025-2026). Iteration-based coding agent pattern. [leanware.co](https://www.leanware.co/insights/ralph-wiggum-ai-coding)
5. **Microsoft Multi-Agent Patterns** (Feb 2026). [learn.microsoft.com](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/architecture/multi-agent-patterns)
6. **GitHub Community Discussion #182145** — Strategies to prevent trial-and-error loops. [github.com](https://github.com/orgs/community/discussions/182145)
7. **Reddit r/GithubCopilot** — runSubagent disabled/doesn't exist fix. [reddit.com](https://www.reddit.com/r/GithubCopilot/comments/1pah594/)
8. **Anthropic 2026 Agentic Coding Trends Report** (Jan 2026). [resources.anthropic.com](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf)
9. **Google Vertex AI ADK** — Recovery from failure, state restoration. [cloud.google.com](https://cloud.google.com/blog/products/ai-machine-learning/new-enhanced-tool-governance-in-vertex-ai-agent-builder)
