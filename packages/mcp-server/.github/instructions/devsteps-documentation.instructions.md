---
applyTo: "**/*.md,!.devsteps/**,!**/node_modules/**,!.github/{instructions,prompts,agents,chatmodes}/**"
description: "Documentation standards for markdown files"
---

# Documentation Standards

## Markdown Formatting

**Consistent structure:**
- ATX-style headings (# Title)
- Fenced code blocks with language identifiers
- Semantic line breaks for readability
- Relative links for internal references

## README Files

**Required sections:**
- Project overview and purpose
- Installation instructions
- Quick start guide
- API documentation or usage examples
- Contributing guidelines link
- License information

**Package READMEs:**
- Package-specific installation
- API surface documentation
- Usage examples
- Links to main documentation

## Code Blocks

**Clear examples:**
- Language identifier for syntax highlighting
- Complete, runnable examples
- Comments for complex logic
- Output examples where helpful

## Links and References

**Internal documentation:**
- Relative paths to other docs
- Working links verified
- Anchors for deep linking
- External links with context

## Documentation Structure

**docs/ organization:**
- architecture/ for system design
- guides/ for how-to content
- reference/ for API docs
- ADRs for architectural decisions

## Changelog

**CHANGELOG.md format:**
- Keep-a-Changelog standard
- Semantic versioning
- Categorized changes (Added, Changed, Fixed, etc.)
- Links to related issues/PRs

## Contributing Guidelines

**CONTRIBUTING.md content:**
- Development setup instructions
- Coding standards reference
- Testing requirements
- Pull request process
- Code of conduct link

## API Documentation

**Inline documentation:**
- JSDoc for TypeScript/JavaScript
- Clear parameter descriptions
- Return value documentation
- Example usage in comments
