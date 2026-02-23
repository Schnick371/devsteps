---
applyTo: "**/*.sh,**/esbuild.{js,mjs,cjs},scripts/**/*,!**/node_modules/**"
description: "Build scripts and DevOps tooling standards"
---

# Build & DevOps Standards

## Shell Scripts

**Bash script conventions:**
- Shebang `#!/usr/bin/env bash` for portability
- `set -euo pipefail` for safety
- Error handling for all commands
- Meaningful exit codes

**Script organization:**
- Single responsibility per script
- Reusable functions extracted
- Clear parameter documentation
- Idempotent operations

## Build Tools

**esbuild configuration:**
- Bundle size optimization
- Source map generation
- Target platform specification
- External dependencies marked

**Turborepo integration:**
- Cached tasks for performance
- Dependency graph awareness
- Parallel execution where safe
- Pipeline configuration in root

## Package Distribution

**build-distribution.sh:**
- Clean output directories
- Copy only necessary files
- Replace workspace dependencies
- Verify package integrity

## Dependency Management

**Version control:**
- Lock files committed
- Workspace protocol for local deps
- Security audit in CI
- Regular updates scheduled

## CI/CD Pipelines

**GitHub Actions:**
- Matrix testing across Node versions
- Cached dependencies
- Parallel job execution
- Fail-fast disabled for comprehensive results

**Quality gates:**
- Linting must pass
- Type checking must pass
- Tests must pass
- Build must succeed

## Monorepo Scripts

**Root package.json scripts:**
- `build` compiles all packages
- `dev` watches all packages
- `test` runs all test suites
- `clean` removes generated files

**Package-specific scripts:**
- Consistent naming across packages
- Build dependencies as needed
- Independent test runs
- Package-specific dev servers
