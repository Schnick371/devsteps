---
applyTo: "**"
description: "Professional open source project development practices - CI/CD, testing, security, documentation"
---

# Professional Open Source Development Practices

Based on research from 15+ industry sources, these practices define professional OSS project standards.

## CI/CD Pipeline Best Practices

### Pipeline Structure (2025 Standards)
- **Modular Approach**: Break pipeline into build → lint → test → security → deploy stages
- **Parallel Execution**: Run independent jobs concurrently (lint + typecheck, unit + integration tests)
- **Fail Fast**: Place quick checks (lint, typecheck) before expensive operations (tests, build)
- **Cache Aggressively**: Cache node_modules, build outputs between runs

### Pipeline Stages (Required Order)
1. **Install**: `npm ci` with lockfile (not `npm install`)
2. **Lint**: `npm run lint` (Biome check)
3. **Type Check**: `npm run typecheck` (tsc --noEmit)
4. **Unit Tests**: `npm test` (Vitest)
5. **Integration Tests**: `npm run test:cli` (BATS)
6. **Build**: `npm run build`
7. **Security Scan**: `npm audit`, Dependabot alerts
8. **Package**: Only on release branches

### GitHub Actions Best Practices
- Use `actions/checkout@v4`, `actions/setup-node@v4` (latest versions)
- Pin action versions with SHA for security-critical workflows
- Use matrix builds for Node.js version compatibility testing
- Enable Dependabot for action updates

## Testing Strategy (Test Pyramid)

### Test Types & Coverage Goals
```
     /\      E2E Tests (Playwright) - 5-10%
    /  \     - Full user flows, critical paths only
   /    \    - Expensive, run on merge/release
  /------\
 /  Integ  \ Integration Tests (BATS/Node) - 20-30%
/   Tests   \ - CLI commands, MCP tool calls
/------------\ - API contract verification
/    Unit     \ Unit Tests (Vitest) - 60-70%
/    Tests     \ - Pure functions, isolated logic
/________________\ - Fast, run on every commit
```

### Vitest Best Practices (2025)
- Use `describe`/`it` blocks for organization
- Co-locate tests with source: `file.ts` → `file.test.ts`
- Mock external dependencies, not internal modules
- Use `vi.mock()` for module mocking, `vi.spyOn()` for method spying
- Enable coverage with `--coverage` flag (v8 provider)
- Target 80%+ coverage for critical modules

### Test Naming Conventions
```typescript
describe('ModuleName', () => {
  describe('methodName', () => {
    it('should return X when given Y', () => { ... });
    it('should throw error when Z is invalid', () => { ... });
  });
});
```

### Flaky Test Management
- Identify flaky tests with retry tracking
- Fix root cause (race conditions, timing, external deps)
- Quarantine persistent flakes until fixed
- Never disable tests without documented issue

## Debugging Practices

### TypeScript Debugging Setup
```json
// .vscode/launch.json
{
  "configurations": [{
    "type": "node",
    "request": "launch",
    "name": "Debug Current File",
    "program": "${file}",
    "preLaunchTask": "tsc: build",
    "outFiles": ["${workspaceFolder}/dist/**/*.js"],
    "sourceMaps": true
  }]
}
```

### Source Maps (CRITICAL)
- Enable `"sourceMap": true` in tsconfig.json for all packages
- Debug original TypeScript, not transpiled JavaScript
- Use `node --inspect dist/index.js` for runtime debugging

### Error Handling Architecture
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

// Use centralized error handler
export const errorHandler = (err: Error) => {
  if (err instanceof AppError && err.isOperational) {
    logger.warn({ err }, 'Operational error');
    return; // Handled gracefully
  }
  logger.error({ err }, 'Unexpected error');
  // Alert, metrics, potential restart
};
```

### Logging Best Practices (Node.js)
- Use structured logging (JSON format) with Pino or Winston
- Include correlation IDs for request tracing
- Log levels: error → warn → info → debug
- Never log sensitive data (passwords, tokens, PII)
- Write to stdout only (let infrastructure handle routing)

## Code Quality & Static Analysis

### Biome Configuration (2025 Standard)
Biome is 10-25x faster than ESLint + Prettier and provides both linting and formatting.

```json
// biome.json (project already configured)
{
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab"
  }
}
```

### Pre-Commit Hooks (Husky + lint-staged)
```bash
# .husky/pre-commit
npx lint-staged

# .lintstagedrc
{
  "*.{ts,tsx,js,jsx}": ["biome check --write"],
  "*.md": ["prettier --write"]
}
```

### TypeScript Strict Mode
- Enable `strict: true` in tsconfig.json
- Avoid `any` - use `unknown` and type guards
- Use explicit return types for public APIs
- Enable `noImplicitReturns`, `noFallthroughCasesInSwitch`

## Security Practices (DevSecOps)

### Dependency Security
- **npm audit**: Run on every CI build, fail on high/critical
- **Dependabot**: Enable for security updates (auto-PRs)
- **Lockfile**: Always commit `package-lock.json`
- **Minimal deps**: Audit before adding new packages

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

### SAST (Static Application Security Testing)
- Use CodeQL for JavaScript/TypeScript scanning
- Enable GitHub Advanced Security if available
- Scan for common vulnerabilities (injection, XSS, secrets)

### Secrets Management
- Never commit secrets (use `.env` files, git-ignored)
- Use environment variables for configuration
- Scan commits with GitGuardian or gitleaks
- Rotate exposed credentials immediately

### Security Headers & Best Practices
- Validate all user input
- Use parameterized queries (prevent injection)
- Implement rate limiting
- Keep dependencies updated

## Documentation Standards

### README.md Requirements
1. **Title & Description**: Clear project name and purpose
2. **Badges**: Build status, npm version, license
3. **Quick Start**: Installation in <5 steps
4. **Features**: Scannable bullet list
5. **Usage Examples**: Working code snippets
6. **Contributing**: Link to CONTRIBUTING.md
7. **License**: Clearly stated

### CONTRIBUTING.md Requirements
- Development setup instructions
- Code style guidelines (link to Biome config)
- Pull request process
- Commit message format (Conventional Commits)
- Testing requirements
- Issue/bug report template

### CHANGELOG.md (Keep a Changelog)
```markdown
# Changelog

## [Unreleased]
### Added
### Changed
### Fixed
### Removed

## [1.0.0] - 2026-02-01
### Added
- Initial release
```

### Code Documentation
- JSDoc for public APIs
- README in each package explaining purpose
- Architecture Decision Records (ADR) for major decisions
- Inline comments for "why" not "what"

## Conventional Commits (Mandatory)

### Format
```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types
| Type | Description | SemVer |
|------|-------------|--------|
| `feat` | New feature | MINOR |
| `fix` | Bug fix | PATCH |
| `docs` | Documentation only | - |
| `style` | Formatting, no code change | - |
| `refactor` | Code restructure, no behavior change | - |
| `perf` | Performance improvement | PATCH |
| `test` | Adding/updating tests | - |
| `chore` | Build, CI, tooling | - |
| `build` | Build system, dependencies | - |

### Examples
```
feat(cli): add export command for JSON output
fix(mcp-server): resolve memory leak in item cache
docs(readme): update installation instructions
refactor(shared): extract validation utilities
build(deps): bump vitest to 3.0.0

feat(api)!: change response format for items
BREAKING CHANGE: Items now return `eisenhower` instead of `priority`
```

### Enforcement
- Use commitlint with @commitlint/config-conventional
- Pre-commit hook validates message format
- CI blocks non-conforming commits

## Monorepo Best Practices

### Turborepo Pipeline
```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "typecheck": {}
  }
}
```

### Package Dependencies
- Shared types in `packages/shared`
- Use workspace protocol: `"@devsteps/shared": "workspace:*"`
- Avoid circular dependencies
- Keep package boundaries clear

## Performance Monitoring

### Build Performance
- Monitor CI pipeline duration
- Cache dependencies and build outputs
- Parallelize where possible
- Set time budgets for build steps

### Runtime Metrics (MCP Server)
- Request latency (p50, p95, p99)
- Error rates
- Memory usage
- Active connections

---

## Quick Reference: New Feature Checklist

- [ ] Create work item (Story/Task)
- [ ] Write tests first (TDD recommended)
- [ ] Implement feature
- [ ] Run lint: `npm run lint`
- [ ] Run typecheck: `npm run typecheck`
- [ ] Run tests: `npm test`
- [ ] Update documentation
- [ ] Conventional commit message
- [ ] PR with description linking work item

---

**Sources**: Node.js Best Practices (goldbergyoni), Conventional Commits, Vitest docs, Biome docs, GitHub Actions docs, OWASP DevSecOps, Evil Martians CI/CD Guide, Linux Foundation OSS Hosting Best Practices
