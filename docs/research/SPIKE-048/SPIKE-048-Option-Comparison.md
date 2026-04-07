# SPIKE-048 — Entscheidungsmatrix: Revisions-Optionen A–D

<!-- bom-node: ARCH-SPIKE048-OPT | parent: ARCH-SPIKE048 | doc_subtype: reference | status: approved -->
<!-- devsteps_items: SPIKE-048 | created_at: 2026-04-04 | classification: research/spike/library-eval -->

**Item:** SPIKE-048  
**Typ:** Referenz-Dokument (L2 unter Research Brief)  
**Datum:** 2026-04-04  
**Status:** approved — Gate PASS 0.87

---

## Übersicht der bewerteten Optionen

| Option | Bezeichnung | Kern-Mechanismus | Aufwand | Empfehlung |
|--------|-------------|-----------------|---------|------------|
| **A** | Status Quo | Kein Revisionssystem; Git nur für menschliche Inspektion | 0 | HOLD — akzeptabel für Menschen, unzureichend für AI |
| **B** | Git-MCP-Server | Externaler MCP-Server für Git-History-Zugang durch AI-Agenten | 1–2 Tage (nur Doku) | **ADOPT** |
| **C** | 3 JSON-Felder | `description_hash`, `description_updated`, `description_edit_count` in `ItemMetadata` | 4–6 Std | **TRIAL → ADOPT** |
| **D** | Custom CoW Store | Vollständiges Revisionssystem in `.devsteps/` | 4–6 Wochen | **HOLD** — ablehnen |

---

## Option A: Status Quo

### Was passiert heute
- MD-Datei wird direkt überschrieben via `writeFileSync` (packages/shared/src/core/update.ts)
- `metadata.updated` setzt bei JEDER Feldänderung (Status, Title, Priority, Tags, Description)
- Git speichert History via normale Commits — kein programmatischer Zugriff durch Applikation
- `commits: []` Feld in ItemMetadata: immer leer (BUG-079 betrifft nur write-order, kein semantischer Commit-Link)

### Risiko: AI-Staleness-Blindness
Coord-Agent dispatcht exec-planner mit STORY-XYZ Beschreibung zum Zeitpunkt T0. Anforderung wird zwischen Sessions geändert (T1). Coord dispatcht exec-impl in Session B mit AKTUELLEM Stand — der sich von exec-planners Briefing unterscheidet. Kein Agent kann diese Abweichung erkennen.

**Severity:** LOW in Single-Session-Sprints; HIGH bei Multi-Session-Epics.

---

## Option B: Git-MCP-Server (ADOPT) 

### Empfohlene Implementation

```json
// VS Code settings.json oder mcp.json
{
  "mcpServers": {
    "git": {
      "command": "uvx",
      "args": ["mcp-server-git", "--repository", "${workspaceFolder}"]
    }
  }
}
```

### Git-MCP Tools für AI-Agenten

| Tool | DevSteps-Relevanz | Beispiel |
|------|------------------|---------|
| `git_log` | Alle Commits die eine MD-Datei ändern | `git log --follow -- .devsteps/items/stories/STORY-042.md` |
| `git_show` | Inhalt einer MD-Datei zu spezifischem Commit | `git show HEAD~2:.devsteps/items/stories/STORY-042.md` |
| `git_diff` | Was hat sich in einer MD-Datei geändert? | `git diff HEAD~1 HEAD -- .devsteps/items/stories/STORY-042.md` |
| `git_blame` | Wer hat welche Zeile wann geschrieben? | — |

### Vorteile vs. Nachteile

| + Vorteile | - Nachteile |
|------------|-------------|
| Zero Code Changes im DevSteps-Monorepo | Externe Konfiguration erforderlich |
| Vollständige, lossless History (bereits vorhanden) | Nicht verfügbar bei `git_integration: false` |
| Delta-Kompression: ~10% der CoW-Größe | Unbegriffene Changes (uncommitted) unsichtbar |
| Prodaktionsreif (#12 PulseMCP, 3.4M Users, Jan 2026) | Semantisch unstrukturiert: ein Commit kann 100 unzusammenhängende Änderungen bündeln |
| GitLens 17.5 (Sep 2025) bundled in VS Code Copilot | — |

---

## Option C: 3 minimale JSON-Felder (TRIAL → ADOPT)

### Schema-Erweiterung (packages/shared/src/schemas/index.ts)

```typescript
export const ItemMetadata = z.object({
  // ... existing fields ...
  
  // NEW: description-specific change tracking
  description_hash: z.string().optional().default(""),
  // SHA-256 (erste 16 Hex-Chars) des MD-Inhalts nach normalizeMarkdown()
  // Gesetzt in update.ts nach MD-Write; in add.ts bei Erstellung
  
  description_updated: z.string().datetime().optional(),
  // ISO 8601 Timestamp — NUR bei description/append_description Änderungen
  // Getrennt von metadata.updated (das setzt bei ALLEN Feldänderungen)
  
  description_edit_count: z.number().int().default(0),
  // Incrementiert bei jedem description/append_description Update
  // description_edit_count > 3 → Empfehlung: FULL triage
});
```

### AI-Agent Workflow mit description_hash

```
1. coord dispatcht exec-planner mit item_id + description_hash (aus metadata)
   → DPF: { item_id: "STORY-042", description_hash: "a4f8b2c1d3e5f7a9" }

2. exec-planner schreibt plan basierend auf AKTUELLEM description-Inhalt
   → Plan enthält: snapshot_hash: "a4f8b2c1d3e5f7a9"

3. Wenn aspect-staleness in Ring 2 dispatcht wird:
   → Prüft: exec-planner snapshot_hash == aktueller metadata.description_hash?
   → GLEICH: Requirements stabil seit Planung
   → VERSCHIEDEN: Planning Drift! Anforderung hat sich geändert → WARNUNG

4. exec-impl prüft ebenfalls am Ende:
   → Wurden Requirements während der Implementierung geändert?
```

### Vorteile vs. Nachteile

| + Vorteile | - Nachteile |
|------------|-------------|
| Funktioniert ohne Git (`git_integration: false`) | Keine vollständige History (nur aktueller Hash) |
| Präzise description-spezifisch | Hash nicht menschenlesbar |
| Minimal-Overhead (< 50 Bytes/Item) | edit_count ist kumulativ, kein Zeitstempel der einzelnen Edits |
| LOCOMO (Apr 2026): 100x token-effizienter als Full-History | Kein Rollback möglich (Git für Rollback nutzen) |
| Schließt AI-Staleness-Gap die Option B nicht schließt | Schema-Migration nötig (auto-migrate, idempotent) |

### WRITE-ORDER: Voraussetzung (BUG-079 ✅ already fixed)

```typescript
// update.ts — KORREKTE Reihenfolge nach BUG-079 Fix:
// 1. MD-Datei schreiben
writeFileSync(descriptionPath, normalizeMarkdown(args.description));
// 2. Hash aus geschriebener Datei berechnen
const hash = createHash('sha256').update(readFileSync(descriptionPath, 'utf-8')).digest('hex').slice(0, 16);
// 3. Metadata updaten
metadata.description_hash = hash;
metadata.description_updated = getCurrentTimestamp();
metadata.description_edit_count = (metadata.description_edit_count ?? 0) + 1;
// 4. JSON-Datei schreiben
writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
```

---

## Option D: Custom Copy-on-Write Store (HOLD — abgelehnt)

### Warum abgelehnt

1. **Two-Source-of-Truth:** Jedes `.md`-File existiert bereits vollständig in Git-History. Ein zweiter Store dupliziert diese History und schafft Divergenzrisiko.

2. **Implementierungsaufwand > Nutzen:**
   - `RevisionStore.ts`: 150–200 LOC
   - `RevisionReader.ts`: 100–150 LOC  
   - GC/Compaction: 80–120 LOC
   - auto-migrate: 60–100 LOC
   - Tests (Coverage 0% für write-path): 200–300 LOC
   - **Total: 620–920 LOC**, 4–6 Wochen Entwicklung

3. **Data-Corruption-Risiko:** Dritter synchroner Write in add.ts/update.ts (JSON + MD → jetzt auch Revision-File). Crash-Fenster erweitert sich.

4. **Ø 0.4 Revisionen/Story:** Items ändern sich selten. Ein vollständiges Revisionssystem wäre zu 99% leer.

5. **OWASP A03:** Jede Custom-Shell-Interaktion mit git erhöht Command-Injection-Risiko.

### Conditional Revisit

Option D kann neu bewertet werden wenn:
- Ø Revisionen/Item > 5 (signifikante Änderungsrate)
- `git_integration: false` Nutzergruppe > 20% aller Nutzer
- Compliance-Anforderungen (Audit-Trail jenseits Git) entstehen
- Performance-Probleme mit Git-MCP-Server bei großen Repositories

---

## Entscheidungs-Flowchart

```
 Brauche ich historische MD-Inhalte für AI-Agenten?
 │
 ├─ Nein → Status Quo OK (Option A)
 │
 └─ Ja
    │
    ├─ git_integration: true (Standard)?
    │   └─ Ja → Option B (Git-MCP) PLUS Option C (für non-committed detection)
    │
    └─ git_integration: false?
        └─ Option C ALLEINE (JSON-Felder als Fallback)
```

**Empfehlung: B + C in Kombination** (Non-git-environment-constraint aus aspect-constraints belegt dass B alleine unzureichend ist).

---

*Klassifikation: `research/spike/library-eval` · Scope: `module` · Cluster: `revision-md-001`*  
*Relates-to: SPIKE-048, STORY-240, BUG-079*
