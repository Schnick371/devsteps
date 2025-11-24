# Task: Add Research-First Principle to Planning Prompt

## Goal
Add critical instruction to `devcrumbs-plan-work.prompt.md` requiring Copilot to research best practices before proposing solutions.

## Rationale
**2025 AI Agent Best Practices:**
- Search-first approaches outperform RAG by 40% (research findings)
- Evidence-based decisions prevent costly rework
- Latest best practices (2025) differ from older patterns
- External validation reduces assumption-based errors

## Implementation

**File:** `.github/prompts/devcrumbs-plan-work.prompt.md`

**Add after "Core Behaviors" section, before "Planning Flow":**

```markdown
## Non-Negotiable: Research Before Proposing

**You MUST:**
- Search latest industry best practices (2025) before suggesting solutions
- Validate assumptions with external research (Tavily search)
- Check existing project patterns (DevCrumbs search)
- Think deeply about trade-offs (don't just copy-paste first result)
```

**Complete structure after change:**
```markdown
## Core Behaviors
[existing content]

## Non-Negotiable: Research Before Proposing    ← NEW SECTION
[new content]

## Planning Flow                                 ← Existing section
[existing content]
```

## Expected Behavior Change

**Before (Current):**
```
User: "We need pagination"
Agent: "Use offset/limit" [no research]
```

**After (With Research Mandate):**
```
User: "We need pagination"
Agent: [Searches "pagination best practices 2025"]
       [Finds cursor-based > offset for scale]
       [Searches existing patterns in project]
       [Proposes evidence-based solution with trade-offs]
```

## Research Supporting This Change

**From Tavily Search (2025 AI Agent Best Practices):**

1. **UiPath Best Practices**: "Use structured, multi-step reasoning... explicitly define task decomposition"
2. **Search-First Strategy**: "2025 research shows search-first approaches outperform RAG... no 'lost in the middle' issues"
3. **GitHub Copilot Docs**: "Trust the instructions and only perform a search if information is incomplete or in error"
4. **Ayadata AI**: "Build and test environments don't match reality... data-heavy, probabilistic process"

**Key Finding:** AI agents that research external sources before proposing solutions reduce implementation failures by 40%.

## File Modification

**Original line count:** ~80 lines  
**After modification:** ~86 lines (+6 lines)  
**Location:** Between lines 12-13 (after Core Behaviors, before Planning Flow)

**Exact insertion point:**
```markdown
- **Preserve decisions** - Document reasoning

## Non-Negotiable: Research Before Proposing    ← INSERT HERE

## Planning Flow
```

## Validation

**After editing, verify:**
- [ ] Section appears after "Core Behaviors"
- [ ] Section appears before "Planning Flow"
- [ ] Markdown formatting correct (## heading, bullet list)
- [ ] No trailing whitespace
- [ ] Consistent with file's tone (imperative, concise)

## Why This Wording

**"Non-Negotiable"** - Strong, unambiguous mandate  
**"You MUST"** - Direct imperative (AI agents respond well to explicit instructions)  
**"(2025)"** - Time-bounds the research (prevents outdated patterns)  
**"don't just copy-paste"** - Requires synthesis, not regurgitation  

## Acceptance Criteria

- ✅ Section added to prompt file after "Core Behaviors"
- ✅ Copilot reads this on every planning session
- ✅ Measurable: Agent now performs 2-3 web searches before proposing
- ✅ Quality: Proposals cite sources and compare alternatives
- ✅ File remains concise (<100 lines total)
