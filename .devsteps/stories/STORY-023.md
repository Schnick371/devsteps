# Story: Interactive Lesson Capture Workflow

## User Story
As a developer completing a bug or spike, I want to be prompted to capture lessons learned so that valuable knowledge isn't lost after closing work items.

## Acceptance Criteria
- [ ] Add post-completion hook when marking Bug/Spike as `done`
- [ ] Interactive prompt: "Want to capture lesson learned? [Y/n]"
- [ ] Guided wizard collecting:
  - What was the problem?
  - What did you try? (failed approaches)
  - What worked? (solution)
  - What would you do differently?
- [ ] Auto-link LESSON to originating Bug/Spike (implements relationship)
- [ ] Suggest tags based on affected paths
- [ ] Option to create PATTERN from successful solution

## Technical Notes
```bash
$ devsteps update BUG-017 --status done
✅ BUG-017 marked as done

💡 Want to capture lesson learned? [Y/n] y

📝 Lesson Capture
Problem: TreeView badges not appearing
Context: VS Code FileDecorationProvider with custom URI scheme
Solution: Use Uri.from() instead of Uri.parse() for custom schemes
Tags: vscode-extension, uri-handling, debugging

✅ Created LESSON-001 (implements BUG-017)
```