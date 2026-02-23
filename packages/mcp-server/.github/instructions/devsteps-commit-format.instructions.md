---
applyTo: "**"
description: "Conventional Commits format specification for DevSteps"
---

# Conventional Commits Standard

## Format (MANDATORY)

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

**Footer REQUIRED for DevSteps work items:**
```
Implements: <ID>
```

## Commit Types

| Type | Description | SemVer Bump |
|------|-------------|-------------|
| `feat` | New feature | MINOR |
| `fix` | Bug fix | PATCH |
| `docs` | Documentation only | - |
| `style` | Formatting, no code change | - |
| `refactor` | Code restructure, no behavior change | - |
| `perf` | Performance improvement | PATCH |
| `test` | Adding/updating tests | - |
| `chore` | Build, CI, tooling | - |
| `build` | Build system, dependencies | - |

## Breaking Changes

**Syntax:**
- Add `!` after type/scope: `feat(api)!: change response format`
- Include `BREAKING CHANGE:` footer with description

**Example:**
```bash
feat(api)!: change response format for items

BREAKING CHANGE: Items now return `eisenhower` instead of `priority`

Implements: STORY-042
```

## Scope Guidelines

**Common scopes:**
- `cli` - Command-line interface
- `mcp-server` - MCP server package
- `shared` - Shared package
- `extension` - VS Code extension
- `api` - API changes
- `deps` - Dependency updates

## Examples

**Feature with scope:**
```bash
feat(cli): add export command for JSON output

Implements: STORY-042
```

**Bug fix:**
```bash
fix(mcp-server): resolve memory leak in item cache

Implements: BUG-023
```

**Dependency update:**
```bash
build(deps): bump vitest to 3.0.0
```

**Documentation:**
```bash
docs(readme): update installation instructions
```

## Enforcement

**commitlint:** Validates commit message format
**Husky:** Runs commitlint on pre-commit hook
**semantic-release:** Automates versioning from commits

---

**Branch management details:** See [REGISTRY.md](../agents/REGISTRY.md)
