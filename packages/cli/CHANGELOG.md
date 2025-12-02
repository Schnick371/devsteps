# Change Log

All notable changes to `@schnick371/devsteps-cli` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
