## Goal

Add the English-only mandate to the four files listed below. Content-only changes — no logic or schema modifications.

## Files and Changes

### 1. `.github/prompts/devsteps-10-plan-work.prompt.md`

In **Section 5: Create Items**, add a prominent callout **before** the type/priority line:

```markdown
> **Language Rule (MANDATORY):** All work item content — title, description,
> acceptance criteria, and section headings — MUST be written in English.
> This applies regardless of the language used in the chat conversation.
```

### 2. `.github/instructions/devsteps-devsteps-usage.instructions.md`

Add a new **Language** section near the top (after the intro, before API contracts):

```markdown
## Language Rule

All DevSteps work item content MUST be written in English:
- Title
- Description (all sections, headings, prose)
- Acceptance criteria
- Tags (use English words)

The language of the chat session or the developer's locale does NOT affect this rule.
```

### 3. `.github/agents/devsteps-t1-coordinator.agent.md`

Expand the current vague line:
```
# Before
Merge to main `--no-ff`. All outputs in English.

# After
Merge to main `--no-ff`. All outputs in English — this includes work item titles,
descriptions, acceptance criteria, and section headings. Never write DevSteps
item content in any language other than English, regardless of the conversation language.
```

### 4. `.github/agents/devsteps-t1-sprint-executor.agent.md`

Same expansion as the coordinator file (same line, same location).

## Acceptance Criteria
- [ ] All 4 files updated with English-only rule
- [ ] Rule is positioned where it will be seen before item creation
- [ ] No functional logic changed — docs/prompts/agents only