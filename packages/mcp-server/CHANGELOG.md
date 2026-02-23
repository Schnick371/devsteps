# Changelog

All notable changes to the DevSteps MCP Server will be documented in this file.

## [1.1.0-next.2] - 2026-02-23 (Pre-release)

### ⚠️ Pre-Release Channel

Install via: `npm install -g @schnick371/devsteps-mcp-server@next`

Used automatically by VS Code extension `devsteps@1.0.1` when `isPreRelease()` detects odd patch version.

### Changed
- Updated dependency: `@schnick371/devsteps-shared@1.1.0-next.2`
- `copy:docs` script resilient to missing root `.devsteps/` directory

### Known Issues
- None specific to MCP server

### Testing Needed
- Verify VS Code extension `devsteps@1.0.1` (pre-release) spawns `@schnick371/devsteps-mcp-server@next`
- Verify all 30+ MCP tools accessible from GitHub Copilot
- Confirm `mcp_devsteps_devsteps-list`, `mcp_devsteps_devsteps-add` tools work

## [1.0.0] - 2026-02-21

### Added
- **Context Budget Protocol (CBP) tools** — four new MCP tools for AI agent coordination (EPIC-027, STORY-104/105/106):
  - `write_analysis_report` — persist a structured analysis report to `.devsteps/analysis/`
  - `read_analysis_envelope` — read the latest analysis envelope for a given sprint or item
  - `write_verdict` — record a compressed verdict (`CompressedVerdict`) for an analysis run
  - `write_sprint_brief` — write a `SprintVerdict` / `AnalysisBriefing` JSON file
- `init` handler now creates the `.devsteps/analysis/` directory (with `.gitignore`) alongside the standard scaffold

### Fixed
- **BUG-050:** Server no longer reports hardcoded version `0.1.0`; version is now read dynamically from `package.json` at startup
- **BUG-028:** `init` handler uses an append-only strategy for the workspace root `.gitignore` — existing user entries are preserved

### Changed
- `tsconfig.json` module resolution upgraded from `Node16` to `NodeNext` to support `import` attributes required by JSON imports
- Updated dependency: `@schnick371/devsteps-shared@1.0.0` (adds `CompressedVerdict`, `AnalysisBriefing`, `SprintVerdict` Zod schemas)

## [0.8.6] - 2025-12-16

### Fixed
- **npx compatibility:** Added default binary `devsteps-mcp-server` matching package name (BUG-052, TASK-211)
- Enables `npx @schnick371/devsteps-mcp-server` without explicit binary name
- Extension auto-uses this version via npx @latest mechanism

### Changed
- Binary entries: Added `devsteps-mcp-server` as default (points to bin/devsteps-mcp.js)
- Kept `devsteps-mcp` and `devsteps-mcp-tsx` for backward compatibility

### Impact
- VS Code extension can now correctly spawn MCP server via npx
- Users can test with: `npx @schnick371/devsteps-mcp-server --help`
- No manual installation required

## [0.8.5] - 2025-12-16

### Fixed
- **CRITICAL:** Fixed "path argument must be of type string" error (BUG-051, TASK-210)
- Root cause: Typo 'devstepsir' in shared package affected all MCP operations
- Added defensive validation to getWorkspacePath()
- Clear error messages when workspace folder missing

### Changed
- Updated to use `@schnick371/devsteps-shared@0.8.5`
- Improved error handling for missing workspace scenarios

### Impact
- MCP update/add/list/get operations now work reliably
- Extension 0.8.4 automatically uses this version via npx @latest
- Users don't need to reinstall extension

## [0.8.4] - 2025-12-16

### Fixed
- **STABLE RELEASE:** All TypeScript build issues resolved (BUG-048, TASK-208)
- MCP server package now complete with all 30 handler files
- Build uses `tsc --build` for proper composite mode compilation
- Global npm installation via npx works correctly

### Changed
- Production-ready with verified build process
- Clean semantic version (no pre-release suffix)
- Updated to use `@schnick371/devsteps-shared@0.8.4`

### Validation
- ✅ Complete package with all .js files included
- ✅ MCP server starts successfully via npx
- ✅ All handlers functional and tested

## [0.8.1-next.6] - 2025-12-16 (Pre-release)

### 🐛 Bug Fixes
- **CRITICAL:** Fixed build script to use `tsc --build` instead of `tsc` (BUG-048, TASK-208)
- **Impact:** MCP Server package now includes all .js files (was missing 6 files in 0.8.1-next.5)
- **Files Fixed:** dist/index.js, dist/handlers/health.js, and all other handlers
- **Root Cause:** TypeScript composite mode requires `--build` flag to emit .js files

### 🔧 Changes
- Updated build script: `tsc && ...` → `tsc --build && ...`
- Updated clean script to remove `*.tsbuildinfo` cache files

### ✅ Validation
- ✅ Clean build creates all 30 handler files (15 .js + 15 .d.ts)
- ✅ npm package complete (51 files vs 45 in broken version)
- ✅ MCP server starts successfully via npx

### Known Issues from Previous Releases
- Extension 0.8.1-0.8.3 correctly detect pre-release and request @next
- This release (0.8.1-next.6) is the FIRST working @next version
- 0.8.1-next.5 was broken - skip this version!

### Testing Needed
- Install: `npx -y --package=@schnick371/devsteps-mcp-server@next devsteps-mcp`
- Verify: MCP server starts without ERR_MODULE_NOT_FOUND
- Extension: Install 0.8.2 as pre-release and test MCP commands

## [0.7.0-next.3] - 2025-12-09 (Pre-release)

### ⚠️ Experimental Features
- Dual-bundle architecture for VS Code extension integration (STORY-056)
- Standalone + bundled deployment modes
- Enhanced HTTP server for VS Code native MCP API

### Known Issues
- Bundled mode requires VS Code native MCP support
- HTTP server port configuration may need adjustment

### Testing Needed
- Bundled mode activation reliability
- HTTP server stability under load
- MCP tool execution in bundled context

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.11] - 2025-12-03

### Changed
- Updated to use `@schnick371/devsteps-shared@0.6.11`
- No changes to MCP server functionality (already uses bundling)

### Deprecated
- Versions 0.6.6, 0.6.7, 0.6.8 were broken and removed from npm registry

## [0.6.6] - 2025-12-03

### Fixed
- MCP server startup and protocol handling
- Bundled distribution (index.bundled.mjs) validation
- STDIO transport communication

### Changed
- Updated to use `@schnick371/devsteps-shared@0.6.6`
- Improved error handling for legitimate errors (no server crash)

## [0.6.3] - 2025-12-03

### Breaking Changes ⚠️
- **REMOVED**: `affects`/`affected-by` from link handlers (STORY-053, TASK-121)
  - Removed from tool schema and descriptions
  - AI agents must use `relates-to` or `blocks` instead

### Changed
- Updated to use `@schnick371/devsteps-shared@0.6.3`
- Link validation enforces Bug `blocks` hierarchy
- Documentation updated for Jira 2025 standard

## [0.6.1] - 2025-12-02

### Fixed
- **Bug validation rules**: Fixed hierarchy relationship validation
  - Task can now implement Bug (Task = solution for Bug defect)
  - Bug only implements Epic/Requirement (proper traceability to business initiative)
  - MCP link tool now correctly validates Bug-related relationships

### Changed
- Updated `@schnick371/devsteps-shared` to 0.6.1 with corrected validation logic

## [0.6.0] - 2025-11-23

### Added
- **Published to npm**: `@schnick371/devsteps-mcp-server@0.6.0` publicly available
- **NPX Support**: Run directly via `npx @schnick371/devsteps-mcp-server`
- **MCP Protocol Implementation**: Full Model Context Protocol support
  - 15+ MCP tools for AI-assisted development
  - `init`, `add`, `update`, `list`, `get`, `link`, `trace`
  - `search`, `status`, `context`, `archive`, `purge`
  - `export`, `metrics`, `health`
- **Workspace Path Handling**: Accepts workspace path as CLI argument
- **Error Handling**: Global unhandled rejection handler
- **HTTP Server**: Optional HTTP endpoint for health checks and metrics
- **Production Binary**: Bundled single-file distribution (2.5MB)

### Fixed
- MCP server starts reliably even without existing `.devsteps` directory
- Workspace path passed via CLI argument (standard MCP pattern)
- Error responses instead of crashes on validation failures

### Changed
- Package scope: `@schnick371/devsteps-mcp-server`
- License: Apache-2.0
- Dependencies: Uses `@schnick371/devsteps-shared@0.6.0`
- Architecture: Production-ready with bundled dependencies
