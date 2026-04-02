---
doc_id: doc-architecture
title: SSOT Documentation Architecture — Design & Governance
diataxis: explanation
author: th
status: active
last_verified: 2026-03-31
related_items: [SPIKE-027, STORY-366, STORY-367, STORY-368]
---

# SSOT Documentation Architecture — Design & Governance

> **Version:** 1.0.0
> **Created:** 2026-03-31
> **Author:** Thomas Hertel + GitHub Copilot (Competitive Tier Analysis)
> **Scope:** compose4tc — all 42 markdown files in `Documentation/`

---

## 1. Ausgangslage — Root-Cause-Analyse

### Ist-Zustand

| Metrik | Wert |
|--------|------|
| Markdown-Dateien in `Documentation/` | 42 |
| Dateien mit YAML-Frontmatter | 0 |
| Tooling für Docs-as-Data | 0 |
| Veraltete Aussagen (identifiziert) | 5+ |
| Widersprüche zwischen Docs | 3 bekannt |

### Problem-Cluster

1. **Kein semantischer Anker:** Kein Datei hat maschinenlesbare Metadaten — keine `doc_id`, kein `diataxis`-Typ, kein `last_verified`.
2. **Supersession ohne SSOT:** Mehrere Dokumente beschreiben dasselbe Thema ohne klare "Quelle der Wahrheit".
3. **Veraltung nicht erkennbar:** Kein Staleness-Detector, kein Review-Zyklus.
4. **Keine Lens-Projektion:** Wer nur PSRemoting-Inhalte sucht, muss 42 Dateien manuell scannen.
5. **DevSteps-Lücke:** Es gibt keinen `doc`-Item-Typ — Dokumentation bleibt unseichtbar im Backlog.

---

## 2. Forschungssynthese

### 2.1 Recherchequellen (14 Quellen analysiert)

- **Diataxis.fr** — Classification framework (Daniele Procida, 2021)
- **Write the Docs** — Technical writing community standards
- **Divio docs-as-code** — Code-first documentation pipeline
- **Microsoft Docs Architecture** — Enterprise docs.microsoft.com structure
- **Backstage TechDocs** — Spotify's internal documentation portal model
- **DITA Specification** — Darwin Information Typing Architecture (lightweight subset)
- **Docusaurus / MkDocs** — Static site generators with frontmatter support
- **Vale linter** — Prose linting / frontmatter enforcement
- **AsciiDoc vs Markdown** — Format trade-offs for technical documentation
- **Google Developer Documentation Style Guide**
- **The GitLab Handbook** — SSOT principles for ops teams
- **OpenAPI Docs-as-Data** — Machine-readable API documentation
- **Arc42 Templates** — Architecture documentation structure
- **Keep a Changelog** — Changelog format standards

### 2.2 Context-Analyst-Ergebnisse

Aus `analyst-context` Mandaten (TASK-999-Analyse):

- DevSteps MCP hat `write_analysis_report` + `read_analysis_envelope` — nutzbar als Doc-Portal-Backend
- `.devsteps/context/` ist AI-Operationsgedächtnis, NICHT Governance-Dokumentation
- 5 Haupt-Wissensbereiche identifiziert: Bootstrap, Node-Deployment, Remote-Management, Config-Management, Container
- Keine `canonical-for` / `derived-from` Relation-Typen vorhanden

---

## 3. Architectural Decision Records (ADRs)

### ADR-001: Diataxis als Klassifikationsframework

**Status:** Accepted  
**Kontext:** Wir brauchen eine konsistente Kategorisierung aller 42 Docs.  
**Entscheidung:** Diataxis (tutorial / how-to / reference / explanation) als primäres Klassifikationsschema.  
**Begründung:** Diataxis ist etabliert, werkzeugagnostisch, und deckt genau den Bedarf technischer Deployment-Dokumentation.  
**Abgelehnte Alternativen:** DITA (zu schwer), Arc42 (auf Software-Architektur fokussiert).

### ADR-002: `doc` Item-Typ in DevSteps (Phase 2)

**Status:** Proposed (gates on SPIKE-027)  
**Kontext:** Dokumentation ist derzeit unsichtbar im DevSteps-Backlog.  
**Entscheidung:** Neuer `doc`-Typ für DevSteps `config.json` — Canonical Documentation Nodes.  
**Begründung:** Stories und Tasks können dann `canonical-for: doc-ID` verlinken — lückenlose Traceability.  
**Risk:** Server-Code könnte TypeScript-Enum haben (hardcoded) — SPIKE-027 klärt das.

### ADR-003: YAML-Frontmatter als primäres Docs-as-Data Schema

**Status:** Accepted  
**Kontext:** Metadaten müssen maschinenlesbar sein ohne Format-Migration.  
**Entscheidung:** YAML-Frontmatter (7 Pflichtfelder, 8 optionale) als primäres Schema für alle Docs.  
**Begründung:** Nativ in Markdown, kompatibel mit allen Markdown-Parsern, kein Vendor-Lock.

### ADR-004: Ephemere Lens-Views (nie committen)

**Status:** Accepted  
**Kontext:** Doku-Lupe soll gefilterte Ansichten liefern, ohne das Repo zu verschmutzen.  
**Entscheidung:** Lens-Views werden in `.devsteps/lens/` generiert — ephemer, nie committed (`/.devsteps/lens/` in `.gitignore`).  
**Begründung:** Lens sind Projections aus kanonischen Nodes — jedes Committen wäre redundant.

### ADR-005: Harte Grenze `.devsteps/context/` vs. `Documentation/`

**Status:** Accepted  
**Kontext:** AI-Agents schreiben in `.devsteps/context/` operative Notizen.  
**Entscheidung:** `.devsteps/context/` = AI-Operationsgedächtnis (Audience: Agents). `Documentation/` = Governance-Nodes (Audience: Engineers).  
**Begründung:** Keine Vermischung verhindert "AI-Contamination" in Docs die Menschen lesen.

---

### ADR-006: 3-Ebenen Zoom-Dokumentation (Lupe-Prinzip)

**Status:** Accepted  
**Kontext:** Dieselbe Information wird von sehr unterschiedlichen Nutzern konsumiert: ein Operator sucht schnell den TUI-Befehl, ein Newcomer braucht das Konzept, ein Debugger braucht die Schritt-Details.  
**Entscheidung:** Jeder Themenbereich wird in 3 Zoom-Ebenen strukturiert:
- **L1 Schnellreferenz** (`reference`) — kompakt, tabellenfokussiert, alle Phasen auf einen Blick
- **L2 Konzept** (`explanation`) — Zusammenhänge, Entscheidungen, Hintergründe
- **L3 Runbook** (`how-to`) — prozedural, vollständig, mit Troubleshooting-Abschnitt

`README.md` (dieses Verzeichnis) ist **L0** — reiner Navigationsknoten, kein inhaltliches Dokument.  
**Bidirektionale Links:** Jedes Dokument verlinkt zur nächst-höheren und nächst-tieferen Ebene (Zoom-In / Zoom-Out).  
**Begründung:** Aus Diátaxis complex-hierarchies: Landing Pages sind Navigation-Nodes, kein Inhalt. User-first — Struktur folgt Informationsbedarf, nicht dem Diátaxis-Schema.  
**Abgelehnte Alternative (noch nicht):** Unterordner (`deployment/`, `remote-management/`) — erst wenn eine Topic-Gruppe ≥ 8 Dateien erreicht (→ ADR-007 wenn der Zeitpunkt kommt).

---

## 4. Diataxis-Klassifikation der bestehenden Docs

| Datei | Typ | Status |
|-------|-----|--------|
| README.md (Documentation/) | reference | ✅ Frontmatter vorhanden |
| DOC-SCHICHTARCHITEKTUR.md | explanation | ✅ Frontmatter vorhanden — Neu: BOM/TSD-Konzept |
| DEPLOYMENT-PHASE1-BOOTSTRAP.md | how-to | ✅ Frontmatter vorhanden |
| DEPLOYMENT-PHASE2-INIT.md | how-to | ✅ Frontmatter vorhanden |
| DEPLOYMENT-PHASE3-INSTALL.md | how-to | ✅ Frontmatter vorhanden |
| DEPLOYMENT-PHASE4-DEPLOY.md | how-to | ✅ Frontmatter vorhanden |
| DEPLOYMENT-LIFECYCLE.md | explanation | ✅ Frontmatter vorhanden |
| DEPLOYMENT-QUICK-REFERENCE.md | reference | ✅ Frontmatter vorhanden |
| REMOTE-MANAGEMENT-GUIDE.md | how-to | ✅ Frontmatter vorhanden |
| DOC-ARCHITECTURE.md (diese Datei) | explanation | ✅ Frontmatter vorhanden |
| PS7-REMOTE-ENFORCEMENT.md | reference | ✅ Frontmatter vorhanden |
| NODE-TYPES.md | reference | ✅ Frontmatter vorhanden |
| SELF-EXTRACTING-INSTALLER.md | how-to | ✅ Frontmatter vorhanden |
| CLI-API-ARCHITECTURE.md | reference | ✅ Frontmatter vorhanden (status: draft) |
| CONFIG-MANAGEMENT.md | reference | ✅ Frontmatter vorhanden (status: draft) |
| WORKSPACE-CONFIGURATION.md | how-to | ✅ Frontmatter vorhanden |
| BACKUP-RESTORE-WORKFLOWS.md | how-to | ✅ Frontmatter vorhanden |
| PS51-BOOTSTRAP-COMPATIBILITY-MATRIX.md | reference | ✅ Frontmatter vorhanden |
| MODULE-DEPLOYMENT-STRATEGY.md | explanation | ✅ Frontmatter vorhanden |
| *(29 weitere — organische Migration)* | mixed | ⬜ P3 |

---

## 5. SSOT Canonical Node Model

### Supersessions-Protokoll

Ein **Canonical Node** ist die einzige autorisierte Quelle für ein Thema:

```
DEPLOYMENT-PHASE1-BOOTSTRAP.md        ← Canonical Node (Phase 1)
  ↑ derived-from              ← Context-Dokument
  DEPLOYMENT-LIFECYCLE.md     ← Erklärung des Lifecycle-Modells
  PS7-REMOTE-ENFORCEMENT.md   ← PS7-Enforcement-Spezifikation
```

**Regeln:**
1. Eine Frage hat genau EINEN Canonical Node.
2. Alle anderen Dokumente, die dasselbe ansprechen, verlinken auf den Node (nie kopieren).
3. Veraltete Dokumente erhalten `status: deprecated` + `superseded-by: <canonical-node>`.
4. `DEPLOYMENT-PHASE1-BOOTSTRAP.md` ist der Root-Canonical-Node für alle Phase-1/Bootstrap-Fragen.

---

## 6. Frontmatter-Schema

### 6.1 Pflichtfelder (Phase 1 — sofort)

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `doc_id` | string | Kebab-case eindeutige ID (z.B. `workspace-bootstrap-guide`) |
| `title` | string | Menschenlesbare Überschrift |
| `diataxis` | enum | `tutorial` \| `how-to` \| `reference` \| `explanation` |
| `author` | string | Initialen oder Login |
| `status` | enum | `draft` \| `active` \| `deprecated` |
| `last_verified` | date | ISO-Datum der letzten Verifikation (`YYYY-MM-DD`) |
| `related_items` | list | DevSteps-IDs (z.B. `[EPIC-007, BUG-200]`) |

### 6.2 Optionale Felder (Phase 2 — später)

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `supersedes` | string | `doc_id` des abgelösten Dokuments |
| `superseded-by` | string | `doc_id` des Nachfolge-Dokuments |
| `canonical-for` | list | Themen für die dieses Dokument SSOT ist |
| `derived-from` | string | `doc_id` des Quelldokuments |
| `audience` | list | `developer` \| `operator` \| `AI` |
| `tags` | list | Freie Tags (z.B. `[powershell, bootstrap, winrm]`) |
| `review-cycle-days` | number | Review-Intervall in Tagen (default: 90) |
| `devsteps-doc-id` | string | DevSteps `doc` Item-ID (Phase 2) |

### 6.3 Vollständiges Beispiel

```yaml
---
doc_id: workspace-bootstrap-guide
title: Workspace Bootstrap Guide
diataxis: how-to
author: th
status: active
last_verified: 2026-03-31
related_items: [EPIC-007, STORY-361, BUG-200, BUG-201]
canonical-for: [workspace-setup, bootstrap-phase-1, sfx-installer]
audience: [operator, developer]
tags: [powershell, bootstrap, winrm, node-init]
review-cycle-days: 90
---
```

### 6.4 Validierung: `Test-DocFrontmatter.ps1`

```powershell
function Test-DocFrontmatter {
    param([string]$Path)
    $content = Get-Content $Path -Raw
    if ($content -notmatch '^---\n(.+?)\n---') {
        throw "MISSING FRONTMATTER: $Path"
    }
    $yaml = [regex]::Match($content, '^---\n(.+?)\n---', 'Singleline').Groups[1].Value
    $required = @('doc_id', 'title', 'diataxis', 'author', 'status', 'last_verified', 'related_items')
    $missing = $required | Where-Object { $yaml -notmatch "${_}:" }
    if ($missing) { throw "MISSING FIELDS in ${Path}: $($missing -join ', ')" }
}
```

---

## 7. AI Agent Workflow Rules

### 7.1 exec-doc Pflichten

Wenn `exec-doc` ein neues Markdown-Dokument erstellt:

1. **Frontmatter ZUERST** — alle 7 Pflichtfelder, keine Ausnahmen
2. **`diataxis` Klassifikation wählen:**
   - `tutorial` — schrittweise lernorientiert (Lernzweck, bricht nichts wenn man es befolgt)
   - `how-to` — zielorientierte Schritte (echte Aufgabe, reales Ziel)
   - `reference` — Informationsnachschlage (vollständig, präzise, trocken)
   - `explanation` — Konzeptverständnis (Kontext, Hintergrund, Zusammenhänge)
3. **`related_items`** — alle DevSteps-Items die den Inhalt betreffen
4. **Phase 2:** wenn `doc`-Typ aktiv → `mcp_devsteps_add(type=doc)` + `mcp_devsteps_link(canonical-for)` zum Code-Story

### 7.2 gate-reviewer Pflichtprüfungen

- `last_verified` auf aktuelles Datum gesetzt? (Darf nie >90 Tage vom Commit-Datum zurückliegen)
- Frontmatter vorhanden und vollständig? FAIL wenn fehlend
- Keine veralteten Claim über andere Docs (z.B. 5-Phasen wo 4-Phasen-Modell gilt)?

### 7.3 Lens-Safety-Regeln

- AI-Agents lesen **Canonical Nodes** in `Documentation/` — nie aus `.devsteps/lens/`
- `.devsteps/lens/` sind Laufzeit-Projektionen — ephemer, nie committen
- `.devsteps/context/` ist AI-Working-Memory — nie in `Documentation/` kopieren

---

## 8. DevSteps `doc` Item-Typ (Phase 2 — SPIKE-027 required)

### 8.1 Proposed `config.json` Entry

```json
{
  "type": "doc",
  "label": "Documentation Node",
  "description": "Canonical documentation node — SSOT for a subject area",
  "metadata": {
    "profile": "doc",
    "required_fields": ["doc_id", "diataxis", "status", "last_verified"],
    "suggested_tags": ["how-to", "reference", "explanation", "tutorial"]
  }
}
```

### 8.2 Neue Relation-Typen

| Relation | Bedeutung |
|----------|-----------|
| `canonical-for` | Story/Task: dieses item hat kanonisches doc als output |
| `derived-from` | Doc: abgeleitet von einem anderen Canonical Node |
| `supersedes` | Doc: ersetzt ein älteres Dokument |
| `superseded-by` | Doc: wurde abgelöst durch dieses Dokument |

### 8.3 MCP Tool Proposals (Tier 1 — Minimal Viable)

| Tool | Beschreibung |
|------|-------------|
| `mcp_devsteps_doc_validate` | Prüft Frontmatter-Pflichtfelder für eine Doc-Datei |
| `mcp_devsteps_doc_list` | Listet Doc-Nodes nach `diataxis`, `status`, `canonical-for` |
| `mcp_devsteps_doc_coverage` | Zeigt Coverage-Matrix: welche Themen sind dokumentiert |

### 8.4 MCP Tool Proposals (Tier 2 — Staleness Detection)

| Tool | Beschreibung |
|------|-------------|
| `mcp_devsteps_doc_stale` | Listet Docs mit `last_verified` > N Tage |
| `mcp_devsteps_doc_link_check` | Prüft ob alle `related_items` noch existieren |

### 8.5 MCP Tool Proposals (Tier 3 — Lens Engine)

| Tool | Beschreibung |
|------|-------------|
| `mcp_devsteps_lens_build` | Generiert Lens-View (ephemer, `.devsteps/lens/`) |
| `mcp_devsteps_lens_query` | Sucht Docs nach Metadaten-Kombination |

---

## 9. Doku-Lupe (Doc-Lens) Konzept

### 9.1 Definition

Eine **Doku-Lupe** ist eine ephemere, gefilterte Projektion der Dokumentationsbasis auf einen spezifischen Fokus. Sie extrahiert relevante Abschnitte aus mehreren Canonical Nodes und aggregiert sie in eine temporäre Lens-Datei.

### 9.2 Lens-Format

```yaml
# .devsteps/lens/winrm-setup-lens.md (EPHEMERAL — autocommit blocked!)
lens_query: "topic=winrm AND diataxis=how-to"
sources:
  - REMOTE-MANAGEMENT-GUIDE.md#WinRM-Setup
  - DEPLOYMENT-PHASE1-BOOTSTRAP.md#Stage-1-PSRemoting
generated: 2026-03-31T20:00:00Z
expires: 2026-04-01T20:00:00Z
```

### 9.3 `Build-DocLens.ps1` PowerShell PoC

```powershell
function Build-DocLens {
    param(
        [string]$Topic,
        [string[]]$Diataxis,
        [string]$OutputDir = '.devsteps/lens'
    )
    $docs = Get-ChildItem 'Documentation/*.md' | Where-Object {
        $fm = Get-DocFrontmatter $_
        $fm.tags -contains $Topic -or $fm.'canonical-for' -contains $Topic
    }
    if ($Diataxis) { $docs = $docs | Where-Object { (Get-DocFrontmatter $_).diataxis -in $Diataxis } }
    $lensContent = $docs | ForEach-Object {
        "## $(((Get-DocFrontmatter $_).title))`n`n$(Get-RelevantSection $_ $Topic)"
    }
    $outFile = Join-Path $OutputDir "${Topic}-lens.md"
    $lensContent | Set-Content $outFile
    Write-Host "Lens generated: $outFile (ephemeral — do NOT commit)"
}
```

### 9.4 Safety-Regeln

1. **NEVER commit** `.devsteps/lens/` Dateien — `.gitignore` Eintrag Pflicht
2. Lens-Dateien haben immer `expires` Timestamp — nach Ablauf löschen
3. Lens-Queries sind Read-only — niemals als Editing-Target verwenden
4. AI-Agents lesen nur Canonical Nodes — Lens ist für Human-Consumption

---

## 10. Doc Coverage Report

### Format

```
Documentation Coverage Matrix — 2026-03-31

Diataxis Distribution:
  tutorial     :  2 (5%)
  how-to       : 18 (43%)
  reference    : 14 (33%)
  explanation  :  8 (19%)

Frontmatter Coverage:
  ✅ Vorhanden : 4  (10%)
  ⬜ Fehlend   : 38 (90%)

Status Distribution:
  active      : 4
  draft       : 0
  deprecated  : 0
  unclassified: 38
```

---

## 11. Staleness Detection

### Algorithmus

```
FOR EACH doc IN Documentation/
  IF doc.last_verified IS NULL → ALERT "no frontmatter"
  ELSE IF (TODAY - doc.last_verified) > review_cycle_days → ALERT "stale"
  IF doc.related_items EXISTS
    FOR EACH item_id IN doc.related_items
      IF mcp_devsteps_get(item_id).status == "obsolete" → ALERT "linked item obsolete"
```

### Trigger-Events (Phase 3)

- Git-Commit-Hook: beim Push warnen wenn Docs >`review-cycle-days` Tage ohne `last_verified` Update
- Sprint-Start: `analyst-staleness` prüft alle Docs die mit dem Sprint-Scope verlinkt sind

---

## 12. Migrationsstrategie

### Prinzip: Organisch — keine Bulk-Migration

**Verboten:** Alle 42 Dateien auf einmal mit Frontmatter versehen (zu hohes Fehlerrisiko, kein Review-Zyklus).

**Erlaubt:** Frontmatter beim nächsten Touch hinzufügen:
- Beim Fix → Frontmatter zuerst verifikation, dann Fix
- Beim Task → exec-doc fügt Frontmatter als ersten Commit ein
- Beim Review → gate-reviewer pruft ob Frontmatter korrekt ist für Dateien die im Scope liegen

### Phase 1 — Sofort (done)

- ✅ `DEPLOYMENT-PHASE1-BOOTSTRAP.md` — Frontmatter
- ✅ `DEPLOYMENT-LIFECYCLE.md` — Frontmatter
- ✅ `REMOTE-MANAGEMENT-GUIDE.md` — Frontmatter

### Phase 1 — In Arbeit

- ⬜ `PS7-REMOTE-ENFORCEMENT.md`
- ⬜ `NODE-TYPES.md`
- ⬜ `SELF-EXTRACTING-INSTALLER.md` (verbunden mit BUG-117 Fix)

### Phase 2 (nach SPIKE-027)

- STORY-366: DevSteps `doc`-Typ + Validierung + Frontmatter-Tests
- STORY-367: `Build-DocLens.ps1` Doku-Lupe
- STORY-368: DevSteps MCP `doc_*` Tools

---

## 13. 3-Phasen-Rolloutplan

### Phase 1: Foundations (jetzt)

**Ziel:** Frontmatter-Schema einführen, erste Canonical Nodes auszeichnen  
**Tools:** PowerShell + manuell  
**Deliverables:**  
- Frontmatter-Schema dokumentiert (diese Datei)
- 3–5 Pilot-Docs mit Frontmatter (Bootstrap, Lifecycle, Remote-Guide)
- copilot-instructions.md aktualisiert (exec-doc + gate-reviewer Regeln)
- `doc`-Zeile in Item-Types-Tabelle (mit SPIKE-027-Guard)

### Phase 2: Tooling (nach SPIKE-027)

**Ziel:** DevSteps-Integration + Lens-Engine  
**Items:** STORY-366, STORY-367, STORY-368  
**Deliverables:**  
- DevSteps `doc`-Typ aktiv
- `Test-DocFrontmatter.ps1` in CI (optional)
- `Build-DocLens.ps1` PoC
- MCP Tier-1 Tools

### Phase 3: Coverage (organisch)

**Ziel:** Alle 42 Docs haben Frontmatter  
**Methode:** Organisch bei jedem Touch  
**Deliverables:**  
- 100% Frontmatter-Coverage
- MCP Tier-2/3 Tools (Staleness + Lens Engine)
- Doc-Coverage-Dashboard in VS Code Extension

---

## 14. Constraint & Risk Matrix

| Constraint | Typ | Beschreibung |
|-----------|-----|-------------|
| HC-1 | Hard | SPIKE-027 muss vor `mcp_devsteps_add(type=doc)` abgeschlossen sein |
| HC-2 | Hard | `DEPLOYMENT-PHASE1-BOOTSTRAP.md` darf Phase 1 NICHT gesplittet werden (~15 inbound links) |
| HC-3 | Hard | `.devsteps/lens/` wird NIEMALS committed — `.gitignore` Pflicht |
| HC-4 | Hard | `.devsteps/context/` ↔ `Documentation/` Grenze nie überschreiten |
| SC-1 | Soft | Review-Zyklus 90 Tage empfohlen (konfigurierbar per Doc) |
| SC-2 | Soft | Lens-Views nach 24h löschen (konfigurierbar) |

| Risiko | Wahrscheinlichkeit | Schwere | Mitigation |
|--------|-------------------|---------|-----------|
| DevSteps `doc`-Typ hardcoded (HC-1) | Mittel | Hoch | SPIKE-027 klärt vor STORY-366 |
| Frontmatter auf 40 Docs veraltet | Hoch | Niedrig | Organische Migration, kein Druck |
| Lens-Datei versehentlich committed | Niedrig | Mittel | `.gitignore` + pre-commit hook |
| AI schreibt in `.devsteps/context/` statt `Documentation/` | Mittel | Mittel | copilot-instructions.md Boundary-Regel |

---

## 15. Feature Request Brief für DevSteps-Team

> Dieses Dokument enthält Anforderungen die an das DevSteps-Entwicklungsteam weitergegeben werden können.

### RQ-001: `doc` Item-Typ

**Priorität:** Hoch  
**Beschreibung:** Neuer Item-Typ `doc` für DevSteps, der Canonical Documentation Nodes im Backlog sichtbar macht.  
**Acceptance Criteria:**
- `mcp_devsteps_add(type=doc)` funktioniert
- `doc`-Items haben `doc_id`, `diataxis`, `status`, `last_verified` Metadaten-Profile
- `mcp_devsteps_list(type=doc)` filtert korrekt

### RQ-002: `canonical-for` Relation-Typ

**Priorität:** Hoch  
**Beschreibung:** Neuer Relationstyp `canonical-for` ermöglicht Story/Task → Doc-Node Traceability.  
**Context:** Story `STORY-366` implements `canonical-for: doc-node-STORY-366` — lückenlose Traceability von Code-Work zu Dokumentation.

### RQ-003: Staleness-Detection Tool

**Priorität:** Mittel  
**Beschreibung:** `mcp_devsteps_doc_stale` MCP-Tool listet alle `doc`-Items mit `last_verified` > N Tage.  
**Context:** Automatische Erkennung veralteter Dokumentation ohne manuelle Checks.

### RQ-004: Lens-Engine (Doku-Lupe)

**Priorität:** Mittel  
**Beschreibung:** `mcp_devsteps_lens_build(topic, diataxis[])` aggregiert relevante Abschnitte aus mehreren Canonical Nodes in eine ephemere Lens-View.  
**Context:** AI-Agents und Entwickler bekommen eine themen-fokussierte Projektion ohne in 42 Dateien manuell zu suchen.

### RQ-005: Frontmatter-Validation Tool

**Priorität:** Niedrig  
**Beschreibung:** `mcp_devsteps_doc_validate(path)` prüft Frontmatter-Pflichtfelder und gibt strukturierte Fehlermeldungen zurück.  
**Context:** Kann in gate-reviewer integriert werden für automatische Doc-Quality-Checks.
