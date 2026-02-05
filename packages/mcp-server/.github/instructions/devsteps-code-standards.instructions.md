---
applyTo: "**/*.{ts,js,tsx,jsx,py,java,cpp,cs,go,rs}"
description: "File size and code quality standards"
---

# Code Quality Standards

## TypeScript Best Practices (2025)

### Strict Mode Requirements
- Enable `strict: true` in tsconfig.json (all packages)
- Avoid `any` - use `unknown` with type guards instead
- Define explicit return types for public APIs
- Use readonly where mutation is not intended

### Type Safety Patterns
```typescript
// ✅ Good: Type guard with unknown
function isError(value: unknown): value is Error {
  return value instanceof Error;
}

// ❌ Bad: Using any
function handleResponse(data: any) { ... }

// ✅ Good: Using unknown with validation
function handleResponse(data: unknown) {
  if (!isValidResponse(data)) throw new AppError('Invalid response');
  // data is now typed
}
```

### Error Handling (Node.js Standard)
```typescript
// Extend built-in Error for custom errors
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
```

- Use async/await with try-catch (not callbacks)
- Distinguish operational errors (expected) from programmer errors (unexpected)
- Centralized error handling middleware
- Log errors with structured JSON format

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
- Use project's linter/formatter settings (Biome)
- Remove dead code (use git for history)

**Biome (2025 Standard):**
- Biome is 10-25x faster than ESLint + Prettier
- Single tool for linting AND formatting
- Run `npm run lint` before every commit
- Fix issues: `npx biome check --write .`

**Error Handling:**
- Add guards for new code paths
- Meaningful error messages with context
- Consider edge cases
- Use structured logging (JSON format)
- Include correlation IDs for request tracing

**Async/Await:**
- Always use async/await (never callback-style)
- Handle promise rejections with try-catch
- Use Promise.all() for parallel operations
- Avoid mixing await with .then()

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

## Testing Standards

### Test Pyramid (Coverage Goals)
- **Unit Tests**: 60-70% - Pure functions, isolated logic (Vitest)
- **Integration Tests**: 20-30% - CLI commands, API calls (BATS)
- **E2E Tests**: 5-10% - Critical user flows only (Playwright)

### Vitest Best Practices
```typescript
describe('ModuleName', () => {
  describe('methodName', () => {
    it('should return X when given Y', () => { ... });
    it('should throw error when Z is invalid', () => { ... });
  });
});
```

- Co-locate tests: `file.ts` → `file.test.ts`
- Mock external dependencies, not internal modules
- Target 80%+ coverage for critical modules
- Run tests before every commit: `npm test`

### Test-Driven Development (TDD)
- Write failing test first
- Implement minimal code to pass
- Refactor while keeping tests green
- Tests document expected behavior

## Debugging Best Practices

### VS Code Debugging
- Enable `"sourceMap": true` in tsconfig.json
- Use F5 to debug TypeScript directly
- Set breakpoints in .ts files (not .js)
- Use `node --inspect` for runtime debugging

### Source Maps (CRITICAL)
```json
// tsconfig.json
{
  "compilerOptions": {
    "sourceMap": true
  }
}
```

## Prohibited Practices

**Never:**
- Create backup files: `.old`, `.bak`, `_neu` (use git!)
- Use `any` type (use `unknown` with type guards)
- Commit with failing tests
- Commit commented-out code
- Ignore TypeScript errors with `// @ts-ignore`

---

**Project Standards:** See `oss-professional-practices.instructions.md` for CI/CD, security, and documentation standards.
