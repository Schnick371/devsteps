---
applyTo: "**/*.{json,yaml,yml},!**/node_modules/**,!**/dist/**"
description: "Configuration file standards for JSON and YAML files"
---

# Configuration File Standards

## JSON Files

**Formatting:**
- 2-space indentation
- No trailing commas
- Sorted keys where logical
- Comments via package.json "//comment" pattern

## Package.json Standards

**Required fields:**
- name, version, description
- engines specifying Node version
- Scripts with consistent naming
- Workspace dependencies using workspace protocol

**Script naming convention:**
- `build` for compilation
- `dev` for watch mode
- `test` for unit tests
- `lint` for linting
- `format` for formatting

## TypeScript Configuration

**tsconfig.json patterns:**
- Extend base configuration where applicable
- Explicit include/exclude paths
- Strict mode enabled
- Output paths to dist/ directory

**Monorepo structure:**
- tsconfig.json at root for references
- Package-specific configs extend root
- Composite: true for buildable packages

## YAML Files

**Formatting:**
- 2-space indentation
- Explicit typing via tags where needed
- Consistent key ordering
- Comments for complex configurations

## GitHub Workflows

**CI/CD standards:**
- Named jobs with clear purposes
- Cached dependencies for speed
- Matrix strategies for multi-version testing
- Fail-fast: false for comprehensive results

## Environment Variables

**Configuration over code:**
- Use .env.example for documentation
- Never commit secrets
- Validate required variables at startup
- Use type-safe env parsing

## Biome Configuration

**biome.json standards:**
- Consistent formatting rules across workspace
- Linting rules aligned with TypeScript strict mode
- Ignored paths exclude generated code
- Organize imports enabled
