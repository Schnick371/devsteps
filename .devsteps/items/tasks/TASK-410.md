## Ziel

Standalone-Tool für die direkte Erstellung neuer DOC-Items aus Copilot-Chat. Führt den Nutzer via `next_steps` durch die Diataxis-Typenauswahl, bevor ein Item angelegt wird. Einziger Einstiegspunkt für das Erstellen von DOC-Items außerhalb des Import-Flows.

## Datei

`packages/mcp-server/src/handlers/docs-new.ts` (NEU)  
In `packages/mcp-server/src/server.ts` registrieren.

## Input-Schema (Zod)

```typescript
z.object({
  title: z.string().min(3).max(200),
  diataxis_type: z.enum(['tutorial','how-to','reference','explanation','architecture','research']).optional(),
  parent_bom_id: z.string().optional(),  // DocsMapNode ID (z.B. "ARCH-001")
})
```

## Ablauf: `diataxis_type` FEHLT

Tool erstellt kein Item. Antwortet stattdessen mit Guided-Flow:

```
next_steps: [
  "diataxis_type is required. Choose by answering:",
  "Is the user LEARNING a new skill from scratch? → tutorial",
  "Is the user APPLYING a skill to achieve a specific goal? → how-to",
  "Is the user LOOKING UP facts, options, or API details? → reference",
  "Is the user UNDERSTANDING context, background, or concepts? → explanation",
  "Is this an Architecture Decision Record (ADR)? → architecture",
  "Is this AI-generated research or spike output? → research",
  "Then call devsteps_docs_new again with your chosen diataxis_type."
]
```

## Ablauf: `diataxis_type` gegeben

1. Slug erzeugen: `title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')`
2. Dateipfad: `resolveWithin(workspaceRoot, 'docs/${diataxis_type}/${slug}.md')` ← **Gate-Note #2**
3. `resolveWithin` muss werfen, wenn `diataxis_type === '..'` oder Path-Traversal versucht wird
4. DOC-Item in `.devsteps/items/docs/DOC-NNN.json` erstellen mit:
   - `metadata.diataxis_type`
   - `metadata.source_path` (= errechneter Dateipfad)
5. Stub-Markdown-Datei anlegen mit Diataxis-Frontmatter (Template je Typ):

```markdown
---
type: tutorial|how-to|reference|explanation|architecture|research
title: "<title>"
devsteps_id: DOC-NNN
---

<!-- Content here -->
```

6. Falls `parent_bom_id` gegeben: neuen `DocsMapNode` unter diesem Parent einfügen
7. `next_steps` zurückgeben:
   ```
   "Created DOC item {ID} at docs/{type}/{slug}.md.
   Add content to the stub file and link to related backlog items via mcp_devsteps_link."
   ```

## Fehlerfälle

| Bedingung | Antwort |
|-----------|---------|
| Path-Traversal in `title` oder `diataxis_type` | `{ success: false, error: "Invalid path: output must stay within workspace root." }` |
| `parent_bom_id` existiert nicht in `docs-map.json` | `{ success: false, error: "BOM node {id} not found." }` |
| Datei am Zielpfad existiert bereits | `{ success: false, error: "File already exists at {path}. Use a different title or update the existing file." }` |

## Security

`resolveWithin(workspaceRoot, path)`:  
```typescript
const abs = path.resolve(workspaceRoot, userPath);
if (!abs.startsWith(workspaceRoot + path.sep)) {
  throw new Error(`Path traversal detected: ${userPath}`);
}
return abs;
```

## Tests

1. Ohne `diataxis_type` → guided next_steps zurückgegeben, kein Item erstellt
2. Mit `diataxis_type = 'tutorial'` → DOC-Item + Stub-Datei im richtigen Pfad
3. Title mit Sonderzeichen → korrekt slugifiziert
4. `parent_bom_id` nicht vorhanden → Fehler
5. Path-Traversal durch title (`../../etc/passwd`) → `resolveWithin` wirft
6. Sonderzeichen-only-Title (z.B. `"---"`) → Slug wird non-empty Default (z.B. `untitled`)
7. Doppelaufruf mit gleichem Titel → Fehler (Datei existiert bereits)

## Voraussetzungen

TASK-404 abgeschlossen (für `resolveWithin`, `generateItemId`).

## Referenz

`tmp/SPIKE-044-MCPDialog-Research-Brief.md` §6 (`devsteps_docs_new` guided flow) + Gate-Note #2 (Path-Traversal Guard) + Gate-Note #5 (Slug Sanitization)