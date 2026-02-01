---
applyTo: "package.json,CHANGELOG.md,.releaserc.*"
description: "Semantic versioning and automated release management"
---

# Release Management & Changelog Best Practices

## Semantic Versioning (SemVer)

DevSteps follows [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH

1.0.0 → 1.0.1  (PATCH: bug fix)
1.0.1 → 1.1.0  (MINOR: new feature, backward compatible)
1.1.0 → 2.0.0  (MAJOR: breaking change)
```

### When to Bump

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Bug fix | PATCH | Fix memory leak in MCP server |
| New feature (backward compatible) | MINOR | Add `devsteps trace` command |
| Breaking API change | MAJOR | Change response format |
| Performance improvement | PATCH | Optimize item loading |
| Deprecation notice | MINOR | Mark old API as deprecated |
| Security fix | PATCH | Fix path traversal vulnerability |

## Conventional Commits → Version Bumps

Semantic-release automatically determines version from commits:

| Commit Type | Version Bump |
|-------------|--------------|
| `fix:` | PATCH |
| `feat:` | MINOR |
| `feat!:` or `BREAKING CHANGE:` | MAJOR |
| `perf:` | PATCH |
| `docs:`, `style:`, `refactor:`, `test:`, `chore:` | No release |

## Keep a Changelog

Follow [Keep a Changelog](https://keepachangelog.com/) principles:

### Guiding Principles

1. **Changelogs are for humans, not machines**
2. There should be an entry for every version
3. Same types of changes should be grouped
4. Versions and sections should be linkable
5. Latest version comes first
6. Release date of each version is displayed

### Change Categories

```markdown
## [Unreleased]

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Now removed features

### Fixed
- Bug fixes

### Security
- Vulnerability fixes
```

### Example CHANGELOG.md

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New `devsteps trace` command for dependency visualization
- Support for custom work item types

### Fixed
- Memory leak when processing large item lists

## [0.5.0] - 2025-01-15

### Added
- VS Code extension with TreeView panel
- MCP server HTTP transport support

### Changed
- Improved CLI error messages with suggestions

### Fixed
- Path traversal vulnerability in file operations

## [0.4.0] - 2024-12-01

### Added
- Initial MCP server implementation
- CLI commands for item management

[Unreleased]: https://github.com/user/devsteps/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/user/devsteps/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/user/devsteps/releases/tag/v0.4.0
```

## Automated Releases with semantic-release

### Configuration

```json
// .releaserc.json
{
  "branches": ["main"],
  "plugins": [
    ["@semantic-release/commit-analyzer", {
      "preset": "conventionalcommits",
      "releaseRules": [
        { "type": "feat", "release": "minor" },
        { "type": "fix", "release": "patch" },
        { "type": "perf", "release": "patch" },
        { "type": "revert", "release": "patch" },
        { "breaking": true, "release": "major" }
      ]
    }],
    ["@semantic-release/release-notes-generator", {
      "preset": "conventionalcommits",
      "presetConfig": {
        "types": [
          { "type": "feat", "section": "Features" },
          { "type": "fix", "section": "Bug Fixes" },
          { "type": "perf", "section": "Performance" },
          { "type": "revert", "section": "Reverts" },
          { "type": "docs", "section": "Documentation", "hidden": true },
          { "type": "chore", "section": "Maintenance", "hidden": true }
        ]
      }
    }],
    ["@semantic-release/changelog", {
      "changelogFile": "CHANGELOG.md"
    }],
    ["@semantic-release/npm", {
      "npmPublish": false
    }],
    ["@semantic-release/git", {
      "assets": ["CHANGELOG.md", "package.json", "package-lock.json"],
      "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }],
    "@semantic-release/github"
  ]
}
```

### GitHub Actions Workflow

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]

permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - run: npm ci
      - run: npm run build
      - run: npm test

      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: npx semantic-release
```

## GitHub Release Notes

### Auto-Generated Release Notes

Configure `.github/release.yml`:

```yaml
# .github/release.yml
changelog:
  exclude:
    labels:
      - ignore-for-release
      - dependencies
    authors:
      - dependabot
      - dependabot[bot]
  categories:
    - title: 🚀 Features
      labels:
        - enhancement
        - feature
    - title: 🐛 Bug Fixes
      labels:
        - bug
        - fix
    - title: 📚 Documentation
      labels:
        - documentation
    - title: 🧹 Maintenance
      labels:
        - chore
        - maintenance
    - title: 🔒 Security
      labels:
        - security
    - title: Other Changes
      labels:
        - "*"
```

## Pre-Release Versions

### Alpha/Beta/RC

```
1.0.0-alpha.1  # Early development
1.0.0-beta.1   # Feature complete, testing
1.0.0-rc.1     # Release candidate
1.0.0          # Stable release
```

### semantic-release Branch Config

```json
{
  "branches": [
    "main",
    { "name": "next", "prerelease": true },
    { "name": "beta", "prerelease": true },
    { "name": "alpha", "prerelease": true }
  ]
}
```

## Monorepo Releases

### Independent Versioning

Each package has its own version:

```
packages/
├── shared/      # v0.5.0
├── mcp-server/  # v0.4.2
├── cli/         # v0.5.1
└── extension/   # v0.3.0
```

### Synchronized Versioning

All packages share version:

```json
// Root package.json
{
  "version": "0.5.0",
  "workspaces": ["packages/*"]
}
```

## Release Checklist

Before releasing:

- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] CHANGELOG.md updated with [Unreleased] changes
- [ ] Documentation updated for new features
- [ ] Breaking changes documented
- [ ] Security advisory filed (if security fix)

After releasing:

- [ ] Verify GitHub Release created
- [ ] Verify npm packages published (if applicable)
- [ ] Update related issues/PRs
- [ ] Announce in community channels

## Prohibited Practices

**NEVER:**
- Manually edit version numbers (let semantic-release handle it)
- Skip changelog updates for user-facing changes
- Release without running full test suite
- Use commit log diffs as changelog
- Release breaking changes without major version bump

**ALWAYS:**
- Use Conventional Commits for all changes
- Document breaking changes clearly
- Include migration guides for major versions
- Tag releases in git

---

**See:** [SemVer](https://semver.org/), [Keep a Changelog](https://keepachangelog.com/), [semantic-release](https://semantic-release.gitbook.io/)
