# Research Brief: MD-Dokument-Revisionen in DevSteps

Untersucht ob ein proprietäres Revisionssystem für Work-Item-Markdown-Dateien eingeführt werden soll, oder ob Git als Revisions-Backbone ausreicht.

## Kernergebnis

**REJECT** proprietäres Copy-on-Write-System. **ADOPT** Git-MCP (Option B) + 3 minimale JSON-Felder in ItemMetadata (Option C).

Vollständiger Research Brief: `tmp/REVISION-MD-Research-Brief.md`

## Wichtigstes Gegenargument gewogen

Git speichert bereits alle MD-Revisionen lossless (Delta-Kompression, ~10% der CoW-Größe). Ein proprietäres System würde eine zweite History-Quelle schaffen (Two-Source-of-Truth) und 4–6 Wochen Aufwand erfordern — für ein Problem das Ø 0.4 Revisionen/Story betrifft.

## Empfohlene Follow-up Items

- BUG: WRITE-ORDER in update.ts (JSON vor MD geschrieben)
- STORY: 3 JSON-Felder (description_hash, description_updated, description_edit_count)
- TASKs: AI-GUIDE, Git-MCP Docs, aspect-staleness Protocol, CLI Display, Agent-Protocol Footnote

## Ergebnis (Gate PASS 0.87)

Research Brief: `tmp/REVISION-MD-Research-Brief.md`

Entscheidung: REJECT Option D (Custom CoW). ADOPT Option B (Git-MCP) + TRIAL Option C (3 JSON-Felder).

Follow-up Items: BUG-079, STORY-240, TASK-415, TASK-416, TASK-417, TASK-418