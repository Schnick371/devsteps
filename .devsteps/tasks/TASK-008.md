# Extension Packaging and Publishing

## Objectives
Prepare the VS Code extension for distribution via VS Code Marketplace.

## Packaging Configuration

### package.json Requirements
```json
{
  "name": "devsteps",
  "displayName": "DevSteps - AI-First Development Workflow",
  "description": "Structured work item tracking with AI integration via MCP",
  "version": "0.1.0",
  "publisher": "devsteps",
  "license": "MIT",
  "icon": "resources/icons/devsteps-marketplace.png",
  "repository": {
    "type": "git",
    "url": "https://github.com/Schnick371/devsteps"
  },
  "bugs": {
    "url": "https://github.com/Schnick371/devsteps/issues"
  },
  "homepage": "https://devsteps.dev",
  "categories": ["Other", "Project Management"],
  "keywords": [
    "workflow",
    "project-management",
    "ai",
    "mcp",
    "traceability"
  ],
  "engines": {
    "vscode": "^1.106.0"
  }
}
```

### .vscodeignore
```
.vscode/**
.github/**
src/**
tsconfig.json
esbuild.js
*.map
*.ts
node_modules/@types/**
test/**
```

### README.md for Marketplace
- Feature overview with screenshots
- Installation instructions
- Quick start guide
- MCP integration details
- Configuration options
- Troubleshooting

### CHANGELOG.md
Version history with release notes

## Build Scripts

### package.json scripts
```json
{
  "scripts": {
    "vscode:prepublish": "npm run build",
    "build": "esbuild ./src/extension.ts --bundle --outfile=dist/extension.js --external:vscode --format=cjs --platform=node",
    "package": "vsce package",
    "publish": "vsce publish"
  }
}
```

## VSIX Creation
```bash
# Install vsce (VS Code Extension Manager)
npm install -g @vscode/vsce

# Package extension
vsce package

# Output: devsteps-0.1.0.vsix
```

## Publishing Checklist
- [ ] Extension bundled with esbuild
- [ ] README with screenshots
- [ ] CHANGELOG up to date
- [ ] License file included
- [ ] Icon (128x128px PNG)
- [ ] Repository URL set
- [ ] Version number correct
- [ ] Test VSIX locally
- [ ] Create publisher account
- [ ] Publish to Marketplace

## Marketplace Listing
- **Display Name**: DevSteps - AI-First Development Workflow
- **Categories**: Other, Project Management
- **Tags**: workflow, ai, mcp, traceability
- **Pricing**: Free
- **License**: MIT

## Acceptance Criteria
- ✅ VSIX package created successfully
- ✅ Extension installs from VSIX
- ✅ All features work after packaging
- ✅ README renders correctly in Marketplace
- ✅ Icon displays properly
- ✅ Extension size < 10MB