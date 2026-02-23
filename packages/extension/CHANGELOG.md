# Change Log

All notable changes to the "DevSteps" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - Pre-Release

### Added
- Getting Started walkthrough (`contributes.walkthroughs`) — accessible via Activity Bar → DevSteps
- `publish:next` script in extension `package.json` for CLI-based pre-release publishing

### Fixed
- `isPreRelease()` now correctly detects patch-level pre-releases (1.0.1 with odd patch)
  — previously only detected odd minor versions (1.1.x), so 1.0.1 was incorrectly treated as stable
- Pre-release auto-uses `@schnick371/devsteps-mcp-server@next` as intended

### Changed
- Extension README rewritten — removes stale 0.7.0-next.4 content, updated for 1.0.0/1.0.1
- Pre-release publishing moved to `vsce publish --pre-release` (no manual UI upload needed)
  — Key finding: there is NO `"preRelease": true` field in package.json; the only mechanism is the vsce CLI flag

## [1.0.0] - 2026-02-21

### Added
- Context Budget Protocol (CBP) infrastructure: MCP server now exposes `write_analysis_report`, `read_analysis_envelope`, `write_verdict`, and `write_sprint_brief` tools for AI agent coordination (EPIC-027, STORY-104/105/106)
- Pre-release deployment workflow: extension now correctly resolves `@next` vs `@latest` npm tag at runtime
- Compliance audit trail support via STORY-102 planning

### Fixed
- **BUG-050:** Extension-spawned MCP server now reports the correct semantic version (read dynamically from `package.json` instead of hardcoded `0.1.0`)
- Dead MCP-server embedding code removed from extension bundle — reduces extension size and eliminates stale code paths (EPIC-004 cleanup)

### Changed
- Activation strategy optimised (STORY-037): extension activates only on relevant workspace signals, reducing VS Code startup overhead
- Bundling cleaned up with Biome linting pass; no functional behaviour changes
- MCP server spawned via npx now guaranteed compatible via `@schnick371/devsteps-mcp-server@latest`

## [0.8.4] - 2025-12-16

### Fixed
- MCP server version detection working correctly (TASK-207, BUG-047)
- Stable release using `@schnick371/devsteps-mcp-server@0.8.4`
- All pre-release fixes integrated and verified

### Changed
- Production-ready extension with stable MCP server
- Clean semantic version for marketplace release
- Uses stable @latest npm packages (no @next)

### Validation
- ✅ MCP server starts correctly via npx
- ✅ All DevSteps commands functional
- ✅ Version detection works as expected

## [0.8.2] - 2025-12-16 (Pre-release)

### Fixed
- MCP server version detection now works correctly (TASK-207, BUG-047)
- Pre-release extensions now use `@schnick371/devsteps-mcp-server@next`
- Requires MCP Server 0.8.1-next.6 or later (earlier @next versions broken)

### Technical
- Added `preRelease: true` field to package.json for runtime detection
- Extension detects pre-release status via `context.extension.packageJSON.preRelease`
- Dynamically selects npm package tag (@next vs @latest)

### Notes
- This release works with MCP Server 0.8.1-next.6+ only
- Skip MCP Server 0.8.1-next.5 (incomplete package)

## [0.7.0-next.3] - 2025-12-09 (Pre-release)

### ⚠️ Experimental Features
- Dual-bundle MCP server architecture (EPIC-015, STORY-056)
- VS Code native MCP registration API (BUG-034 fix)
- Zero-config installation with bundled MCP server

### Fixed
- BUG-034: Menu race condition - context keys set before TreeView creation
- TreeView initialization timing issues

### Testing Needed
- Bundled MCP server reliability
- Zero-config activation flow
- TreeView state persistence

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
