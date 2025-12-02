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

## [0.6.0] - 2025-11-XX

### Added
- Initial release with full CLI functionality
- Support for Scrum, Waterfall, and Hybrid methodologies
- Interactive commands for project initialization and management
