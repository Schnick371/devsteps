# Research Report: Automatic Staleness Detection & Web-First Research for AI Coding Agents

**Date:** 2026-03-01  
**Researcher:** GitHub Copilot (Claude Opus 4.6)  
**Sources:** Web research (Bright Data MCP, VS Code web search), workspace agent analysis, official VS Code docs

---

## 1. Current Copilot Capabilities for Automatic Web Search (as of March 2026)

### What Exists Today

**Copilot does NOT have built-in automatic web search.** As of March 2026, GitHub Copilot in VS Code relies on:

1. **Training data cutoff (~2024)** — the model's parametric knowledge is static
2. **MCP server ecosystem** — external tools that CAN provide web access, but must be **manually configured and explicitly invoked**
3. **No native "staleness detection"** — Copilot has no built-in mechanism to detect when its knowledge is outdated

### Available Web Search Mechanisms

| Mechanism | Type | Auto-Trigger? | Quality |
|---|---|---|---|
| **Bright Data MCP** (`mcp_bright_data_search_engine`, `scrape_as_markdown`) | MCP tool | No — requires explicit call or instruction | High — real search engine results + page scraping |
| **VS Code Web Search for Copilot** (Tavily extension) | VS Code extension | No — manual | Medium — limited to search snippets |
| **Brave Search MCP** | MCP server | No — manual | Medium |
| **Google Developer Knowledge API + MCP** | MCP server (NEW Feb 2026) | No — manual | High for Google docs only |
| **`fetch_webpage`** tool | Built-in deferred tool | No — must be called | High for known URLs |

### Key Industry Signal (Feb 2026)

**Google shipped the Developer Knowledge API** — a machine-readable canonical gateway to official developer documentation, re-indexed within 24 hours. This confirms the industry consensus: **real-time documentation access is becoming a baseline expectation, not a differentiator.**

> "Once you've experienced an assistant that can cite and retrieve the current docs, going back to 'confident guessing' feels irresponsible." — ADTmag, Feb 25, 2026

**ETH Zurich Study (Feb 2026):** Found that overly detailed `AGENTS.md` files degrade performance — instructions should be **principle-based, not recipe-based**, aligning with the workspace's existing "Trust the Model" philosophy.

---

## 2. Staleness Detection Triggers — What Signals Should Auto-Trigger Web Lookup?

### High-Confidence Staleness Signals

These patterns in user prompts or task descriptions should ALWAYS trigger web research before the agent acts:

| Signal Category | Detection Pattern | Risk Level |
|---|---|---|
| **Library/package version mention** | `npm install X`, `pip install X`, `import X`, `require('X')` | HIGH — API surface changes between versions |
| **Framework pattern questions** | "how to do X in React/Next.js/FastAPI/etc." | HIGH — patterns change every 6 months |
| **API integration** | "call the X API", "use X SDK", endpoint URLs | CRITICAL — APIs deprecate without warning |
| **Configuration syntax** | `tsconfig.json`, `vite.config`, `next.config` | HIGH — config schemas evolve |
| **Error message lookup** | Specific error strings, stack traces | MEDIUM — error messages change with versions |
| **"Best practice" questions** | "what's the best way to...", "recommended approach" | HIGH — best practices evolve |
| **Security/auth patterns** | OAuth, JWT, CORS, CSP configuration | CRITICAL — security guidance evolves rapidly |
| **Cloud service configuration** | AWS/Azure/GCP service setup | HIGH — cloud APIs change quarterly |
| **CLI commands** | `npx`, `dotnet`, `az`, `gcloud` commands | MEDIUM — CLI syntax evolves |
| **Dependency compatibility** | "does X work with Y?" | HIGH — compatibility matrices are version-dependent |

### Low-Confidence Signals (web search optional)

- Pure algorithmic questions (sorting, data structures)
- Language syntax that hasn't changed (basic Python, core JS)
- Math/logic problems
- Code formatting/style questions

### Temporal Staleness Heuristic

If the training cutoff is ~2024 and the current date is 2026-03-01, **any technology question where the answer could have changed in the last 24 months should trigger web research.** This is essentially ALL library/framework/API questions.

---

## 3. Existing Mechanism Analysis — Workspace Agents

### Architecture Overview

The workspace implements a **4-tier agent hierarchy** with staleness checking built into the DevSteps workflow:

```
coord
  ├── T2 Research (devsteps-R1-analyst-research)
  │     ├── T3 Web Analyst (devsteps-R1-analyst-web) ← uses bright-data
  │     └── T3 Internal Analyst (devsteps-R1-analyst-internal)
  ├── T2 Quality (devsteps-R1-analyst-quality)
  │     ├── T3 Aspect Quality
  │     └── T3 Aspect Staleness (devsteps-R2-aspect-staleness) ← git-based staleness
  ├── T2 Planner → T2 Impl → T2 Test → T2 Reviewer
  └── ...
```

### Agent: `devsteps-R2-aspect-staleness`

- **Trigger**: Dispatched by T2 Quality, T2 Planner, or T2 Reviewer
- **Trigger mode**: **MANUAL ONLY** — only runs when a T2 agent explicitly dispatches it
- **Scope**: Checks if a **work item description** is still accurate vs. current codebase state
- **Method**: Git log comparison, file existence checks, assumption validation
- **Limitation**: **Does NOT check external staleness** (library versions, API changes, deprecated patterns). Only checks internal codebase drift since work item creation.

### Agent: `devsteps-R1-analyst-web`

- **Trigger**: Dispatched by T2 Research only
- **Trigger mode**: **MANUAL ONLY** — only runs during Research mandates
- **Scope**: Searches internet for modern patterns, deprecations, best practices
- **Tools**: `bright-data/*` — uses `bright-data_research` and `bright-data_search`
- **Strength**: Has the Internet Advantage Claim pattern — explicitly answers "did the internet find something the codebase doesn't know?"
- **Limitation**: Only runs during COMPETITIVE triage or explicit research mandates. **Not part of the standard implementation flow.**

### Agent: `devsteps-R1-analyst-quality`

- **Trigger**: Dispatched by coord for FULL triage only
- **Dispatches**: `aspect-quality` + `aspect-staleness` (parallel)
- **Limitation**: Staleness check is STANDARD+ only (skipped for QUICK triage)

### Gap Analysis

| Concern | Current State | Gap |
|---|---|---|
| **Internal staleness** (code drift) | Covered by `aspect-staleness` | Only on STANDARD+ triage, never automatic |
| **External staleness** (library/API drift) | Covered by `analyst-web` | Only during COMPETITIVE research mandates |
| **Pre-implementation web check** | NOT COVERED | No agent checks "is this pattern still current?" before implementing |
| **Instruction-level enforcement** | Partial — `Copilot-Files-Standards-Specification.instructions.md` says "MANDATORY for planning/architecture decisions" | Not enforced for implementation; no trigger mechanism |
| **Default behavior** | Copilot uses training data | No instruction forces web-first for library/framework tasks |

### Critical Finding

**The web research capability exists but is trapped inside the DevSteps workflow.** It only fires during formal mandate-based research phases. For ad-hoc coding tasks, quick fixes, or direct user conversations, **no web search happens at all.** The bright-data MCP tools are available but never invoked unless the user explicitly asks or a formal DevSteps workflow is initiated.

---

## 4. Specific Instruction/Agent Modifications to Make Web-First Research Automatic

### Strategy: Instruction-Level Enforcement

VS Code custom instructions (`.github/instructions/*.instructions.md`) are loaded based on `applyTo` glob patterns. They inject rules into EVERY conversation matching those patterns. This is the enforcement point.

### Modification 1: Create a Web-First Research Instruction

**File**: `.github/instructions/devsteps-web-first-research.instructions.md`  
**ApplyTo**: `**/*.{ts,tsx,js,jsx,py,java,cpp,cs,go,rs,json,yaml,yml}`  
**Purpose**: Force web verification before any library/framework/API suggestion

### Modification 2: Extend coord Triage

Add a new triage signal: if the task involves external libraries/APIs, **always include T2 Research** in the mandate fan-out, not just for COMPETITIVE items.

### Modification 3: Add Pre-Implementation Web Gate to T2 Impl

Before T2 Impl writes any code that imports external packages, it should run a quick web check via bright-data to verify the pattern is current.

### Modification 4: Upgrade `devsteps-R2-aspect-staleness`

Extend its protocol to include **external staleness checks** — not just git log comparison, but also version comparison against npm/PyPI registries.

---

## 5. Bright Data Integration — Ensuring It's Used for Every Technology Decision

### Current Configuration

- Bright Data MCP tools are listed in agent tool declarations: `bright-data/*`
- Available tools: `mcp_bright_data_search_engine`, `mcp_bright_data_scrape_as_markdown`, `mcp_bright_data_scrape_as_html`, `mcp_bright_data_extract`
- The `Copilot-Files-Standards-Specification.instructions.md` already declares bright-data as **"MANDATORY for planning/architecture decisions"**
- **BUT**: there is no `.vscode/mcp.json` in the workspace — bright-data appears to be configured at the user profile level

### Integration Gaps

1. **No workspace-level MCP config** — if another developer clones this repo, bright-data won't be available
2. **No auto-trigger** — MCP tools in VS Code cannot auto-trigger; they require explicit invocation by the model or instruction-based nudging
3. **MANDATORY label is not enforced** — saying "MANDATORY" in instructions doesn't force the model; it needs structural enforcement (e.g., checklist steps the model must follow)

### Recommended Bright Data Usage Pattern

```
BEFORE suggesting any library pattern, API call, or framework configuration:

1. mcp_bright_data_search_engine: "[library] [pattern] current best practice 2025 2026"
2. mcp_bright_data_scrape_as_markdown: [official docs URL for the specific feature]
3. Compare findings against training knowledge
4. If discrepancy found → use web-sourced information
5. If no discrepancy → proceed with training knowledge, cite "verified current as of [date]"
```

### MCP Auto-Start Configuration

VS Code supports `chat.mcp.autoStart` (experimental) to automatically start MCP servers. This should be enabled for bright-data:

```jsonc
// .vscode/settings.json
{
  "chat.mcp.autoStart": true
}
```

But auto-**start** is not auto-**trigger**. The model must still decide to call the tool. The only way to force this is through **instruction engineering**.

---

## 6. Example Instruction Text — Enforcing "Always Search Before Suggesting Library Patterns"

### Recommended New Instruction File

```markdown
---
applyTo: "**/*.{ts,tsx,js,jsx,py,java,cpp,cs,go,rs,json,yaml,yml,toml,cfg}"
description: "Web-first research protocol — forces web verification before library/framework/API suggestions"
---

# Web-First Research Protocol

## MANDATORY: Verify Before Suggesting

**Your training data has a cutoff. The current date is dynamic. Any library, framework, API, or configuration pattern you suggest may be outdated.**

Before writing or suggesting code that involves ANY of the following, you MUST search the web first:

1. **External package imports** — `import`, `require()`, `from X import Y`
2. **API endpoint calls** — REST, GraphQL, SDK method calls
3. **Configuration files** — tsconfig, vite.config, next.config, pyproject.toml, etc.
4. **CLI commands** — npx, pip, dotnet, cargo, etc.
5. **Security patterns** — auth, encryption, CORS, CSP
6. **Cloud service setup** — AWS, Azure, GCP services

## Search Protocol

Use this exact sequence:

1. Search: `mcp_bright_data_search_engine` with query "[library/tool] [specific pattern] latest docs 2025 2026"
2. If results reference official docs → fetch: `mcp_bright_data_scrape_as_markdown` on the official URL
3. If your training knowledge matches the web result → proceed, noting "verified current"
4. If your training knowledge DIFFERS from the web result → use the web-sourced pattern and flag the discrepancy

## Staleness Signals — Auto-Trigger Web Search

When the user's request contains any of these patterns, web search is NON-NEGOTIABLE:

- Version numbers: "v2", "latest", "upgrade to"  
- Framework names: React, Next.js, Vue, Angular, FastAPI, Django, Express, etc.
- Package managers: npm, yarn, pnpm, pip, cargo, go get
- "How do I..." + any library/framework name
- "Best practice for..." + any technology
- Error messages from external libraries
- "Is X deprecated?" or "what replaced X?"

## What NOT to Search

- Pure algorithm/data structure questions
- Language syntax that is stable (basic Python, core JS operators)
- Internal codebase questions (use workspace search instead)
- Math/logic problems

## Output Format

When web research was performed, include a brief citation:
> Verified against [source] ([date]): [key finding]

When web research found a discrepancy with training knowledge:
> ⚠️ Training knowledge outdated: [what changed]. Source: [URL] ([date])
```

### Alternative: Lightweight Version (for Token Budget Concerns)

```markdown
---
applyTo: "**"
description: "Web-first verification for external technology suggestions"
---

# Web Verification Rule

**BEFORE suggesting any external library pattern, API call, or framework configuration:**
1. Search `mcp_bright_data_search_engine`: "[technology] [pattern] latest 2025 2026"
2. If official docs found → fetch with `mcp_bright_data_scrape_as_markdown`
3. Use web-sourced pattern if it differs from training knowledge
4. Cite source and date in response

**Triggers:** package imports, API calls, config files, CLI commands, security patterns, cloud services.
**Skip for:** pure algorithms, stable language syntax, internal codebase questions.
```

---

## Summary of Recommendations

| # | Action | Impact | Effort |
|---|---|---|---|
| 1 | **Create `devsteps-web-first-research.instructions.md`** with the instruction text above | Forces web verification for ALL code conversations involving external tech | Low — single file |
| 2 | **Add `.vscode/mcp.json`** with bright-data configuration | Ensures bright-data is available for all workspace users | Low — single file |
| 3 | **Modify coord** to include T2 Research in STANDARD triage (not just COMPETITIVE) | Web research becomes part of every non-trivial implementation | Medium — agent file edit |
| 4 | **Extend `aspect-staleness`** to check package registry versions (npm/PyPI) | Catches version drift automatically | Medium — protocol addition |
| 5 | **Add `bright-data/*` tools to `researcher.agent.md`** | The user-invokable researcher agent currently lacks web search tools | Low — single line |
| 6 | **Enable `chat.mcp.autoStart`** in workspace settings | Ensures MCP servers start automatically | Low — settings change |
| 7 | **Monitor Google Developer Knowledge API** availability for non-Google docs | Industry trend toward canonical doc APIs will expand over 2026 | Watch — no action yet |

### Architecture Principle

The fundamental insight: **staleness detection should not be opt-in.** The current workspace architecture treats web research as a specialized capability (COMPETITIVE triage only). The fix is to make it a **default gate** — every implementation path should pass through a lightweight web verification step before writing code that touches external dependencies. The instruction-level approach (Recommendation #1) is the fastest path because it applies to ALL conversations regardless of whether the formal DevSteps workflow is active.
