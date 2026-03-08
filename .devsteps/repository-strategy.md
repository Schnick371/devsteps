# Repository Strategy: Why DevSteps Metadata Stays In-Project

## Executive Summary

**Decision:** DevSteps metadata (`.devsteps/`) remains in the same repository as project code.

**Rationale:** Work item metadata is project-specific, tightly coupled to implementation, and requires atomic commits for traceability.

**Alternatives Considered:** Git submodules, separate repository, git worktree.

**Research Base:** 60+ sources including Atlassian, GitHub, Microsoft, Stack Overflow, industry practitioners.

---

## Context

DevSteps tracks work items (epics, stories, tasks, bugs) as structured metadata in `.devsteps/`. The question arose: should this metadata live in a git submodule for organizational separation?

## Research Findings

### Git Submodules: Design Intent

Git submodules are designed for:
- **External dependencies** with independent lifecycles (e.g., third-party libraries)
- **Multi-project code reuse** (shared audio library across 20+ products)
- **Strict version pinning** of dependencies
- **Separate ownership/permissions** for shared components

**Source:** Git official documentation, Atlassian Git Tutorials, Microsoft Engineering Playbook

### Git Submodules: Known Limitations

Industry consensus identifies severe friction points:

1. **Coordination Overhead**
   - Every change requires TWO commits: submodule + parent pointer update
   - Manual sync operations (`git submodule update --init --recursive`)
   - Easily leads to desynchronized state

2. **Team Friction**
   - Steep learning curve for contributors
   - Common mistakes: forgotten `--recursive`, detached HEAD state, push conflicts
   - Tools (CI/CD, IDEs) often have poor submodule support

3. **Refactoring Barriers**
   - Breaking changes across repos require complex coordination
   - Cannot test overall change atomically
   - Must maintain backward compatibility during transitions

4. **Transitive Duplication**
   - Diamond dependencies create multiple copies of same submodule
   - Observed in production: 6 copies of identical submodule in one project

5. **Clone Experience**
   - Empty folders if `--recursive` flag omitted
   - Confusing error messages for new contributors
   - Additional setup steps compared to standard git workflow

**Sources:** "Reasons to avoid Git submodules" (Tim Hutt), Stack Overflow consensus, Reddit /r/git discussions, Hacker News thread #31792303

### DevSteps-Specific Antipatterns

Applying submodules to `.devsteps/` violates core design principles:

#### Antipattern 1: Wrong Abstraction
- **Submodules for:** Code dependencies
- **DevSteps is:** Project workflow metadata
- **Mismatch:** Treating tracking system as reusable library

#### Antipattern 2: Broken Atomicity
```bash
# Current workflow (monorepo):
git commit -am "feat(STORY-042): Add user authentication

Implements: STORY-042"
# ✅ Single atomic commit: code + status update

# Submodule workflow:
cd .devsteps/
git commit -am "Update STORY-042 to in-progress"
git push origin main
cd ..
git add .devsteps/
git commit -am "Update submodule pointer"
git push origin main
# ❌ Two commits, manual coordination, easy to desync
```

#### Antipattern 3: Feature Branch Workflow Destruction
- **Current:** Feature branch contains BOTH code changes AND work item status updates
- **Submodule:** Status updates require separate commit to submodule, breaking single-branch workflow
- **Impact:** Traceability lost, git blame fragmented, merge conflicts increase

#### Antipattern 4: Single-Project Scope
- DevSteps metadata is NOT reused across projects
- Each project has unique work items
- No multi-project sharing benefit from submodule separation

#### Antipattern 5: Team Complexity Without Benefit
- Forces ALL contributors to learn submodule commands for basic workflow
- Status updates become multi-step operations
- Increases onboarding burden significantly

## Alternative Approaches Evaluated

| Approach | Traceability | Workflow Simplicity | Team Onboarding | Atomicity | Recommendation |
|----------|--------------|---------------------|-----------------|-----------|----------------|
| **Monorepo (current)** | ✅ Perfect | ✅ Standard git | ✅ Minimal | ✅ Single commit | **OPTIMAL** |
| **Git Submodule** | ❌ Fragmented | ❌ Complex | ❌ High friction | ❌ Two commits | **Avoid** |
| **Separate Repo** | ⚠️ Manual sync | ⚠️ Extra steps | ⚠️ Moderate | ❌ Dual commits | **Suboptimal** |
| **Git Worktree** | ⚠️ Scattered | ❌ Advanced | ❌ Complex | ⚠️ Manual | **Unnecessary** |

## Decision: Monorepo Approach

### Why Current Approach Wins

**1. Atomic Commits = Perfect Traceability**
```bash
git log --grep="STORY-042"
# Returns: ALL changes (code + metadata) for story in single view

git blame src/auth.ts
# Shows: Commit with "Implements: STORY-042" footer
# Navigate to: Full context including work item status at that moment
```

**2. Feature Branch Workflow Preserved**
```
story/STORY-042
├── src/auth.ts (implementation)
├── src/auth.test.ts (tests)
└── .devsteps/items/stories/STORY-042.json (status: in-progress → done)

Single merge to main = Complete feature delivery
```

**3. Team Simplicity**
- Standard git commands only
- No submodule magic required
- Clear mental model: "work item metadata lives with code"

**4. Industry Alignment**
- Jira, Linear, GitHub Projects: Metadata in external systems OR same repo
- Task tracking tools: Never recommend submodule approach
- Monorepos at scale (Google, Facebook): Metadata WITH code

### Separation Already Achieved

DevSteps provides separation through **architectural boundaries**, not repository boundaries:

- **MCP Protocol:** VS Code extension accesses metadata via clean API
- **CLI Interface:** Standalone tool for work item management
- **Export Functionality:** Generate reports for external analytics
- **Schema Validation:** Shared package ensures consistency

## Alternative Separation Strategies (If Needed)

If organizational requirements demand external metadata storage:

### Option A: Post-Commit Sync (Recommended)
```bash
# Git hook: .git/hooks/post-commit
#!/bin/bash
rsync -a .devsteps/ /external/devsteps-metadata/$PROJECT_NAME/
```
- Benefits: Automated, transparent, atomic commits preserved
- Use case: Compliance requirements for metadata audit trail

### Option B: MCP Server External Storage
- Store work items in database/API
- `.devsteps/` becomes cache layer
- Benefits: Multi-project queries, advanced analytics
- Complexity: Requires infrastructure

### Option C: Separate Repo + Automation
```bash
# CI job: On main branch push
- rsync .devsteps/ devsteps-metadata-repo/
- commit + push to metadata repo
```
- Benefits: Separation for permissions/access control
- Drawback: Async sync, potential lag

## Guidelines for Future Decisions

Use git submodules ONLY when:
- ✅ Code is reused across MULTIPLE unrelated projects
- ✅ Component has independent release cycle
- ✅ Separate team owns the dependency
- ✅ Strict version pinning required
- ✅ Team proficient with submodule workflows

NEVER use git submodules for:
- ❌ Project-specific metadata
- ❌ Tightly coupled components
- ❌ Single-project tracking systems
- ❌ Configuration files
- ❌ Build artifacts or generated files

## References

### Primary Sources
1. "Mastering Git submodules" - Christophe Porteneuve, Medium
2. "Git Tools - Submodules" - Official Git Book (git-scm.com)
3. "Best Practices for Using Git Submodules" - PixelFreeStudio
4. "Git Submodule" - Atlassian Git Tutorials
5. "Managing Git Projects: Git Subtree vs. Submodule" - GitProtect.io

### Critical Analyses
6. "Reasons to avoid Git submodules" - Tim Hutt Blog
7. "Git Submodules: The Honest Guide I Wish I Had" - Nitish Kumar, Medium
8. "Ask HN: Why are Git submodules so bad?" - Hacker News #31792303
9. "Never use git submodules" - Lobste.rs discussion
10. "Git Submodules vs Monorepos" - DEV Community

### Industry Practices
11. "Working with Git Submodules" - Microsoft DevBlogs
12. "Git Guidance" - Microsoft Engineering Fundamentals Playbook
13. "Git Submodule Support" - Adobe Experience Manager
14. "Submodules: Core Concept, Workflows And Tips" - Atlassian

### Stack Overflow Consensus
15. "How to correctly configure git submodule" - Stack Overflow
16. "Monorepo vs. Git submodules" - Stack Overflow
17. "Choosing Git Version Control Strategy" - Stack Overflow
18. "What are advantages/disadvantages of git submodules" - Stack Overflow

### Community Discussions
19. Reddit /r/git: "Git Monorepo vs Multi-repo vs Submodules"
20. Reddit /r/programming: "Managing multiple Git repos"
21. Quora: "Is it better to use monorepo or multiple repositories"

**Total Sources Consulted:** 60+ (web searches conducted January 2026)

## Revision History

- **2026-01-14:** Initial documentation based on git submodule research (60+ sources)
  - Decision: Maintain monorepo approach for `.devsteps/`
  - Rationale: Atomic commits, workflow simplicity, traceability
  - Research: Submodules designed for dependencies, not metadata
