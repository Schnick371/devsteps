---
applyTo: "turbo.json,packages/*/package.json"
description: "Turborepo monorepo best practices for DevSteps"
---

# Turborepo Monorepo Best Practices

## Core Principles

Turborepo optimizes JavaScript/TypeScript monorepos through intelligent caching, parallel execution, and dependency-aware task orchestration.

### DevSteps Monorepo Structure

```
devsteps/
├── turbo.json              # Turborepo configuration
├── package.json            # Root workspace configuration
├── packages/
│   ├── shared/             # Shared types, schemas, utilities
│   ├── mcp-server/         # MCP Protocol Handler
│   ├── cli/                # Command-line Interface
│   └── extension/          # VS Code Extension
└── apps/                   # (Future) End-user applications
```

## turbo.json Configuration

### Task Pipeline

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"],
      "env": ["NODE_ENV"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "env": ["CI"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### Understanding `dependsOn`

```json
// ^build = Build all dependencies first (topological)
"build": {
  "dependsOn": ["^build"]
}

// Runs after build in SAME package
"test": {
  "dependsOn": ["build"]
}

// Explicit cross-package dependency
"@devsteps/cli#build": {
  "dependsOn": ["@devsteps/shared#build"]
}
```

## Package Configuration

### Root package.json

```json
{
  "name": "devsteps",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean && rm -rf node_modules",
    "format": "biome format --write ."
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "@biomejs/biome": "^1.9.0",
    "typescript": "^5.7.0"
  },
  "packageManager": "npm@10.9.0"
}
```

### Package package.json

```json
{
  "name": "@devsteps/shared",
  "version": "0.5.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "typecheck": "tsc --noEmit",
    "lint": "biome lint .",
    "clean": "rm -rf dist .turbo"
  },
  "devDependencies": {
    "typescript": "^5.7.0"
  }
}
```

## Caching Best Practices

### Content-Based Hashing

Turborepo uses file content, not timestamps:

```bash
# First build - cache miss
$ turbo build
Tasks: 4 successful, 4 total
Cached: 0 cached, 4 total
Time: 15.2s

# Second build (no changes) - full cache hit
$ turbo build
Tasks: 4 successful, 4 total
Cached: 4 cached, 4 total
Time: 185ms >>> FULL TURBO
```

### Environment Variables

```json
{
  "tasks": {
    "build": {
      "env": ["NODE_ENV", "API_URL"],
      "passThroughEnv": ["HOME", "PATH"]
    }
  },
  "globalEnv": ["CI", "GITHUB_ACTIONS"]
}
```

**Rules:**
- `env`: Variables that affect build output (cache key)
- `passThroughEnv`: Variables passed through but don't affect cache
- `globalEnv`: Variables affecting ALL tasks

### Outputs Configuration

```json
{
  "build": {
    "outputs": [
      "dist/**",           // Include dist folder
      "!dist/**/*.map",    // Exclude source maps from cache
      ".next/**",          // Next.js output
      "!.next/cache/**"    // Exclude Next.js cache
    ]
  }
}
```

## Filtering Packages

### Common Filter Patterns

```bash
# Build only CLI
turbo build --filter=@devsteps/cli

# Build CLI and all its dependencies
turbo build --filter=@devsteps/cli...

# Build all dependents of shared (packages that use it)
turbo build --filter=...@devsteps/shared

# Build changed packages since main
turbo build --filter='[origin/main...HEAD]'

# Build only affected packages
turbo build --filter='...[origin/main...HEAD]'
```

### CI Optimization

```yaml
# .github/workflows/ci.yml
- name: Build affected packages
  run: turbo build --filter='...[origin/${{ github.base_ref }}...HEAD]'
```

## TypeScript Configuration

### Shared Base Config

```json
// packages/tsconfig/base.json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### Package Config

```json
// packages/shared/tsconfig.json
{
  "extends": "../tsconfig/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "module": "commonjs",
    "target": "ES2022"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Avoid Project References

Turborepo handles dependencies - don't use TypeScript Project References:

```json
// ❌ BAD - Adds complexity, conflicts with Turborepo caching
{
  "references": [
    { "path": "../shared" }
  ]
}

// ✅ GOOD - Let Turborepo manage build order
{
  "extends": "../tsconfig/base.json",
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

## Debugging Cache Issues

### Dry Run Analysis

```bash
# See what would run without executing
turbo build --dry-run

# JSON output for scripts
turbo build --dry-run=json
```

### Cache Debugging

```bash
# Force cache miss (rebuild everything)
turbo build --force

# See cache status
turbo build --summarize

# Debug why cache missed
turbo build --verbosity=2
```

### Common Cache Miss Causes

| Cause | Solution |
|-------|----------|
| Environment variable changed | Add to `env` in turbo.json |
| Dependency updated | Expected - rebuild needed |
| Output files modified | Check `outputs` configuration |
| Global files changed | Review `globalDependencies` |

## Remote Caching

### Setup with Vercel

```bash
# Link to Vercel for remote caching
npx turbo login
npx turbo link
```

### Self-Hosted Cache

```bash
# Use custom remote cache
TURBO_API=https://cache.example.com \
TURBO_TOKEN=your-token \
TURBO_TEAM=your-team \
turbo build
```

## CI/CD Integration

### GitHub Actions

```yaml
name: CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2  # Need history for affected detection

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: turbo build --filter='...[HEAD^1]'

      - name: Test
        run: turbo test --filter='...[HEAD^1]'

      - name: Lint
        run: turbo lint --filter='...[HEAD^1]'
```

### Cache Optimization

```yaml
- uses: actions/cache@v4
  with:
    path: |
      node_modules
      packages/*/dist
      .turbo
    key: turbo-${{ runner.os }}-${{ hashFiles('package-lock.json', 'turbo.json') }}
    restore-keys: |
      turbo-${{ runner.os }}-
```

## Package Dependencies

### Internal Dependencies

```json
// packages/cli/package.json
{
  "dependencies": {
    "@devsteps/shared": "*"  // Workspace reference
  }
}
```

### Version Synchronization

Use same versions across packages:

```json
// Root package.json
{
  "devDependencies": {
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  }
}

// Each package inherits via npm/pnpm workspaces
```

## Common Patterns

### Shared UI Components

```
packages/
└── ui/
    ├── package.json
    └── src/
        ├── Button.tsx
        ├── Input.tsx
        └── index.ts  # Re-exports all components
```

### Shared Configuration

```
packages/
├── tsconfig/
│   ├── base.json
│   ├── node.json
│   └── react.json
├── biome-config/
│   └── biome.json
└── vitest-config/
    └── vitest.config.ts
```

## Prohibited Practices

**NEVER:**
- Put tsconfig.json in workspace root (for packages)
- Use TypeScript Project References with Turborepo
- Commit `.turbo` directory to git
- Use timestamps in cache keys

**ALWAYS:**
- Use `^build` for cross-package dependencies
- Configure `outputs` for cacheable tasks
- Use content-based hashing (default)
- Run `turbo build` before testing

---

**See:** [Turborepo Docs](https://turbo.build/repo/docs), [TypeScript Guide](https://turbo.build/repo/docs/guides/tools/typescript)
