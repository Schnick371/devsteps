# Change Log

All notable changes to `@schnick371/devsteps-mcp-server` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
