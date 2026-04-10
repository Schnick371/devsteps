## Problem

Doc-Item .md Dateien unterstützen kein YAML Frontmatter. Metadaten wie Diataxis-Typ, verknüpfte Items, Autor und Status müssen separat über MCP-Calls gesetzt werden, was bei Copilot-generiertem Content unnötig umständlich ist.

## Lösung: Optionales YAML Frontmatter

Doc-Item .md Dateien dürfen ein optionales YAML Frontmatter enthalten:

```yaml
---
diataxis: reference
related_items:
  - STORY-267
  - EPIC-010
status: approved
author: the@devsteps.dev
tags:
  - security
  - rbcd
---
# Kerberos RBCD — UNC-Delegation im Bootstrap
...Inhalt...
```

## Schema-Regeln

- Frontmatter ist 100% optional — Dateien ohne Frontmatter bleiben valide
- Jedes Feld ist optional und kann weggelassen werden
- Leere Felder (`related_items: []` oder `related_items:`) sind valide → ignoriert

## Felder

| YAML Feld | Ziel-Mapping | Typ | Validierung |
|-----------|-------------|-----|-------------|
| `diataxis` | diataxis_type (skip Heuristik) | enum: tutorial, how-to, reference, explanation, architecture, research | Ungültiger Wert → Fehler |
| `related_items` | Auto-Link via `documents` Relation | string[] matching `^(STORY|TASK|BUG|EPIC|SPIKE|FEATURE|DOC|REQUIREMENT)-\\d+$` | Ungültiges Pattern → Fehler |
| `status` | Item-Status Mapping | enum: draft, approved (→done), review | Ungültiger Wert → Fehler |
| `author` | author Feld | string (email) | Kein Pattern erzwungen |
| `tags` | Merge mit CLI/MCP Tags | string[] | Keine Validierung |

## Fehlerbehandlung (KRITISCH)

- Frontmatter vorhanden aber kein valides YAML → **MCP/CLI MUSS Fehler zurückmelden**
- Ungültige Feldwerte (z.B. `diataxis: api-docs`) → **Fehler mit Hinweis auf gültige Werte**
- Unbekannte Felder → **Warnung** (nicht Fehler) für Vorwärtskompatibilität
- Fehlermeldung enthält Dateiname + Zeilennummer wenn möglich

## Integration in bestehende Tools

- `devsteps_docs_new` (Ingestion Mode, STORY-268): Extrahiert Frontmatter beim Import
- `devsteps_doc_read_content`: Gibt Frontmatter-Daten strukturiert zurück
- CLI `devsteps docs import`: Nutzt Frontmatter für automatische Klassifizierung + Verlinkung

## Acceptance Criteria

- [ ] `extractFrontmatter(content)` Funktion in `packages/shared` (Exists: TASK-537, erweitern)
- [ ] Zod-Schema für Frontmatter-Felder (Validierung)
- [ ] Fehler bei ungültigem YAML oder ungültigen Feldwerten
- [ ] Warnung bei unbekannten Feldern
- [ ] `devsteps_docs_new` nutzt Frontmatter beim Ingestion Mode
- [ ] `devsteps_doc_read_content` gibt Frontmatter-Daten zurück
- [ ] ≥6 Unit Tests: kein Frontmatter, valides Frontmatter, ungültiges YAML, ungültige Werte, unbekannte Felder, leere Felder