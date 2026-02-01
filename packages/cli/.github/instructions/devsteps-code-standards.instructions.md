---
applyTo: "**/*.{ts,js,tsx,jsx,py,java,cpp,cs,go,rs}"
description: "File size and code quality standards"
---

# Code Quality Standards

## File Size Guidelines

### File Size Guidelines
- Keep files focused on single responsibility
- Refactor when complexity or size hinders understanding
- Large files signal multiple responsibilities requiring separation
- Prioritize readability and maintainability over line count rules

#### Maximum Lines Per File
- **Components/Services**: 200-300 lines
- **Complex Modules**: 350 lines (acceptable limit)
- **300+ lines**: Consider refactoring
- **500+ lines**: Must be split

### Refactoring Signals
- Multiple responsibilities in one file
- Difficult to understand or test
- High cyclomatic complexity
- Repeated patterns across file

### Refactoring Approach
- Extract to separate modules
- Create utility functions for reuse
- Split components into sub-components
- Use composition over inheritance

## Code Quality

**Style:**
- Follow existing project conventions
- Maintain readability over cleverness
- Use project's linter/formatter settings
- Remove dead code (use git for history)

**Error Handling:**
- Add guards for new code paths
- Meaningful error messages
- Consider edge cases
- Log appropriately for your stack

## Code Documentation

### When to Add Comments
- Document "why" not "what"
- Explain complex algorithms or business logic
- Document non-obvious decisions
- Warn about edge cases or gotchas
- Each file should have a brief header comment describing its purpose
- Each function/method should have a comment describing its purpose

### What NOT to Comment
- Self-explanatory code
- Redundant descriptions
- Outdated information
- Commented-out code (remove it)

## Prohibited Practices

**Never:**
- Create backup files: `.old`, `.bak`, `_neu` (use git!)

---

**Project Standards:** See project-specific `.instructions.md` files for tech stack conventions.
