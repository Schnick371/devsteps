---
applyTo: ".github/prompts/*.prompt.md,.github/instructions/*.instructions.md,.github/agents/*.agent.md"
description: "YAML frontmatter headers specification and best practices for GitHub Copilot files"
---

# YAML Frontmatter Headers Specification

## Required Headers

### Instructions Files

- `applyTo`: Glob pattern for target files
- `description`: Brief description of purpose

### Prompt Files

- `agent`: Target agent ('devsteps', 'edit', 'ask', or custom agent name)
- `model`: AI model specification
- `tools`: Variable array based on task needs
- `description`: Brief description of purpose

### Agent Files

- `description`: Brief agent purpose (shown in chat placeholder)
- `model`: AI model specification
- `tools`: Available tools for this agent
- `dispatch_role` *(optional)*: `coordinator` (Ring 0 coord-* only) | `conductor` (exec-impl, exec-test, exec-doc) | `leaf` (default — all others). Only `coordinator` and `conductor` may call `runSubagent`.
- `agents` *(conductor only)*: Explicit list of worker agents this conductor is permitted to dispatch via `runSubagent`. MUST be provided when `dispatch_role: conductor`.

**Tool Selection Guidelines**:

- **Core Tools**: `'think'` (always recommended for analysis)
- **File Operations**: `'edit'`, `'search'`, `'usages'`, `'fileSearch'`, `'readFile'`
- **Development**: `'runCommands'`, `'runTask', 'getTaskOutput'`, `'problems'`
- **Research**: `'bright-data'`, `'githubRepo'` - **MANDATORY for planning/architecture decisions**
- **Testing**: `'runTests'`, `'testFailure'`
- **Specialized**: Vary by prompt purpose and requirements

## Supported Properties

- `applyTo`: Glob pattern (examples: all files, specific extensions, directory-specific, file-specific)
- `description`: Brief file purpose description
- `agent`: Agent name for prompt files
- `model`: AI model specification (see Model Selection Guidelines below)
- `tools`: Variable array based on prompt requirements (see Tool Selection Guidelines above)

## bright-data Research Protocol

**When required:** Planning, architecture, unknown patterns, technology choices
**Minimum:** 10+ sources across different domains

**Tool Selection:**

- Planning/Architecture: `#mcp_bright-data_bright-data_research` (auto multi-source synthesis)
- Specific docs: `#mcp_bright-data_bright-data_search` + `#mcp_bright-data_bright-data_extract`
- Known URLs: `fetch_webpage` (no bright-data limits)

**Never:** Proceed with guesses when research provides evidence

## Model Selection

- `'Raptor mini (Preview)'` - Trivial tasks: CRUD operations, taxonomy/label assignment, build-failure classification
- `'GPT-5 mini'` - Structured/pattern-following tasks: doc writing, test writing, plan creation, context loading, aspect cross-validation, conductor orchestration
- `'Grok Code Fast 1 (Preview) (copilot)'` - Short files (<250 lines), speed-critical single-file edits
- `'Claude Sonnet 4.6'` - Complex reasoning: code writing, risk/quality analysis, orchestration, planning, quality gates
- `'Gemini 3 Pro (Preview)'` - Long files (>500 lines), deep reasoning

**Spider Web Ring-Based Assignment (token cost optimisation):**
- Ring 0 (coord), Ring 1 (archaeology/risk/quality/research/web), Ring 3 (planner), Ring 5 (gate): `Claude Sonnet 4.6`
- Ring 2 (aspects), Ring 4 exec-conductors, Ring 4 doc/test/guide/workspace/context workers: `GPT-5 mini`
- Ring 4 CRUD workers (devsteps, classifier, meta-hierarchy, build-diagnostics): `Raptor mini (Preview)`

## Content Guidelines

### File Length Limits

**Copilot Instruction Files:**

- **Maximum**: 100-150 lines per file
- **All combined**: Under 200 lines total
- **Reason**: Token budget shared with code + conversation
- **Reality**: Instructions ignored beyond 150-200 lines

### Content Quality

- **Avoid Redundancy**: Review files after editing to eliminate repeated content. Each rule or guideline should appear exactly once, clearly expressed.
- **Stay Focused**: Keep files concentrated on their specific domain or purpose
- **Clarity over Completeness**: Better to have clear, concise guidelines than exhaustive documentation

### Formatting Rules

- **Numbered lists** (`1.`, `2.`, `3.`, …) **MUST** be used for linear sequences — execution steps, solution paths, protocols, ordered workflows, anything where sequence matters
- **Bullet lists** (`-`) for unordered collections — options, capabilities, properties, rules without fixed order

### No Examples Policy

**FORBIDDEN:**

- Code examples, sample implementations, demonstration snippets
- Decision matrices with concrete code patterns
- Step-by-step implementation recipes with concrete code

**ALLOWED:**

- Numeric guidelines (file lengths, complexity limits)
- Procedural workflows (Step 1, Step 2) without code
- Structural guidance (file organization, naming)

**Principle:** WHY and WHAT, not detailed HOW with code

### Trust the Model

- Principles over recipes
- Goals over prescriptive rules
- Let models use their reasoning strengths

### `#askQuestions` Usage Boundaries

Coordinator agents must distinguish user-facing decisions from internal orchestration decisions.

**PERMITTED** (user judgment required):
- Item selection when none specified or ambiguous
- HARD STOP escalation (ESCALATED verdict, HIGH_RISK, architecture decisions)
- Guide cycle step result collection after human-executed steps
- Session scope / focus / tag filter at session start (once only)
- Pre-planner gate — display compiled overview then ONE `#askQuestions` after Ring 2, before exec-planner (only if ambiguities exist; skip if operation is clear)
- Post-sprint gate — ONE `#askQuestions` after gate-reviewer PASS if new blockers or replanning needs arose (skip if none)
- Post-completion gate — ONE `#askQuestions` after task/sprint is done; ALWAYS ask with multiple-choice options what to do next

**PROHIBITED** (coordinator decides autonomously — never ask user):
- Triage tier selection (QUICK / STANDARD / FULL / COMPETITIVE)
- Ring composition — which analysts or aspects to dispatch
- Dispatch order — sequence of exec agents
- Agent selection within a ring

Violation of this boundary breaks the Spider Web autonomy model and leaks internal orchestration state to the user interface.

## File Naming

**DevSteps Standard:** All files use `devsteps-` prefix (lowercase-with-hyphens)

- **Instructions**: `devsteps-<subject>-<topic>.instructions.md`
- **Prompts**: `devsteps-<number>-<action>.prompt.md`
- **Agents**: `devsteps-<role>.agent.md` (persona, not action verb)

## ApplyTo Patterns

- All files: `"**"`
- Python: `"**/*.py"`
- Multiple: `"**/*.ts,**/*.tsx"`
- Directory: `"**/web/**,**/config/**"`
- File-specific: use filename pattern for targeted files
