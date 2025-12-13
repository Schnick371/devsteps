# Changelog

All notable changes to `@schnick371/devsteps-cli` will be documented in this file.

## [0.7.0-next.3] - 2025-12-09 (Pre-release)

### ⚠️ Experimental Features
- Updated to use shared types v0.7.0-next.3
- Compatibility with dual-bundle MCP architecture

### Testing Needed
- CLI functionality with @next shared package
- Command execution stability

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.11] - 2025-12-03

### Fixed
- **Global npm installation now works correctly** - Implemented esbuild bundling to create standalone executable
- Resolved "Cannot find package 'commander'" error when installing globally
- CLI dependencies now bundled into single `dist/index.cjs` file (861KB)

### Changed
- **Build system**: Added esbuild bundling step to create CommonJS executable
- **Entry point**: Changed bin from `dist/index.js` to `dist/index.cjs`
- **Dependencies**: Added `commander@^12.1.0` and `esbuild@^0.27.0`
- **Source code**: Wrapped async code in IIFE for CommonJS compatibility
- Updated to use `@schnick371/devsteps-shared@0.6.11`

### Technical Details
- Created `esbuild.mjs` for bundling configuration
- Platform: Node.js, Target: node20, Format: CommonJS
- Bundle includes all dependencies except native Node.js modules
- Follows same approach as npm CLI, Next.js, and Vercel tools

### Deprecated
- Versions 0.6.6, 0.6.7, 0.6.8 were broken and removed from npm registry

## [0.6.6] - 2025-12-03

### Fixed
- Package build and distribution validation
- CLI commands tested and verified

### Changed
- Updated to use `@schnick371/devsteps-shared@0.6.6`

## [0.6.3] - 2025-12-03

### Breaking Changes ⚠️
- **REMOVED**: `affects`/`affected-by` from `link` command (STORY-053, TASK-122)
  - No longer valid relationship type
  - Use `relates-to` or `blocks` instead

### Changed
- Updated to use `@schnick371/devsteps-shared@0.6.3`
- Link validation now enforces Bug `blocks` hierarchy

## [0.6.1] - 2025-12-02

### Fixed
- **Bug validation rules**: Fixed hierarchy relationship validation
  - Task can now implement Bug (Task = solution for Bug defect)
  - Bug only implements Epic/Requirement (proper traceability to business initiative)
  - Prevents incorrect relationship patterns that violated Scrum/Waterfall hierarchies

### Changed
- Updated `@schnick371/devsteps-shared` to 0.6.1 with corrected validation logic

## [0.6.0] - 2025-11-23

### Added
- **Published to npm**: `@schnick371/devsteps-cli@0.6.0` publicly available
- **Full CLI Functionality**: Complete command-line interface for DevSteps
  - `devsteps init` - Initialize new project
  - `devsteps add` - Create work items (epic/story/task/bug/spike/test)
  - `devsteps list` - List items with filtering and sorting
  - `devsteps update` - Update item status, priority, assignee
  - `devsteps link` - Create relationships between items
  - `devsteps trace` - Show traceability tree
  - `devsteps status` - Project overview and statistics
  - `devsteps context` - AI-optimized project context
  - `devsteps search` - Full-text search across items
  - `devsteps archive` - Archive completed items
- **Methodology Support**: Scrum, Waterfall, and Hybrid methodologies
- **Interactive Prompts**: User-friendly CLI with ora spinners and chalk formatting
- **Validation**: Real-time relationship validation based on methodology
- **Git Integration**: Commit message generation and workflow support

### Changed
- Package scope: `@schnick371/devsteps-cli`
- License: Apache-2.0
- Dependencies: Uses `@schnick371/devsteps-shared@0.6.0`
