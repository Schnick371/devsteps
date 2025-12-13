# Story: Pattern Library with Code Examples

## User Story
As a developer, I want to document and search reusable code patterns with examples so that I can apply proven solutions to similar problems.

## Acceptance Criteria
- [ ] Create `devsteps add pattern <title>` command
- [ ] Support inline code examples (markdown code blocks)
- [ ] Support file path references (e.g., `--code-example path/to/file.ts:10-50`)
- [ ] Auto-extract code snippets from referenced files
- [ ] Pattern metadata:
  - Use cases (when to apply)
  - Pros/cons trade-offs
  - Related patterns (links)
  - Complexity level (simple/intermediate/advanced)
- [ ] Search patterns by problem domain

## Example
```bash
$ devsteps add pattern "FileDecorationProvider with custom URI" \\
  --use-case "Add badges to TreeView items" \\
  --code-example packages/extension/src/decorationProvider.ts:125-134 \\
  --tags vscode-extension,uri-scheme \\
  --implements BUG-017

✅ Created PATTERN-001 with code snippet from decorationProvider.ts
```

## Technical Notes
- Use syntax highlighting in markdown exports
- Support multiple code examples per pattern
- Link patterns to related lessons/decisions