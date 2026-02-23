---
applyTo: ".vscode/**/*.json"
description: "VSCode workspace configuration standards"
---

# VSCode Workspace Configuration Standards

## Tasks Configuration

**tasks.json structure:**
- Emoji prefixes for visual clarity
- Grouped by function (build, test, clean)
- Background tasks marked with isBackground
- Dependencies use dependsOn array

**Task naming:**
- Descriptive labels with action verbs
- Consistent emoji usage
- Default tasks for common operations
- Problem matchers for error detection

## Launch Configuration

**launch.json patterns:**
- Named configurations for each package
- Attach configurations for debugging
- Source maps enabled
- Environment variables specified

**Debug scenarios:**
- CLI debugging
- MCP server debugging
- Extension debugging
- Test debugging

## Settings

**settings.json scope:**
- Workspace settings for team consistency
- File associations for custom extensions
- Editor formatters configured
- Search exclusions for performance

## Extensions

**extensions.json recommendations:**
- Required extensions for development
- Optional extensions for enhancement
- Avoid conflicting extensions
- Document extension purposes

## MCP Configuration

**mcp.json standards:**
- Server configurations per environment
- Clear server names and purposes
- Command and argument specifications
- Environment variable usage

## Workspace Organization

**Multi-root workspaces:**
- Package-specific folders
- Shared configurations at root
- Consistent settings across packages
- Clear folder naming
