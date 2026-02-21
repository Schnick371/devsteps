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

**Tool Selection Guidelines**:
- **Core Tools**: `'think'` (always recommended for analysis)
- **File Operations**: `'edit'`, `'search'`, `'usages'`, `'fileSearch'`, `'readFile'`
- **Development**: `'runCommands'`, `'runTask', 'getTaskOutput'`, `'problems'`
- **Research**: `'tavily'`, `'githubRepo'` - **MANDATORY for planning/architecture decisions**
- **Testing**: `'runTests'`, `'testFailure'`
- **Specialized**: Vary by prompt purpose and requirements

## Supported Properties
- `applyTo`: Glob pattern (examples: all files, specific extensions, directory-specific, file-specific)
- `description`: Brief file purpose description
- `agent`: Agent name for prompt files
- `model`: AI model specification (see Model Selection Guidelines below)
- `tools`: Variable array based on prompt requirements (see Tool Selection Guidelines above)

## Tavily Research Protocol

**When required:** Planning, architecture, unknown patterns, technology choices
**Minimum:** 10+ sources across different domains

**Tool Selection:**
- Planning/Architecture: `#mcp_tavily_tavily_research` (auto multi-source synthesis)
- Specific docs: `#mcp_tavily_tavily_search` + `#mcp_tavily_tavily_extract`
- Known URLs: `fetch_webpage` (no Tavily limits)

**Never:** Proceed with guesses when research provides evidence

## Model Selection

- `'GPT-5 mini'` - Simple tasks
- `'Grok Code Fast 1 (Preview) (copilot)'` - Short files (<250 lines), speed-critical
- `'Claude Sonnet 4.6'` - Complex prompts, advanced workflows  
- `'Gemini 3 Pro (Preview)'` - Long files (>500 lines), deep reasoning

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