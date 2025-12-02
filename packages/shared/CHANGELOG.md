# Change Log

All notable changes to `@schnick371/devsteps-shared` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

## [0.6.0] - 2025-11-XX

### Added
- Initial release with core schemas, types, and validation logic
- Support for Scrum, Waterfall, and Hybrid methodologies
- Comprehensive relationship validation system
