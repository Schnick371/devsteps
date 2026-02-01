# DevSteps.dev Landing Page - Content Update with Playwright Automation

## Context

DevSteps.dev (with automatic redirect from devsteps.org) is hosted on IONOS.de and can only be edited through a browser-based interface. This makes manual updates time-consuming and error-prone. We need to update the landing page with professional content following open source best practices while automating the update process with Playwright MCP tools.

## Research Findings

Based on comprehensive research of 100+ developer tool landing pages and open source project websites, the following best practices apply:

### Essential Content Sections (in order)

1. **Hero Section** (Above the fold)
   - Headline: "DevSteps — Never Code Alone, Team Up With Your AI"
   - Subhead: "AI-first development workflow system for VS Code - track work items, integrate with GitHub Copilot & Claude, maintain perfect traceability"
   - Primary CTA: "Install Extension" (VS Code Marketplace)
   - Secondary CTA: "View on GitHub"
   - Quick install: `code --install-extension schnick371.devsteps`
   - Screenshot/GIF showing the extension in action

2. **Key Benefits** (3-5 scannable bullets)
   - "Zero Config — Works out of the box in minutes"
   - "AI-Powered — Native MCP integration with Copilot & Claude"
   - "Git Traceability — Every commit linked to work items"
   - "Visual Dashboard — Track progress in VS Code sidebar"

3. **Quick Start** (Expanded install guide)
   - VS Code Extension installation
   - Claude Desktop MCP setup
   - First work item creation
   - Link to full documentation

4. **Screenshots/Demo**
   - VS Code TreeView showing work items
   - Dashboard with project statistics
   - MCP integration with Claude
   - Git commit traceability

5. **Social Proof**
   - GitHub stars badge
   - npm downloads count
   - Apache 2.0 license badge
   - Testimonial (if available)

6. **Contribution & Community**
   - "Contribute on GitHub" CTA
   - Link to CONTRIBUTING.md
   - Link to CODE_OF_CONDUCT.md
   - Community statistics

7. **Footer**
   - GitHub | npm | Documentation | Support
   - Copyright © 2025 Thomas Hertel
   - License: Apache 2.0

### SEO Optimization

- **Title Tag**: "DevSteps — AI-First Development Workflow for VS Code"
- **Meta Description**: "Never code alone. DevSteps integrates AI agents (Copilot, Claude) with work item tracking, git traceability, and visual dashboards in VS Code. Apache 2.0 licensed."
- **Keywords**: mcp, model-context-protocol, ai, task-tracking, vscode-extension, developer-workflow, git-integration
- **Structured Data**: JSON-LD SoftwareApplication schema with offers.price = 0

### Visual Elements

- **Hero Image**: Screenshot of VS Code with DevSteps TreeView and Dashboard
- **Demo GIF**: Short (10s) loop showing work item creation → implementation → commit
- **Format**: WebP/AVIF for images, WebM/MP4 for videos (not GIF for performance)
- **Alt Text**: Descriptive, functional descriptions (~150 chars)

### Distribution Strategy

- Link from GitHub README to devsteps.dev
- Link from npm package to devsteps.dev
- Link from VS Code Marketplace to devsteps.dev
- Cross-platform consistency (same description everywhere)

## Implementation Approach

### Phase 1: Manual Login & Playwright Session
User logs into IONOS website builder, then Playwright MCP tools take over for automated content updates.

### Phase 2: Content Preparation
Generate all content sections in markdown/HTML format following the research-based structure.

### Phase 3: Automated Update with Playwright
Use Playwright MCP tools to:
1. Navigate IONOS interface
2. Locate content editors
3. Update sections systematically
4. Upload images/media
5. Verify changes
6. Publish

### Phase 4: Validation
- Check all links work
- Verify mobile responsiveness
- Test SEO meta tags
- Validate structured data
- Performance check (LCP, TTI)

## Technical Constraints

- **Platform**: IONOS.de website builder (browser-only editing)
- **Language**: Current site is German → needs English version or bilingual
- **Redirect**: devsteps.org → devsteps.dev (already configured)
- **Automation**: Must use Playwright MCP tools after manual login

## Acceptance Criteria

- [ ] All 7 essential sections present and properly ordered
- [ ] Hero CTA buttons functional (VS Code Marketplace, GitHub)
- [ ] Quick install command visible above fold
- [ ] At least 1 screenshot and 1 demo GIF/video
- [ ] Social proof badges displaying correctly
- [ ] SEO meta tags optimized (title, description, OG, Twitter Card)
- [ ] JSON-LD structured data implemented
- [ ] All cross-platform links bidirectional (GitHub ↔ npm ↔ website)
- [ ] Mobile responsive design
- [ ] Performance: LCP < 2.5s, TTI < 3.5s
- [ ] Accessibility: WCAG 2.2 Level AA compliance

## Research Sources

- Evil Martians: "We Studied 100 Devtool Landing Pages" (2025)
- Google Search Essentials & SEO Starter Guide
- W3C WCAG 2.2 Accessibility Standards
- Schema.org SoftwareApplication Properties
- VS Code Extension Publishing Guidelines
- Daily.dev README Badges Best Practices

## Dependencies

- User must log into IONOS interface first
- Screenshots/demo media need to be created (see STORY-019)
- Branding assets (logo, icons) from EPIC-009

## Related Work Items

- **EPIC-009** - Brand Identity & Visual Design System
- **TASK-028** - Sync branding & links across platforms
- **STORY-019** - DevSteps Icon Design
- **TASK-030** - Push to GitHub (provides links to include)

## Estimated Effort

- Content preparation: 2-3 hours
- Playwright automation setup: 1-2 hours (one-time)
- Actual update execution: 30 minutes (once automated)
- Validation & testing: 1 hour

**Total**: ~5-7 hours (first time), ~1 hour (future updates)