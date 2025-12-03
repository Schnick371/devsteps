# Change Log

All notable changes to the "DevSteps" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.11] - 2025-12-03

### Changed
- Updated to use `@schnick371/devsteps-shared@0.6.11`
- No functional changes to VS Code extension

### Note
- CLI now uses bundled distribution for improved global installation

## [0.6.6] - 2025-12-03

### Fixed
- Package build and VSIX generation validation

### Changed
- Updated to use `@schnick371/devsteps-shared@0.6.6`

## [0.6.3] - 2025-12-03

### Breaking Changes ⚠️
- **REMOVED**: `affects`/`affected-by` from TreeView (STORY-053, TASK-123)
  - Relationship type no longer available in UI
  - Use `relates-to` or `blocks` for Bug relationships

### Changed
- Updated to use `@schnick371/devsteps-shared@0.6.3`
- TreeView reflects new hierarchy validation rules

## [0.6.2] - 2025-12-02

### Added
- **TreeView relationship toggles**: New visibility controls for `relates-to` and `affects` relationships (TASK-043)
  - `relates-to` toggle in 'View & Sort' submenu (horizontal connections)
  - `affects` relationships always visible (critical impact information)
  - Semantically meaningful toggle icons (`link-external`, `shield`)
  - Proper toggle pattern with `enablement: false` for active state

### Changed
- **Toolbar reorganization**: Simplified UI for better usability
  - Removed `hideAffects` toggle (affects always visible)
  - Moved `hideRelatesTo` from toolbar to 'View & Sort' submenu
  - Cleaner navigation with only essential `hideDone` toggle in toolbar
- Updated `@schnick371/devsteps-shared` to 0.6.2 with flexible Bug relationships

## [0.6.1] - 2025-12-02

### Fixed
- **Bug validation rules**: Fixed hierarchy relationship validation
  - Task can now implement Bug (Task = solution for Bug defect)
  - Bug only implements Epic/Requirement (proper traceability to business initiative)
  - Updated validation prevents incorrect `Bug relates-to Epic` relationships
  - Ensures consistent parent-child status when linking items

### Changed
- Updated `@schnick371/devsteps-shared` to 0.6.1 with corrected validation logic

## [0.6.0] - 2025-11-23

### Added
- **NPX Zero-Configuration Architecture**: MCP server runs via `npx` (no manual install needed)
- **Automatic MCP Registration**: Extension auto-registers MCP server with Claude Desktop
- **Welcome Screen**: Interactive first-run experience with model recommendations
  - Claude Sonnet 4+ recommended for optimal DevSteps experience
  - Automatic reload after MCP initialization
- **Smooth TreeView Initialization**: No window reload required after setup
- **Production Deployment**: Published to VS Code Marketplace

### Fixed
- **MCP Server Stability**: Global unhandled rejection handler prevents crashes
- **Workspace Path Handling**: Passed as CLI argument (standard MCP pattern)
- **Extension Bundling**: Fixed CommonJS/ESM compatibility issues
- **FileSystemWatcher**: Created after validation checks (prevents early return issues)
- **Commander Package**: Resolved deployment error in bundled extension

### Changed
- **Architecture**: Migrated from manual install to NPX-based MCP server
- **MCP Server Package**: Published to npm as `@schnick371/devsteps-mcp-server@0.6.0`
- **CLI Package**: Published to npm as `@schnick371/devsteps-cli@0.6.0`
- **Shared Package**: Published to npm as `@schnick371/devsteps-shared@0.6.0`
- **Minimum VS Code**: 1.99.0 (for MCP API support)

### Performance
- MCP server starts reliably even without existing `.devsteps` directory
- Extension activation < 100ms

## [0.4.0] - 2025-11-23

## [Unreleased]

### Fixed
- **Minimum VS Code version**: Corrected from 1.95.0 to 1.99.0 (BUG-014)
  - VS Code 1.99.0 (March 2025) required for MCP API support
  - `registerMcpServerDefinitionProvider` API introduced in 1.99
  - Previous versions (1.95-1.98) lack MCP auto-registration capability

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
