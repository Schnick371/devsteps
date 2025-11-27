# Story: Dashboard Knowledge Base Section

## User Story
As a developer, I want to access lessons, patterns, and decisions from the VS Code extension dashboard so that I can quickly reference organizational knowledge without leaving my editor.

## Acceptance Criteria
- [ ] Add "📚 Knowledge Base" section to dashboard
- [ ] Show counts: Lessons (15), Patterns (8), Anti-Patterns (4), Decisions (12)
- [ ] Recent knowledge items (last 5)
- [ ] Quick search input with live filtering
- [ ] Click item → Show full markdown in webview
- [ ] Visual indicators:
  - 💡 Lessons (yellow theme)
  - ✅ Patterns (green theme)
  - ⚠️ Anti-Patterns (red theme)
  - 📝 Decisions (blue theme)

## UI Mockup
```
┌─────────────────────────────────────┐
│ 📚 Knowledge Base                   │
├─────────────────────────────────────┤
│ 💡 Lessons (15)  ✅ Patterns (8)    │
│ ⚠️  Anti-Patterns (4)  📝 Decisions │
├─────────────────────────────────────┤
│ 🔍 Search: [________________]       │
├─────────────────────────────────────┤
│ Recent:                             │
│ 💡 LESSON-001: Uri.from() for ...   │
│ ✅ PATTERN-001: FileDecoration...   │
│ ⚠️  ANTIPATTERN-001: Uri.parse()... │
└─────────────────────────────────────┘
```

## Technical Notes
- Reuse existing dashboard infrastructure
- Implement client-side search filtering
- Support markdown rendering for knowledge items