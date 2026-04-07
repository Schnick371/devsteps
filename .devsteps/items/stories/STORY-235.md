After BUG-075 (7 DOC infrastructure defects) and TASK-391 (migration scaffold) are done, seed DOC items for all existing documentation files so mcp_devsteps_search discovers docs alongside work items.

**Files to cover (first pass):**
- docs/architecture/*.md (mpd-architecture.md, git-strategy.md, relationship-management.md)
- docs/PRIVACY-POLICY.md
- tmp/visualizer/AITK-Tools-Guide*.md, RESEARCH-AITK-*.md
- README.md, CONTRIBUTING.md, INSTALL.md, TESTING.md

**For each file:**
1. `devsteps add --type doc --path <file> --keywords [...relevant terms]`
2. Link to related EPICs/SPIKEs via `documented-by` relation

**Impact:** Once seeded, agents get direct discoverability of docs/ and tmp/visualizer/ content via mcp_devsteps_search — no filesystem scan needed. AI agent force-multiplier.

**Depends on:** BUG-075 (defects fix) + TASK-391 (migration) + STORY-234 (doc creation tooling with Zod validation)