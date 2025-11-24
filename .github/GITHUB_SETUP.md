# GitHub Repository Setup Guide

This guide provides step-by-step instructions for setting up the DevCrumbs GitHub repository for public release.

## Prerequisites ✅

All required tasks completed:
- ✅ LICENSE consistency (Apache 2.0)
- ✅ Safety audit passed (no secrets, dependencies checked)
- ✅ README.md enhanced with badges and legal sections
- ✅ CODE_OF_CONDUCT.md (Contributor Covenant 2.1)
- ✅ CONTRIBUTING.md (DCO requirements)
- ✅ SECURITY.md (vulnerability disclosure)
- ✅ Issue templates configured
- ✅ Pull request template created
- ✅ Dependabot configuration

## Step 1: Create GitHub Repository

### Option A: GitHub CLI (Recommended)
```bash
gh repo create devcrumbs/devcrumbs \
  --public \
  --description "Never Code Alone. AI-assisted developer task tracking system with MCP protocol integration." \
  --homepage "https://devcrumbs.dev" \
  --disable-wiki \
  --enable-issues \
  --source=. \
  --remote=origin \
  --push
```

### Option B: GitHub Web Interface
1. Go to https://github.com/new
2. Repository name: `devcrumbs`
3. Description: `Never Code Alone. AI-assisted developer task tracking system with MCP protocol integration.`
4. Visibility: **Public**
5. Do NOT initialize with README, .gitignore, or license (already exists)
6. Click "Create repository"

### Option C: GitHub API
```bash
curl -X POST https://api.github.com/user/repos \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -d '{
    "name": "devcrumbs",
    "description": "Never Code Alone. AI-assisted developer task tracking system with MCP protocol integration.",
    "homepage": "https://devcrumbs.dev",
    "private": false,
    "has_issues": true,
    "has_projects": true,
    "has_wiki": false,
    "has_discussions": true,
    "auto_init": false,
    "license_template": "apache-2.0"
  }'
```

## Step 2: Push Code to GitHub

```bash
# Add remote (if not already added)
git remote add origin https://github.com/devcrumbs/devcrumbs.git

# Verify all changes are committed
git status

# Push main branch
git push -u origin main

# Push all tags (if any)
git push --tags
```

## Step 3: Repository Settings

### General Settings
Navigate to: `Settings → General`

**Repository Details:**
- Website: `https://devcrumbs.dev`
- Topics: Add tags for discoverability
  - `task-tracking`
  - `ai-tools`
  - `mcp-protocol`
  - `developer-tools`
  - `devops`
  - `typescript`
  - `nodejs`
  - `workflow-automation`

**Features:**
- ✅ Issues
- ✅ Discussions (for community Q&A)
- ✅ Projects (for roadmap)
- ❌ Wiki (not needed)
- ✅ Sponsorships (configure FUNDING.yml if needed)

**Pull Requests:**
- ✅ Allow merge commits
- ✅ Allow squash merging (default)
- ✅ Allow rebase merging
- ✅ Always suggest updating pull request branches
- ✅ Automatically delete head branches

### Branch Protection Rules
Navigate to: `Settings → Branches → Add rule`

**Rule for `main` branch:**
```yaml
Branch name pattern: main

Protection rules:
  ☑ Require a pull request before merging
    ☑ Require approvals: 1
    ☑ Dismiss stale pull request approvals when new commits are pushed
    ☑ Require review from Code Owners (if CODEOWNERS file exists)
  
  ☑ Require status checks to pass before merging
    ☑ Require branches to be up to date before merging
    Status checks (add after CI setup):
      - build
      - test
      - lint
      - typecheck
  
  ☑ Require conversation resolution before merging
  ☑ Require signed commits (DCO compliance)
  ☐ Require linear history (optional)
  ☐ Include administrators (you can bypass initially)
  ☑ Restrict who can push to matching branches (optional)
  ☐ Allow force pushes (never!)
  ☐ Allow deletions (never!)
```

**Lock branch (optional):**
- ☐ Lock branch (prevents any writes, even from admins)

## Step 4: Security Settings

Navigate to: `Settings → Security`

### Code security and analysis
- ✅ Dependency graph (auto-enabled for public repos)
- ✅ Dependabot alerts
- ✅ Dependabot security updates
- ✅ Grouped security updates (2025 feature)
- ✅ Secret scanning (auto-enabled for public repos)
- ✅ Push protection (prevent secret commits)

### Private vulnerability reporting
- ✅ Enable private vulnerability reporting
  - Contact: `the@devcrumbs.dev`
  - Policy: See SECURITY.md

## Step 5: Repository Labels

Navigate to: `Issues → Labels`

### Default Labels to Keep
- `bug` (red) - Something isn't working
- `documentation` (blue) - Improvements or additions to documentation
- `enhancement` (green) - New feature or request
- `good first issue` (green) - Good for newcomers
- `help wanted` (blue) - Extra attention is needed

### Custom Labels to Add

**Priority:**
- `priority: critical` (#d73a4a) - Critical priority
- `priority: high` (#ff6b6b) - High priority
- `priority: medium` (#ffd93d) - Medium priority
- `priority: low` (#b8b8b8) - Low priority

**Status:**
- `status: blocked` (#d73a4a) - Blocked by another issue
- `status: in-progress` (#ffd93d) - Currently being worked on
- `status: needs-review` (#ff9800) - Waiting for review
- `status: ready` (#4caf50) - Ready to be worked on

**Type:**
- `type: bug` (#d73a4a) - Bug report
- `type: feature` (#0e8a16) - Feature request
- `type: docs` (#0075ca) - Documentation
- `type: refactor` (#fbca04) - Code refactoring
- `type: test` (#1d76db) - Test improvements

**Component:**
- `component: cli` (#5319e7) - CLI package
- `component: mcp-server` (#9c27b0) - MCP Server package
- `component: extension` (#673ab7) - VS Code Extension
- `component: shared` (#3f51b5) - Shared library

**Special:**
- `duplicate` (#cfd3d7) - This issue or pull request already exists
- `wontfix` (#ffffff) - This will not be worked on
- `invalid` (#e4e669) - This doesn't seem right
- `question` (#d876e3) - Further information is requested

## Step 6: GitHub Discussions

Navigate to: `Settings → General → Features → Discussions → Set up discussions`

### Categories to Create
1. **💡 Ideas**
   - Description: "Share ideas for new features and improvements"
   - Format: Discussion

2. **🙏 Q&A**
   - Description: "Ask questions and get help from the community"
   - Format: Q&A (with accepted answers)

3. **📣 Announcements**
   - Description: "Official project updates and news"
   - Format: Announcement

4. **💬 General**
   - Description: "Chat about anything related to DevCrumbs"
   - Format: Discussion

5. **🐛 Bug Reports**
   - Description: "Report bugs (redirects to Issues)"
   - Link to: Issues

6. **🎯 Show and Tell**
   - Description: "Share what you've built with DevCrumbs"
   - Format: Show and tell

## Step 7: Community Health Files

Verify all files are properly recognized:
Navigate to: `Insights → Community`

**Community Profile Checklist (should show 100%):**
- ✅ Description
- ✅ README
- ✅ Code of conduct
- ✅ Contributing guide
- ✅ License
- ✅ Security policy
- ✅ Issue templates
- ✅ Pull request template

## Step 8: Social Preview Image

Navigate to: `Settings → General → Social preview`

**Recommended Dimensions:** 1280×640px

**Content Suggestions:**
- DevCrumbs logo/wordmark
- Tagline: "Never Code Alone"
- Key technology badges: TypeScript, Node.js, MCP Protocol
- Dark theme background matching brand colors

**Tools:**
- Figma/Canva for design
- Or use GitHub's OG image generator

## Step 9: GitHub Pages (Optional)

If hosting documentation:

Navigate to: `Settings → Pages`

**Source:**
- Deploy from branch: `gh-pages` (create branch first)
- Or: GitHub Actions workflow

**Custom Domain (if configured):**
- Domain: `docs.devcrumbs.dev`
- Enforce HTTPS: ✅

## Step 10: First Release

Navigate to: `Releases → Create a new release`

**Tag:** `v0.4.0`
**Target:** `main`
**Release title:** `DevCrumbs v0.4.0 - Initial Public Release 🎉`

**Description:**
```markdown
# DevCrumbs v0.4.0 - Initial Public Release

Never Code Alone! We're excited to release DevCrumbs, an AI-assisted developer task tracking system with MCP protocol integration.

## 🚀 Features

### CLI Tool
- Initialize and manage development task hierarchies
- Support for multiple methodologies (Scrum, Waterfall, Hybrid)
- Rich task metadata and traceability
- Context-aware project analysis

### MCP Server
- Full Model Context Protocol (MCP) integration
- Health monitoring and metrics
- Prometheus-compatible endpoints
- Docker and Kubernetes ready

### VS Code Extension
- TreeView integration with dual display modes
- Command palette integration
- Automatic MCP server registration
- Real-time task synchronization

## 📦 Installation

### CLI
\`\`\`bash
npm install -g @devcrumbs/cli
devcrumbs init my-project
\`\`\`

### MCP Server
\`\`\`bash
npm install -g @devcrumbs/mcp-server
devcrumbs-mcp
\`\`\`

### VS Code Extension
Install from [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=devcrumbs.devcrumbs) or download `.vsix` from release assets.

## 📚 Documentation

- [README](https://github.com/devcrumbs/devcrumbs#readme)
- [Contributing Guide](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)

## 🙏 Acknowledgments

Built with TypeScript, Node.js, and powered by the Model Context Protocol.

## 📄 License

Apache License 2.0 - See [LICENSE](LICENSE.md)
```

**Assets:**
- Attach distribution packages from `npm run package:all`
- VS Code Extension `.vsix`
- Source code archives (auto-generated)

**Options:**
- ✅ Set as the latest release
- ✅ Create a discussion for this release

## Step 11: Post-Publication Checklist

### Immediate Actions
- [ ] Verify repository is public and accessible
- [ ] Test clone: `git clone https://github.com/devcrumbs/devcrumbs.git`
- [ ] Verify all documentation renders correctly
- [ ] Check Community Profile shows 100%
- [ ] Test issue template functionality
- [ ] Verify Dependabot is running

### Monitoring Setup
- [ ] Enable GitHub notifications for:
  - Issues
  - Pull requests
  - Discussions
  - Security alerts
- [ ] Set up email filters for GitHub notifications
- [ ] Configure mobile notifications (GitHub app)

### Analytics
- [ ] Star your own repo (shows confidence)
- [ ] Share with team/beta users
- [ ] Monitor traffic: `Insights → Traffic`
- [ ] Track clone statistics
- [ ] Watch dependency alerts

## Step 12: Promotion

### Social Media Announcement
```markdown
🎉 Introducing DevCrumbs v0.4.0!

Never Code Alone. AI-assisted developer task tracking with MCP protocol integration.

✨ Features:
- CLI for task management
- MCP server for AI integration
- VS Code extension
- Multi-methodology support

🔗 https://github.com/devcrumbs/devcrumbs

#DevTools #TypeScript #AI #MCP
```

### Community Channels
- [ ] Post on Dev.to: "Introducing DevCrumbs: Never Code Alone"
- [ ] Reddit: r/programming, r/devtools, r/typescript
- [ ] Hacker News: "Show HN: DevCrumbs – AI-assisted task tracking"
- [ ] LinkedIn: Professional network announcement
- [ ] Twitter/X: Thread with key features
- [ ] Product Hunt: Launch post

### Documentation Sites
- [ ] Add to Awesome Lists (awesome-nodejs, awesome-typescript)
- [ ] Submit to npm package directories
- [ ] Register on AlternativeTo
- [ ] Add to StackShare

## Step 13: CI/CD Setup (Future)

After initial release, set up continuous integration:

### GitHub Actions Workflows
Create `.github/workflows/`:
- `ci.yml` - Build, test, lint on PRs
- `release.yml` - Automated releases
- `codeql.yml` - Security scanning
- `dependabot-auto-merge.yml` - Auto-merge dependency updates

**Status checks to require:**
- Build successful
- Tests passing
- Linting clean
- Type checking passed
- Code coverage > 80%

## Validation Commands

```bash
# Verify repository structure
ls -la .github/

# Check git remotes
git remote -v

# Verify tags
git tag -l

# Test issue template (after push)
# Go to: https://github.com/devcrumbs/devcrumbs/issues/new/choose

# Check Dependabot config
# Go to: https://github.com/devcrumbs/devcrumbs/network/updates
```

## Troubleshooting

### Issue: Branch protection prevents push
**Solution:** Temporarily disable "Include administrators" in branch protection rules

### Issue: Dependabot not running
**Solution:** 
- Check `.github/dependabot.yml` syntax
- Verify repository is public
- Wait up to 24 hours for first run

### Issue: Issue templates not showing
**Solution:**
- Verify `.yml` extension (not `.yaml`)
- Check YAML syntax
- Clear browser cache
- Wait a few minutes for GitHub to process

### Issue: Community profile incomplete
**Solution:**
- Ensure all files are in repository root (not subdirectories)
- Files must have exact names (case-sensitive)
- README.md must be substantial (not just a title)

## Support

For questions or issues:
- GitHub Discussions: https://github.com/devcrumbs/devcrumbs/discussions
- Email: the@devcrumbs.dev
- Security: See SECURITY.md

---

**Last Updated:** 2025-01-23  
**Version:** 1.0.0  
**Status:** Ready for v0.4.0 release
