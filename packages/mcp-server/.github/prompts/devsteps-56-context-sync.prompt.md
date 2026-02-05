---
agent: 'devsteps'
model: 'Claude Sonnet 4.5'
tools: ['read', 'search', 'usages', 'edit', 'semantic', 'execute/runInTerminal', 'devsteps/*', 'todo', 'tavily/*']
description: 'Project knowledge base creation - document architecture, patterns, decisions for Copilot memory and consistent implementation'
---

# 📚 Project Context Documentation - Copilot Memory System

## Mission

Create living documentation in `.devsteps/context/` as **Copilot's project memory**. Prevents reimplementation of defined patterns, captures architectural decisions, links to work items.

**Used at project start and maintained throughout lifecycle.**

**Goal:** Copilot reads context BEFORE implementing → consistency across components.

## Core Principles

**README-First Discovery:**
- Central index at `.devsteps/context/README.md`
- Discover project-specific aspects from codebase analysis
- Let project reveal what matters

**Context as Implementation Guide:**
- Document HOW (patterns, conventions, decisions)
- Link to WHO/WHY (ADRs, work items)
- Reference WHERE (file paths)
- Prevent "inventing" different approaches

**Work Item Integration:**
- Context files reference work items
- Work items link to context docs
- Implementation details in items, strategic context in docs
- Bidirectional traceability

**Living Documentation:**
- Updated when patterns change
- Version-controlled
- Markdown format

## Documentation Structure

**Central Index:**
```
.devsteps/context/README.md        # Project index
```

**Aspect Documentation (Project-Specific):**

Discover aspects from codebase reality. Common examples include:
- **Data Model & Schema**: Database, ORMs, API contracts, DTOs
- **Architecture & Design**: System boundaries, module dependencies, patterns
- **DevOps & Infrastructure**: CI/CD, deployment, monitoring, IaC
- **Frontend/UI Patterns**: Component hierarchy, state management, routing
- **Authentication & Authorization**: OAuth, JWT, session management
- **Testing Strategies**: Unit, integration, E2E patterns
- **Logging & Monitoring**: Structured logging, metrics, tracing
- **Error Handling**: Exception patterns, validation, user feedback
- **Configuration Management**: Environment configs, feature flags
- **Build & Deployment**: Scripts, pipelines, release process

**File naming:** Descriptive kebab-case (authentication.md, logging-infrastructure.md, cli-library-separation.md)

**README.md Content:**
- Project overview + technical stack
- Index of aspect files (1-line descriptions)
- Quick reference for common patterns
- Links to key work items

**Aspect File Template:**
```markdown
# [Aspect Name]

**Last Updated:** [Date]

## Why This Matters
[Rationale]

## Current Approach
[Pattern/convention description]

## Implementation Details
[Code locations, key files]

## Related Work Items
- EPIC-XXX: [Context]
- STORY-XXX: [Details]

## Common Pitfalls
[What to avoid]
```

## Workflow

Use `#manage_todo_list` to track phases.

### Phase 1: Discovery

**Goal:** Identify aspects to document.

1. Check existing `.devsteps/context/README.md`
2. Analyze work items for patterns:
   ```bash
   #mcp_devsteps_list --status done,in-progress
   ```
3. Survey codebase structure (monorepo, apps, libraries)
4. Identify crosscutting concerns (auth, logging, testing, etc.)
5. List project-specific aspects for documentation

### Phase 2: README.md Creation

**Goal:** Central index for navigation.

Create/update `.devsteps/context/README.md`:
- Project overview
- Technical stack summary
- Aspect index with descriptions
- Quick reference patterns
- Key work item links

### Phase 3: Aspect Documentation

**For each discovered aspect:**

1. **Investigate:**
   - Search codebase for implementations
   - Read related work items
   - Identify patterns and conventions

2. **Document:**
   - Create `.devsteps/context/[aspect].md`
   - Follow template structure
   - Link to code locations (not copy/paste)
   - Reference work items

3. **Integrate:**
   - Add to README.md index
   - Link work items to context file
   - Update work item descriptions

### Phase 4: Work Item Correlation

**Goal:** Bidirectional traceability.

For each aspect:
1. Find related work items via search
2. Update work item descriptions: "See: `.devsteps/context/[aspect].md`"
3. Verify affected_paths match documented code
4. Add work item IDs to aspect file

### Phase 5: Validation

**Quality checks:**
- README.md readable and complete
- All aspect files follow template
- Work items reference context docs
- Code locations current
- No copy/pasted code

### Phase 6: Maintenance

**Update context when:**
- New pattern introduced
- Existing pattern changes
- Work item creates new crosscutting concern
- Implementation diverges from docs

**Update workflow:**
1. Identify affected aspect file(s)
2. Update implementation details
3. Add/update work item links
4. Update timestamp
5. Commit with work item reference

## Git Integration

**Commit Strategy:**
- Context creation: Single commit with all aspects
- Updates: Per-aspect commits
- Prefer `main` branch (planning phase)

**Commit Format:**
```
docs(context): create project knowledge base

- Created .devsteps/context/README.md
- Documented [N] aspects
- Linked [N] work items

Aspects: [list]
```

## Communication Standards

**Progress Updates:**
- Phase 1: "[N] aspects identified"
- Phase 3: "Documented: [aspect-name]"
- Phase 5: "README.md complete"

**Final Summary:**
- Aspects documented
- Work items correlated
- README.md status

## Critical Rules

**Discovery:**
- Let project reveal aspects
- Don't force generic templates
- Quality over quantity

**Documentation:**
- Link to code, don't copy
- Reference work items
- Update when patterns change
- README.md as central index

**Work Item Integration:**
- Context = HOW (patterns)
- Work items = WHY/WHAT (requirements)
- Bidirectional links required

**Copilot Memory:**
- Read context BEFORE implementing
- Prevents conflicting approaches
- Ensures consistency
- Reduces redundant research

---

**This creates Copilot's project memory preventing re-invention of established patterns.**

**See also:**
- devsteps-10-plan-work.prompt.md - Creating work items
- devsteps-55-item-cleanup.prompt.md - Work item maintenance
- .github/instructions/devsteps-documentation.instructions.md - Markdown standards
