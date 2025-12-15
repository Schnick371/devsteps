# LessonsLearned - AI Implementation Reference Library

## Purpose

This directory serves as a **living knowledge base** for AI assistants working on DevSteps implementations. It contains concrete code examples, prototypes, and documented lessons from past development efforts.

## For AI Assistants

**When to reference this directory:**
- Before implementing similar functionality
- When encountering architectural decisions
- To understand proven patterns and approaches
- To avoid repeating past mistakes
- To learn from successful implementations

**How to use:**
1. Search for relevant topics before starting new implementations
2. Review code patterns and architectural decisions
3. Apply lessons learned to current task
4. Document new lessons when completing significant work

## Current Lessons

### 📁 view-toggle-extension/

**Topic:** VSCode Extension - TreeView and View Container Implementation

**Problem Solved:** How to create a VSCode extension with custom TreeView that can be toggled between different view containers (sidebar, panel, etc.)

**Key Learnings:**
- VSCode extension activation and lifecycle management
- TreeView and TreeDataProvider implementation patterns
- View container registration and management
- Extension configuration and settings handling
- Workspace integration strategies

**When to Reference:**
- Building VSCode extensions for DevSteps
- Implementing custom TreeViews
- Managing extension state and configuration
- Integrating with VSCode workspace APIs

**Status:** ✅ Prototype - Patterns proven, ready for production implementation

---

## Adding New Lessons

When you complete significant work that could benefit future implementations:

### 1. Create a Lesson Directory

```
LessonsLearned/
  your-lesson-name/
    README.md           # What, why, how
    src/                # Code examples
    docs/               # Additional documentation
    OUTCOME.md          # What worked, what didn't
```

### 2. Document in Main README

Add entry to "Current Lessons" section with:
- **Topic**: Brief description
- **Problem Solved**: What was the original challenge?
- **Key Learnings**: 3-5 bullet points of main insights
- **When to Reference**: Scenarios where this applies
- **Status**: Prototype/Production/Archived/Superseded

### 3. Include Context

Each lesson should contain:
- **Why**: Original problem/requirement
- **What**: Solution approach taken
- **How**: Implementation details and patterns
- **Outcome**: What worked, what didn't, what would you change

## Organization Principles

**Keep, Not Archive:**
- Lessons are **living documentation**, not dead code
- Keep accessible in repository, not buried in git history
- Update when superseded with links to new approaches

**Focus on Patterns:**
- Emphasize architectural decisions over specific code
- Document trade-offs and reasoning
- Include "what didn't work" to save future time

**AI-Friendly:**
- Clear structure for easy discovery
- Concrete examples over abstract theory
- Link to related production code when available

## Maintenance

**Review Quarterly:**
- Mark outdated lessons as "Superseded"
- Link to current implementations
- Archive obsolete approaches with explanation

**Update When:**
- Production implementation differs from prototype
- Better approach discovered
- Technology/framework updates change best practices

---

**Remember:** The goal is to make future AI assistants (and developers) more effective by learning from past work. Document generously, update honestly, keep it accessible.
