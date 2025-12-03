# Change Log

All notable changes to `@schnick371/devsteps-shared` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.11] - 2025-12-03

### Changed
- Updated for CLI bundling support
- No breaking changes to shared types or schemas

### Deprecated
- Versions 0.6.6, 0.6.7, 0.6.8 marked as deprecated (broken releases)

## [0.6.6] - 2025-12-03

### Fixed
- Package build and distribution validation
- TypeScript compilation consistency

## [0.6.3] - 2025-12-03

### Breaking Changes ⚠️
- **REMOVED**: `affects`/`affected-by` relationship types (STORY-053, EPIC-014)
  - Azure DevOps CMMI-only feature incorrectly implemented
  - Use `relates-to` for context or `blocks` for blocking impact
  - Migration: Replace `affects` with `relates-to` or `blocks`

### Changed
- **blocks/blocked-by**: Moved to HIERARCHY_RELATIONSHIPS (STORY-054, TASK-124)
  - Bug `blocks` Epic/Story/Requirement/Feature validated as hierarchy
  - Other item types: `blocks` remains flexible (bypass validation)
  - Dual-mode validation supports both use cases
- **Bug validation**: Updated to enforce `blocks` hierarchy (TASK-125)
  - Bug can block parent items (blocking + hierarchy)
  - Bug cannot use `implements` to Epic/Requirement (use `blocks` instead)

### Removed
- `affects`/`affected-by` from FLEXIBLE_RELATIONSHIPS (TASK-119)
- `affects` from schema types and exports (TASK-120)

## [0.6.2] - 2025-12-02

### Added
- **Flexible Bug relationships**: New `affects`/`affected-by` relationship types (STORY-049, TASK-103)
  - Bugs can now use `relates-to` or `affects` for Epic/Requirement connections
  - `relates-to`: General context/scope relationship
  - `affects`: Impact/deliverable relationship
  - Validation rejects `Bug implements Epic/Requirement` (TASK-104)

### Changed
- **Bug workflow**: Updated to support flexible relationship types
  - Bug items focus on problem description only
  - Task items implement solutions (Bug implemented-by Task)
  - Documentation updated with new Bug workflow (TASK-105)

## [0.6.1] - 2025-12-02

### Fixed
- **Bug validation rules**: Corrected hierarchy relationship validation in `validation.ts`
  - **Scrum**: Task can now implement Story/Spike/Bug (was: only Story/Spike)
  - **Scrum**: Bug only implements Epic (was: Epic/Story)
  - **Waterfall**: Task can now implement Feature/Spike/Bug (was: only Feature/Spike)
  - **Waterfall**: Bug only implements Requirement (was: Requirement/Feature)
- Updated status validation in `update.ts` to include Bug in `implemented-by` children check
- Improved relationship documentation in `relationships.ts` comments

### Changed
- Enhanced validation error messages with clearer guidance on correct relationships
- Test suite updated to reflect corrected Bug workflow patterns

## [0.6.0] - 2025-11-23

### Added
- **Published to npm**: `@schnick371/devsteps-shared@0.6.0` publicly available
- **Core Schemas**: Zod-based validation for all work item types
  - ItemMetadata, ProjectConfig, RelationType
  - Support for 8 item types: epic, story, task, requirement, feature, bug, spike, test
  - 9 relationship types: implements, relates-to, blocks, depends-on, tested-by, supersedes, etc.
- **Methodology Support**: 
  - **Scrum**: Epic → Story/Spike → Task hierarchy
  - **Waterfall**: Requirement → Feature/Spike → Task hierarchy
  - **Hybrid**: Combined Scrum + Waterfall
- **Validation System**: Comprehensive relationship validation
  - Hierarchy validation (implements/implemented-by)
  - Flexible relationships (relates-to, blocks, depends-on, etc.)
  - Methodology-aware rules with detailed error messages
- **Utility Functions**:
  - `parseItemId()` - Parse work item IDs (e.g., EPIC-001)
  - `generateItemId()` - Generate next sequential ID
  - `getCurrentTimestamp()` - ISO 8601 timestamps
  - `getMethodologyDefaults()` - Methodology configuration
- **TypeScript Types**: Full type safety for all operations
- **ESM Support**: Pure ES modules with proper exports

### Changed
- Package scope: `@schnick371/devsteps-shared`
- License: Apache-2.0
- Module system: Pure ESM (type: "module")
