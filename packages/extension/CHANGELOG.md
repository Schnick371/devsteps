# Change Log

All notable changes to the "DevSteps" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2025-11-23

### Added

**Dashboard Features:**
- Interactive WebView Dashboard with 5 visualization sections
  - Project Statistics cards (counts by type/status/priority/Eisenhower)
  - Eisenhower Priority Matrix (4-quadrant view with filtering)
  - Sprint Burndown Chart (custom canvas implementation)
  - Traceability Graph (SVG force-directed layout)
  - Activity Timeline (last 20 updates with relative timestamps)
- Dashboard toolbar button in TreeView (📊 icon)
- Info banner when traceability graph is limited (large projects)

**TreeView Enhancements:**
- Advanced filtering by status, priority, type, tags
- Multi-field sorting (status, priority, updated, title, type, ID)
- Color-coded status badges via FileDecorationProvider
  - Draft: Gray (#858585)
  - In-Progress: Blue (#1f6feb)
  - Done: Green (#26a641)
  - Blocked: Red (#f85149)
- Dual-mode display (flat/hierarchical)
- Toolbar actions for view mode switching

**Performance Optimizations:**
- Dashboard single-load pattern (eliminates 5× redundant `listItems()` calls)
- Traceability graph node limiting (max 50 most-connected items)
- Load time improvements:
  - 1K items: ~500ms → ~100ms (5× faster)
  - 10K items: ~5-10s → ~1-2s (5-10× faster)
  - Graph rendering: Unusable → <500ms for 1K items

**Technical:**
- Context menu actions (update status, open file, show details)
- Command registration system with 10+ commands
- CSP-compliant WebView security
- VS Code theme integration (light/dark/high-contrast)

### Fixed
- Extension module error (switched to CommonJS output `.cjs`)
- Node.js 22 compatibility (updated launch.json from `--loader` to `--import tsx/esm`)
- VSIX packaging size (15642 files → 9 files via .vscodeignore improvements)

### Changed
- Minimum VS Code version: 1.95.0
- Extension bundle size: 321KB (optimized via esbuild)
- License: Apache-2.0

### Performance
- Dashboard load: <500ms for 1K items, <2s for 10K items
- Memory usage: <50MB for 10K items (within VS Code guidelines)
- Bundle size: 321KB extension + 137KB packaged

## [0.3.0] - 2025-11-23 (Internal)

### Added
- MCP Server Manager for AI integration
- Automatic startup and configuration
- MCP architecture research completed (SPIKE-001)

### Changed
- Migrated to Model Context Protocol (MCP) for AI communication

## [0.2.0] - 2025-11-23 (Internal)

### Added
- Basic TreeView for work items
- Command registration system
- Activity bar integration

### Changed
- Extension scaffolding and activation events

## [0.1.0] - 2025-11-23 (Internal)

### Added
- Initial extension setup
- Basic project structure
- TypeScript configuration
- esbuild bundling

---

## Legend

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Vulnerability fixes
- **Performance**: Performance improvements

---

[0.4.0]: https://github.com/Schnick371/devsteps/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/Schnick371/devsteps/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/Schnick371/devsteps/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Schnick371/devsteps/releases/tag/v0.1.0
