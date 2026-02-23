---
applyTo: "**/*.{ts,tsx,js,jsx,mjs,cjs}"
description: "TypeScript and JavaScript implementation standards for DevSteps monorepo"
---

# TypeScript & JavaScript Implementation Standards

## Framework Conventions

**Follow framework-first approach:**
- NestJS conventions for backend services
- Next.js conventions for frontend applications
- Follow official documentation over custom patterns

## Module System

**ESM by default:**
- Use `import`/`export` syntax
- Avoid CommonJS unless required by tooling
- Configure package.json with `"type": "module"` where applicable

## Type Safety

**Strict TypeScript configuration:**
- Never use `any` - prefer `unknown` with type guards
- Define explicit return types for public APIs
- Use `readonly` for immutable data
- Leverage discriminated unions for state management

## Error Handling

**Node.js standard patterns:**
- Extend built-in Error for custom errors
- Include error codes and operational flags
- Use async/await with try-catch blocks
- Centralize error handling in services

## Import Organization

**Consistent import order:**
- Framework/library imports first
- Shared package imports second
- Relative imports last
- Group by blank lines

## Naming Conventions

**Consistent across packages:**
- PascalCase for types, interfaces, classes, components
- camelCase for functions, variables, methods
- UPPER_SNAKE_CASE for constants
- Prefix interfaces with descriptive names (not `I`)

## Code Organization

**Single responsibility principle:**
- One concern per file
- Extract utilities and helpers
- Prefer composition over inheritance
- Keep functions focused and testable

## Monorepo Patterns

**Shared package usage:**
- Import types from `@devsteps/shared`
- Reuse schemas and validators
- Avoid duplicating core logic
- Maintain single source of truth

## Dependency Management

**Strict version control:**
- Lock file committed to repository
- Use workspace protocol for local dependencies
- Minimize external dependencies
- Audit regularly for vulnerabilities
