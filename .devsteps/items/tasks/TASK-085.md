# Create Docs-Only GitHub Repository

## Structure
```
devsteps-docs/
├── README.md                  # Main documentation
├── LICENSE.md                 # Apache 2.0
├── CODE_OF_CONDUCT.md        # Community standards
├── CONTRIBUTING.md           # Contribution guidelines
├── SECURITY.md               # Vulnerability disclosure
├── INSTALL.md                # Installation guide
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
└── docs/
    ├── cli-usage.md          # CLI documentation
    ├── mcp-setup.md          # MCP configuration
    ├── extension-guide.md    # Extension features
    └── architecture.md       # System overview
```

## Content Sources
Copy from main repo:
- README.md
- LICENSE.md  
- CODE_OF_CONDUCT.md
- CONTRIBUTING.md
- SECURITY.md
- INSTALL.md

Create new:
- docs/cli-usage.md - CLI command reference
- docs/mcp-setup.md - MCP configuration guide
- docs/extension-guide.md - Extension features
- docs/architecture.md - High-level architecture

## Repository Setup
1. Create new repo on GitHub: `devsteps-docs`
2. Initialize with README
3. Add legal/community files
4. Create docs structure
5. Push initial commit

## Links to Update
- Extension package.json `homepage` and `repository` URLs
- CLI/MCP package.json URLs
- All doc cross-references

## Acceptance Criteria
- ✅ GitHub repo created and public
- ✅ All legal/community files present
- ✅ Documentation complete and readable
- ✅ No source code exposed
- ✅ Links consistent across packages