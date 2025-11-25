# Sync Branding & Links Across All Platforms

Ensure consistent branding, descriptions, and cross-links across all DevSteps public platforms.

## Affected Platforms

1. **GitHub Repository** (github.com/Schnick371/devsteps)
   - Currently: Only README.md (1 commit)
   - Needs: Full repository setup with proper files

2. **npm Package** (npmjs.com/package/@schnick371/devsteps-mcp-server)
   - Status: ✅ DONE (v0.4.1 published with full README)
   - Contains: README, keywords, repository links, homepage

3. **Website** (devsteps.dev)
   - Status: Active IONOS website builder
   - Language: German
   - Needs: Link to npm package, GitHub repository

## Required Actions

### GitHub Repository
- [ ] Upload core config files (package.json, tsconfig.json, biome.json, LICENSE.md)
- [ ] Update README.md with:
  - npm package installation instructions
  - Link to devsteps.dev
  - MCP server setup guide
  - Badges (npm version, downloads, license)
- [ ] Add repository description and topics
- [ ] Create GitHub repository social preview image

### Website (devsteps.dev)
- [ ] Add "Get Started" section with npm installation
- [ ] Link to GitHub repository
- [ ] Link to npm package page
- [ ] Add installation instructions for Claude Desktop
- [ ] Add installation instructions for VS Code Copilot

### Consistency Checks
- [ ] Verify all links work bidirectionally:
  - GitHub → npm → website → GitHub
- [ ] Ensure descriptions match across platforms
- [ ] Verify "Never Code Alone" slogan consistent
- [ ] Confirm license information (Apache-2.0) everywhere

## Cross-Platform Link Structure

```
┌─────────────────┐
│  devsteps.dev  │ ← Homepage
│   (Marketing)   │
└────────┬────────┘
         │
    ┌────┴────┬────────────┐
    │         │            │
┌───▼──┐  ┌──▼───┐  ┌─────▼─────┐
│GitHub│  │ npm  │  │VS Code    │
│Repo  │  │Package│  │Marketplace│
└───┬──┘  └──┬───┘  └─────┬─────┘
    │        │            │
    └────────┴────────────┘
         (All link back to website)
```

## Priority

**Medium** - Not urgent but important for professional appearance and discoverability.

## Eisenhower Quadrant

**Q2 (Not Urgent-Important)** - Schedule for implementation when main features complete.

## Acceptance Criteria

1. All platforms have matching descriptions
2. Bidirectional links work from all platforms
3. Installation instructions consistent everywhere
4. Branding (logo, colors, slogan) unified
5. GitHub has proper README with badges
6. Website has "Install" section with npm/GitHub links
