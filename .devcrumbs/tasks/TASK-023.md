# TASK-023: GitHub Templates Creation

## Purpose
Provide structured templates for issues and pull requests to maintain consistent, high-quality contributions.

## Templates to Create

### 1. Bug Report Template
**File:** `.github/ISSUE_TEMPLATE/bug_report.md`

\`\`\`markdown
---
name: Bug Report
about: Report a bug or unexpected behavior
title: '[BUG] '
labels: bug
assignees: ''
---

## Bug Description
A clear and concise description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Run command '...'
3. Observe error '...'

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened (include error messages).

## Environment
- DevCrumbs Version: [e.g., 0.4.0]
- Node.js Version: [e.g., 18.20.0]
- OS: [e.g., Ubuntu 22.04, macOS 14.0]
- Installation Method: [npm, Docker, source]

## Additional Context
Any other context, screenshots, or logs.

## Possible Solution (Optional)
If you have ideas about what might be causing this.
\`\`\`

### 2. Feature Request Template
**File:** `.github/ISSUE_TEMPLATE/feature_request.md`

\`\`\`markdown
---
name: Feature Request
about: Suggest a new feature or enhancement
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## Problem Statement
What problem are you trying to solve? (e.g., "I want to... but currently can't...")

## Proposed Solution
Describe your ideal solution.

## Alternatives Considered
What other solutions have you thought about?

## Use Case
Describe a specific scenario where this would be useful.

## Additional Context
Any examples, mockups, or references.

## Implementation Ideas (Optional)
Technical suggestions if you have them.
\`\`\`

### 3. Pull Request Template
**File:** `.github/PULL_REQUEST_TEMPLATE.md`

\`\`\`markdown
## Description
What does this PR do? Why is it needed?

Fixes #(issue number)

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to break)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)

## Checklist
- [ ] I have read the [Contributing Guidelines](../CONTRIBUTING.md)
- [ ] My code follows the project's coding standards
- [ ] I have added tests for my changes (if applicable)
- [ ] All tests pass locally (`npm test`)
- [ ] I have run linting (`npm run lint`)
- [ ] I have updated documentation (if needed)
- [ ] My commits are signed (DCO)

## Testing Done
Describe how you tested your changes:
- [ ] Unit tests added/updated
- [ ] Manual testing performed
- [ ] Tested on: [OS/environment]

## Screenshots (if applicable)
Add screenshots or GIFs for UI changes.

## Additional Notes
Any other context or notes for reviewers.

---

By submitting this pull request, I confirm that my contribution is made under the terms of the Apache License 2.0 and Developer Certificate of Origin (DCO).

Signed-off-by: [Your Name] <your.email@example.com>
\`\`\`

### 4. Issue Config (Optional)
**File:** `.github/ISSUE_TEMPLATE/config.yml`

\`\`\`yaml
blank_issues_enabled: false
contact_links:
  - name: 💬 Discussions
    url: https://github.com/Schnick371/devcrumbs/discussions
    about: Ask questions, share ideas, or chat with the community
  - name: 🔒 Security Vulnerability
    url: mailto:the@devcrumbs.dev
    about: Report security issues privately (DO NOT use public issues)
\`\`\`

### 5. Funding File (Optional)
**File:** `.github/FUNDING.yml`

\`\`\`yaml
# GitHub Sponsors (if you set up)
# github: [devcrumbs]

# Ko-fi (if you set up)
# ko_fi: devcrumbs

# Patreon (if you set up)
# patreon: devcrumbs

# Custom URL
custom: ['https://devcrumbs.dev/sponsor']
\`\`\`

## Implementation Steps
1. Create `.github/ISSUE_TEMPLATE/` directory
2. Add `bug_report.md` template
3. Add `feature_request.md` template
4. Add `config.yml` for issue settings
5. Create `.github/PULL_REQUEST_TEMPLATE.md`
6. Optionally create `.github/FUNDING.yml`
7. Commit: `chore: add GitHub issue and PR templates`

## Validation
- [ ] Templates appear in GitHub "New Issue" dropdown
- [ ] PR template auto-fills when creating pull requests
- [ ] Issue config disables blank issues (if desired)
- [ ] Links in config.yml work correctly
- [ ] Templates enforce required information

## Benefits
- ✅ Consistent bug reports (easier to triage)
- ✅ Detailed feature requests (better planning)
- ✅ Quality pull requests (faster reviews)
- ✅ GitHub Community Profile completeness

## Dependencies
- Optional but recommended for: EPIC-004 (Publication)
- Can be added after initial publication