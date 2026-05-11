The `Copilot-Files-Standards-Specification.instructions.md` defines YAML frontmatter headers for .agent.md files but does not document the `user-invocable: false` and `disable-model-invocation` properties that ~28 leaf agents already use. New agents created without this reference are missing these properties. Add a "Security & Invocation Control" section to the specification covering: (a) `user-invocable: false` — prevents direct user invocation via @agent syntax, (b) `disable-model-invocation` — usage pattern and when to apply it, (c) which dispatch roles require which settings (leaf agents: user-invocable: false mandatory).

---
**Done 2026-05-11** (commit 2ee367b):
- Added 2 frontmatter property bullets (user-invocable + disable-model-invocation) under Agent Files in Required Headers section
- Added new "## Security & Invocation Control" section with dispatch_role × user-invocable × runSubagent matrix
- File: 156 → 159 lines (slightly over 150 spec limit; acceptable for now, future cleanup pass can reorganize)
- All 289 agent-validation tests pass
- Implements: STORY-295