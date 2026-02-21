---
applyTo: "**/*.{ts,js,tsx,jsx,py,java,cpp,cs,go,rs}"
description: "File size and code quality standards"
---

# Code Quality Standards

## Core Principles

**No Examples**: No code snippets - trust AI to apply principles from training
**Trust the Model**: Provide goals, not recipes - let AI determine optimal approach

## File Length Limits

### Source Code Files
- **Target**: 200-400 lines per file
- **Hard limit**: 400 lines - split if exceeded
- **Functions**: 10-20 lines ideal, 75 lines maximum
- **Single responsibility** - one concern per file
- Split when difficult to understand, test, or name clearly

### Copilot Instruction Files
- **Maximum**: 100-150 lines per file (token budget limit)
- **All instructions combined**: Under 200 lines total
- **Reason**: Shares token budget with code + conversation + workspace
- **Keep hyper-focused** - start and end prioritized, middle ignored

## TypeScript Best Practices

### Type Safety
- Enable strict mode in tsconfig.json
- Avoid `any` type - use `unknown` with type guards
- Define explicit return types for public APIs
- Use `readonly` for immutable data
- Leverage discriminated unions for state management

### Error Handling
- Extend built-in Error for custom error types
- Include error codes and operational flags
- Use async/await with try-catch blocks
- Distinguish operational (expected) from programmer (bugs) errors
- Centralize error handling in middleware/services
- Log errors with structured JSON format
- Include correlation IDs for request tracing

## Code Quality Principles

### Style Consistency
- Follow existing project conventions over personal preferences
- Prioritize readability and maintainability over cleverness
- Use project's configured linter and formatter (Biome)
- Remove dead code completely - rely on git for history

### Biome Tooling (2025 Standard)
- Single tool for linting AND formatting (10-25× faster than ESLint + Prettier)
- Run before every commit
- Auto-fix issues where safe
- Enforces consistent code style across team

### Async/Await Patterns
- Prefer async/await over callbacks or promise chains
- Handle all promise rejections explicitly
- Use Promise.all() for parallel independent operations
- Avoid mixing await with .then() chains

## Code Documentation Principles

### When Documentation Adds Value
- Explain **why** decisions were made (not what the code does)
- Document complex algorithms or business logic
- Clarify non-obvious design choices
- Warn about edge cases or gotchas
- Provide file-level purpose overview
- Describe function/method responsibilities

### When to Avoid Documentation
- Self-explanatory code that speaks for itself
- Redundant descriptions that restate code
- Outdated comments that create confusion
- Commented-out code (delete it, use git)

## Testing Strategy

### Test Pyramid Distribution
- **Unit Tests (60-70%)**: Pure functions, isolated logic - Vitest
- **Integration Tests (20-30%)**: CLI commands, API interactions - BATS
- **E2E Tests (5-10%)**: Critical user flows only - Playwright

### Testing Principles
- Co-locate tests with implementation files
- Mock external dependencies, not internal modules
- Target 80%+ coverage for critical business logic
- Run full test suite before every commit
- Tests should document expected behavior

### Test-Driven Development (TDD)
- Write failing test first (red)
- Implement minimal code to pass (green)
- Refactor while maintaining green tests
- Use tests as living documentation

## Debugging Practices

### VS Code Integration
- Enable source maps in TypeScript configuration
- Debug TypeScript directly (not compiled JavaScript)
- Set breakpoints in source files
- Use integrated debugger over console logs

### Source Map Configuration
- Essential for TypeScript debugging
- Maps compiled code back to source
- Enables breakpoint debugging in IDE
- Required for production error tracking

## Prohibited Practices

**Never commit:**
- Backup files with extensions like `.old`, `.bak`, `_neu` - use git branches
- Code using `any` type - prefer `unknown` with proper type guards
- Failing tests or broken builds
- Commented-out code - delete it, git preserves history
- TypeScript errors suppressed with `// @ts-ignore` without justification

---

**Related Standards:**
- TypeScript implementation: `devsteps-typescript-implementation.instructions.md`
- Testing details: `devsteps-testing.instructions.md`
- Documentation: `devsteps-documentation.instructions.md`
