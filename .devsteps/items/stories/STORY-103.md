# DevSteps.dev Landing Page - Content Update with Playwright Automation

## Context

DevSteps.dev (with automatic redirect from devsteps.org) is hosted on IONOS.de and can only be edited through a browser-based interface. This makes manual updates time-consuming and error-prone. We need to update the landing page with professional content following open source best practices while automating the update process with Playwright MCP tools.

## User Pain Points & Value Propositions

These real-world scenarios help users understand *why* they need DevSteps:

### 1. **AI Context Loss Between Sessions**
**Problem**: "The current AI knows everything about your problem, but a new Copilot instance must be taught from scratch and doesn't know the sources you just worked on."

**DevSteps Solution**: Work items preserve context. The AI can always re-read implementation requirements and decisions — even after hours or days. Never start from zero again.

### 2. **AI Forgets Recent Tasks**
**Problem**: "The AI can't remember the task from 2 hours ago?"

**DevSteps Solution**: With DevSteps, the AI can always review implementation requirements and won't constantly rewrite previous decisions. Documented context outlives conversation history.

### 3. **Incomplete Project Planning**
**Problem**: "You created an extensive prompt for a new project. Shortly after starting, you realize you forgot a critical requirement and have to start over?"

**DevSteps Solution**: Intensive thinking during Story/Requirement creation catches issues early. You can even create a Spike when you're not sure — validate before committing!

### 4. **Endless File Rewrites**
**Problem**: "The AI keeps rewriting the same file over and over?"

**DevSteps Solution**: Capture multiple Stories/Tasks/Requirements upfront and implement them all at once — even across different work items. The AI will often write the final form of code on the first try!

### 5. **AI Approach Inconsistency**
**Problem**: "Copilot constantly changes its approach?"

**DevSteps Solution**: Simply modify the Copilot files to customize the DevSteps workflow to your requirements! Start with the DevSteps prompts, then adapt as needed.

### 6. **Prompt Complexity Overload**
**Problem**: "You try to keep your prompt as short as possible, but keep adding small details. The prompt grows longer, you've typed for 10 minutes, and the AI can't handle the complexity or misunderstands your intent?"

**DevSteps Solution**: Break down complexity into structured work items. The AI gets focused, actionable tasks instead of overwhelming walls of text.

### 7. **"Summarizing conversation history..." = Context Ceiling**
**Problem**: "You see 'Summarizing conversation history...' and know the AI is hitting its limit. You should start a new session, but the new session won't know anything from the old one."

**DevSteps Solution**: For both of you — just tell the AI which work item to work on, and it's instantly informed! Persistent context across sessions.

## Customization & Extensibility

**Want to change AI behavior with DevSteps?**  
No problem — the knowledge is in the prompts! Modify prompts to match your requirements.

**Start with the DevSteps foundation:**
- **devsteps-plan-work**: Plans implementation. You can always create new work items. The AI will reconcile them with existing items!
- **devsteps-start-work**: The AI prepares implementation in multiple steps and incorporates all latest insights!
- **devsteps-workflow**: Mid-implementation — remind the AI of the guidelines!
- **without prompt**: Handle small requests, tasks, or tell the AI to make minor adjustments. Use devsteps-workflow to wrap everything up!

## Research Findings

Based on comprehensive research of 100+ developer tool landing pages and open source project websites, the following best practices apply:

### Essential Content Sections (in order)

1. **Hero Section** (Above the fold)
   - Headline: **"DevSteps — Never Code Alone, Team Up With Your AI"**
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

3. **Problem-Solution Showcase** (NEW SECTION — based on user scenarios)
   
   Interactive section showing before/after scenarios:
   
   **Without DevSteps:**
   - 😫 "Summarizing conversation history..." → lose context
   - 🔁 AI rewrites same file 5 times
   - 🤷 New session = explain everything again
   - 📝 Prompt grows to 500 words → AI confused
   
   **With DevSteps:**
   - ✅ Persistent context across sessions
   - 🎯 One-shot final code implementation
   - 🧠 AI reads work items → instant context
   - 📊 Structured planning → focused execution

4. **Quick Start** (Expanded install guide)
   - VS Code Extension installation
   - Claude Desktop MCP setup
   - First work item creation
   - Link to full documentation

5. **Screenshots/Demo**
   - VS Code TreeView showing work items
   - Dashboard with project statistics
   - MCP integration with Claude
   - Git commit traceability

6. **Social Proof**
   - GitHub stars badge
   - npm downloads count
   - Apache 2.0 license badge
   - Testimonial (if available)

7. **Customization & Extensibility**
   - "Adapt to Your Workflow" section
   - Prompt-based customization examples
   - Link to prompt files on GitHub
   - Community-contributed workflows

8. **Contribution & Community**
   - "Contribute on GitHub" CTA
   - Link to CONTRIBUTING.md
   - Link to CODE_OF_CONDUCT.md
   - Community statistics

9. **Footer**
   - GitHub | npm | Documentation | Support
   - Copyright © 2025 Thomas Hertel
   - License: Apache 2.0

### SEO Optimization

- **Title Tag**: "DevSteps — AI-First Development Workflow for VS Code"
- **Meta Description**: "Never code alone. DevSteps integrates AI agents (Copilot, Claude) with work item tracking, git traceability, and visual dashboards in VS Code. Apache 2.0 licensed."
- **Keywords**: mcp, model-context-protocol, ai, task-tracking, vscode-extension, developer-workflow, git-integration, context-persistence, ai-memory
- **Structured Data**: JSON-LD SoftwareApplication schema with offers.price = 0

### Visual Elements

- **Hero Image**: Screenshot of VS Code with DevSteps TreeView and Dashboard
- **Demo GIF**: Short (10s) loop showing work item creation → implementation → commit
- **Problem-Solution Graphics**: Before/after comparison visuals
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
Generate all content sections in markdown/HTML format following the research-based structure, including new user-scenario-driven sections.

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

- [ ] All 9 essential sections present and properly ordered (including new Problem-Solution section)
- [ ] Hero CTA buttons functional (VS Code Marketplace, GitHub)
- [ ] Quick install command visible above fold
- [ ] 7 user pain point scenarios clearly presented with DevSteps solutions
- [ ] At least 1 screenshot and 1 demo GIF/video
- [ ] Problem-Solution comparison graphics (before/after)
- [ ] Social proof badges displaying correctly
- [ ] Customization section with prompt examples
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
- **User Feedback**: Real-world developer pain points (collected 2026-02-01)

## Dependencies

- User must log into IONOS interface first
- Screenshots/demo media need to be created (see STORY-019)
- Problem-Solution comparison graphics
- Branding assets (logo, icons) from EPIC-009

## Related Work Items

- **EPIC-009** - Brand Identity & Visual Design System
- **TASK-028** - Sync branding & links across platforms
- **STORY-019** - DevSteps Icon Design
- **TASK-030** - Push to GitHub (provides links to include)

## Estimated Effort

- Content preparation: 3-4 hours (increased due to new sections)
- Visual assets for Problem-Solution: 1-2 hours
- Playwright automation setup: 1-2 hours (one-time)
- Actual update execution: 30 minutes (once automated)
- Validation & testing: 1 hour

**Total**: ~7-10 hours (first time), ~1 hour (future updates)