---
agent: 'devsteps'
model: 'Claude Sonnet 4.5'
tools: ['read', 'search', 'usages', 'edit', 'semantic', 'execute/runInTerminal', 'devsteps/*', 'todo', 't avily/*']
description: 'Project knowledge base creation - document architecture, patterns, decisions for Copilot memory and consistent implementation'
---

# 📚 Project Context Documentation - Copilot Memory System

## Mission

Create living documentation in `.devsteps/context/` that serves as **Copilot's project memory**. Prevents reimplementation of already-defined patterns, captures architectural decisions, and links to DevSteps work items for implementation details.

**Used at project start and maintained throughout lifecycle.**

**Goal:** Copilot checks context docs BEFORE implementing, ensuring consistency across components.

## Core Principles

**README-First Discovery:**
- Start with `.devsteps/context/README.md` as central index
- Discover project-specific aspects through codebase analysis
- Let project tell you what's important, don't prescribe dimensions

**Context as Implementation Guide:**
- Document HOW things are done (patterns, conventions, decisions)
- Link to WHO decided (ADRs) and WHY (work items)
- Reference WHERE implemented (file paths, code examples)
- Prevent Copilot from "inventing" different approaches

**Work Item Integration:**
- Context files reference relevant work items
- Work items link to context documentation
- Implementation details in items, strategic context in docs
- Bidirectional traceability

**Living Documentation:**
- Updated when patterns change
- Referenced during implementation
- Version-controlled for history
-Markdown for readability

## Use Cases

**Problem: Inconsistent Implementation**
- Multi-app projects (frontend A + frontend B + backend)
- Authentication implemented 3 different ways
- Each time Copilot "invents" new approach

**Solution: Context Documentation**
- `.devsteps/context/authentication.md` documents THE pattern
- Copilot reads before implementing
- Links to work items with implementation details
- References actual code locations

**Problem: Forgotten Requirements**
- Work items created but context lost
- Copilot doesn't understand project goals
- Repeats research instead of checking docs

**Solution:README.md Index**
- Central overview of project architecture
- Links to aspect-specific documentation
- Quick reference for common patterns
- Copilot's first stop before work

## Documentation Structure

**Central Index:**
```
.devsteps/context/README.md
```

**Aspect-Specific Documentation:**
```
.devsteps/context/
├── README.md                    # Index + project overview
├── authentication.md            # How auth works across all apps
├── cli-library-separation.md    # Package architecture decisions
├── logging-infrastructure.md    # Logging patterns and tools
├── path-resolution-truth.md     # File path handling strategy
├── testing-patterns.md          # Test conventions and setup
└── ...                          # Project-specific aspects
```

**README.md Purpose:**
- Project overview (What is this project?)
- Technical stack summary
- Index of context files with 1-line descriptions
- Quick reference for common patterns
- Links to key Epics and architectural work items

**Aspect File Purpose:**
- WHY this aspect matters (business/technical rationale)
- WHAT the current approach is (implementation pattern)
- HOW it's implemented (code locations, examples)
- WHO decided (link to ADRs if formalized)
- WHEN to use this pattern (applicability guidance)
- Related work items (with DevSteps IDs)

## Workflow

Use `#manage_todo_list` to track progress through phases.

### Phase 1: Project Discovery

**Goal:** Understand what aspects matter for THIS project.

**Discovery Protocol:**

1. **Check for existing context:**
   - Does `.devsteps/context/README.md` exist?
   - What aspects are already documented?
   - Are docs current or stale?

2. **Analyze work items:**
   ```bash
   #mcp_devsteps_list --status done,in-progress
   ```
   - What areas have most work items?
   - Which Epics define architecture?
   - What patterns emerge from completed work?

3. **Survey codebase structure:**
   - Monorepo vs single-package?
   - Multiple applications or libraries?
   - What technologies/frameworks used?
   - What crosscutting concerns exist?

4. **Identify project-specific aspects:**
   - Authentication & authorization patterns
   - Data access & storage strategies
   - Build & deployment pipelines
   - Testing approaches
   - Logging & monitoring
   - Error handling conventions
   - Configuration management
   - Module boundaries & dependencies

**Output:** List of aspects to document (project-specific, not prescriptive).

### Phase 2: README.md Creation/Update

**Goal:** Central index for Copilot's project understanding.

**README.md Content:**

**Section 1: Project Overview**
- What problem does this project solve?
- What are the main components?
- Who are the users/consumers?

**Section 2: Technical Stack**
- Languages & frameworks
- Key libraries & dependencies
- Development tools

**Section 3: Architectural Principles**
- High-level design decisions
- Non-negotiable constraints
- Quality attributes prioritized

**Section 4: Aspect Index**
- Table of contents for context docs
- 1-2 line description per aspect
- Links to detailed aspect files

**Section 5: Quick Reference**
- Most common patterns
- Frequently referenced work items
- Key file locations

**Section 6: Getting Context**
- How to use these docs during implementation
- When to update context
- How to link work items

### Phase 3: Aspect Documentation

**For EACH discovered aspect:**

**Investigation:**
- Search codebase for implementations
- Read related work items for context
- Identify patterns and conventions
- Find code examples

**Documentation:**

Create `.devsteps/context/[aspect].md`:

```markdown
# [Aspect Name]

**Last Updated:** [Date]
**Owner/Decider:** [Team/Person or "emerging pattern"]

## Why This Matters

[Business or technical rationale for this aspect]

## Current Approach

[HIGH-LEVEL description of pattern/convention]

## Implementation Details

### Pattern/Convention 1
- Description
- When to use
- Code locations: [file paths]
- Examples: [link to actual files]

### Pattern/Convention 2
- ...

## Key Decisions

- Decision 1: What, why, when, impact
- Decision 2: ...
- ADR references if formalized

## Related Work Items

- EPIC-XXX: [Title] - [Why relevant]
- STORY-XXX: [Title] - [Implementation details here]
- TASK-XXX: [Title] - [Specific technique]

## Code Locations

- Primary: [main implementation]
- Examples: [reference implementations]
- Tests: [test files demonstrating usage]

## Common Pitfalls

[What NOT to do, with rationale]

## Future Considerations

[Planned changes from in-progress/planned work items]
```

**Integration with Work Items:**
- Reference work items that define or refine this aspect
- Note which work items implement specific patterns
- Link to affected_paths in work item metadata

**Code Examples:**
- Link to actual files (don't copy/paste)
- Note line ranges if specific
- Keep examples current with codebase

### Phase 4: Work Item Correlation

**Goal:** Bidirectional links between context and work items.

**For each aspect documented:**

1. **Find related work items:**
   ```bash
   #mcp_devsteps_search "authentication"
   #mcp_devsteps_list --tags security,auth
   ```

2. **Update work item descriptions:**
   - Add "See: `.devsteps/context/authentication.md`" references
   - Ensure affected_paths match documented code locations
   - Link Epic/Story hierarchy to architectural context

3. **Update aspect documentation:**
   - Add work item IDs to "Related Work Items" section
   - Note implementation status from work items
   - Document planned changes from in-progress items

**Traceability Matrix:**
- Every architectural pattern has supporting work items
- Every work item references relevant context documentation
- Copilot can navigate from code → context → work item

### Phase 5: README.md Finalization

**Update central index:**

1. **Add all discovered aspects** to index
2. **Verify links** to aspect files
3. **Add quick reference** for most critical patterns
4. **Link to key Epics** defining architecture

**Quality checks:**
- README readable without diving into aspects
- Aspect index complete
- Most important patterns highlighted
- Newcomer can understand project from README

### Phase 6: Maintenance Protocol

**When to update context:**
- New architectural pattern introduced
- Existing pattern significantly changed
- Work item creates new crosscutting concern
- Implementation diverges from documented approach

**Update workflow:**
1. Identify affected aspect file(s)
2. Update implementation details
3. Add/update related work items
4. Update "Last Updated" timestamp
5. Commit with reference to triggering work item

**Deprecation:**
- Mark obsolete patterns clearly
- Note what supersedes them
- Keep for historical reference
- Link to superseding work item

## Git Integration

**Commit Strategy:**
- Context creation: Single commit with all initial aspects
- Context updates: Per-aspect commits during maintenance
- Work item linking: Separate commit after correlation

**Commit Message Format:**
```
docs(context): create project knowledge base

- Created .devsteps/context/README.md (central index)
- Documented [N] project-specific aspects
- Linked [N] work items to context
- Established Copilot memory system

Aspects: [authentication, testing, deployment, ...]
```

**Branch Strategy:**
- Context creation usually in `main` (planning phase)
- Updates can be in feature branches if aspect changes with implementation
- Prefer main branch to keep context accessible

## Communication Standards

**Progress Updates:**
- Phase 1: "[N] aspects discovered for documentation"
- Phase 3: "Documented aspect: [name] ([M] patterns, [K] work items)"
- Phase 5: "README.md complete - [N] aspects indexed"

**Aspect Documentation Report:**
- Aspect name and  purpose
- Patterns documented
- Work items linked
- Code locations referenced
- Limitations/gaps noted

**Final Summary:**
- Total aspects documented
- README.md status
- Work item correlation count
- Traceability coverage
- Maintenance protocol established

## Critical Rules

**Discovery Principles:**
- Let project reveal what's important
- Don't force generic dimensions onto unique projects
- Aspects emerge from work items and code patterns
- Quality over quantity - document what matters

**Documentation Principles:**
- Link to code, don't copy it
- Reference work items for rationale
- Update when patterns change
- Keep README.md current as index

**Work Item Integration:**
- Context explains HOW (patterns, conventions)
- Work items explain WHY (business need) and WHAT (requirements)
- Together form complete picture
- Copilot navigates both for implementation

**Copilot Memory Goal:**
- Copilot reads context BEFORE implementing
- Prevents "invention" of conflicting approaches
- Ensures consistency across components
- Reduces research time - answers already documented

**Trust the Model:**
- Provide principles and patterns, not prescriptive recipes
- Let Copilot reason about applicability
- Document what exists, not rigid rules
- Context guides, doesn't constrain

## Example: Multi-App Authentication

**Problem:**
- Project has 3 frontends + 1 backend
- Authentication needed in all apps
- Copilot keeps implementing different approaches

**Context Solution:**

**`.devsteps/context/README.md`:**
```markdown
## Aspect Index
- [authentication.md](authentication.md) - OAuth2 + JWT pattern for all apps
```

**`.devsteps/context/authentication.md`:**
```markdown
# Authentication & Authorization

**Last Updated:** 2026-02-05
**Owner:** Security team decision (EPIC-003)

## Why This Matters

All apps (admin-ui, customer-portal, mobile-app) must share authentication for SSO.

## Current Approach

OAuth2 authorization code flow + JWT tokens.
- Identity Provider: Keycloak (self-hosted)
- Token storage: httpOnly cookies (web), secure storage (mobile)
- Refresh strategy: Silent refresh 5min before expiry

## Implementation Details

### Web Apps (admin-ui, customer-portal)
- Library: `@auth0/auth0-react` (Keycloak-compatible)
- Configuration: `src/config/auth.ts`
- Protected routes: `src/components/ProtectedRoute.tsx`
- Code: [apps/admin-ui/src/auth/](../../apps/admin-ui/src/auth/)

### Mobile App
- Library: AppAuth SDK
- Configuration: `mobile/src/config/auth.ts`
- Token refresh: Background service
- Code: [apps/mobile/src/services/auth/](../../apps/mobile/src/services/auth/)

### Backend Validation
- Library: `jsonwebtoken`
- Middleware: `src/middleware/authMiddleware.ts`
- Token validation: RS256 signature + claims check
- Code: [backend/src/middleware/](../../backend/src/middleware/)

## Related Work Items

- EPIC-003: Unified Authentication System - architectural decision
- STORY-045: Implement OAuth2 in admin-ui - web pattern established
- STORY-046: Implement OAuth2 in customer-portal - reused pattern
- TASK-178: Configure Keycloak realms - infrastructure setup

## Common Pitfalls

- Don't store JWT in localStorage (XSS vulnerability)
- Don't implement custom token refresh (use library)
- Don't skip HTTPS in production (token interception)

## Future Considerations

- STORY-089 (planned): Add biometric auth to mobile
- SPIKE-012 (in-progress): Evaluate passwordless options
```

**Copilot Workflow:**
1. User: "Implement authentication in new-admin-tool"
2. Copilot: Reads `.devsteps/context/README.md`
3. Copilot: Opens `.devsteps/context/authentication.md`
4. Copilot: Sees OAuth2 + JWT pattern for web apps
5. Copilot: References STORY-045 for implementation details
6. Copilot: Follows established pattern consistently

**Result:** Consistent authentication across all apps, no research duplication.

---

**This prompt creates Copilot's project memory - the knowledge base that prevents re-invention and ensures consistency.**

**See also:**
- devsteps-10-plan-work.prompt.md - Creating work items from project planning
- devsteps-55-item-cleanup.prompt.md - Maintaining work item quality
- .github/instructions/devsteps-documentation.instructions.md - Markdown standards
