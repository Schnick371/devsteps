# Story: Export Knowledge Base (Markdown/PDF/HTML)

## User Story
As a team lead, I want to export the knowledge base in various formats so that I can share organizational learnings with stakeholders, onboard new developers, or create documentation.

## Acceptance Criteria
- [ ] `devsteps export knowledge --format markdown --output docs/knowledge-base.md`
- [ ] Format options: markdown, html, pdf
- [ ] Structured output with sections:
  - Table of contents
  - Lessons Learned (grouped by domain)
  - Pattern Library (with code examples)
  - Anti-Patterns to Avoid
  - Architecture Decisions
- [ ] Include metadata: creation date, author, tags
- [ ] Syntax highlighting for code examples
- [ ] Export filters: by date range, tags, status

## Example Output Structure
```markdown
# DevSteps Knowledge Base
*Exported: 2025-11-27*

## Table of Contents
1. Lessons Learned (15)
2. Patterns Library (8)
3. Anti-Patterns (4)
4. Architecture Decisions (12)

## 💡 Lessons Learned

### LESSON-001: Custom URI Schemes in VS Code
**Problem**: TreeView badges not appearing...
**Solution**: Use Uri.from()...
**Tags**: vscode-extension, uri-handling
```

## Technical Notes
- Use markdown-pdf or puppeteer for PDF generation
- Support batch export of multiple projects
- Include diagrams if present (Mermaid support)