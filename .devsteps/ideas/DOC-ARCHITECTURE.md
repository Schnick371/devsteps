---
doc_id: doc-architecture-ssot
title: Documentation Architecture — Single Point of Truth Strategy
diataxis: explanation
author: th
status: active
last_verified: 2026-03-31
related_items: [EPIC-043]
---

# Documentation Architecture — Single Point of Truth Strategy

> **Version:** 1.0.0
> **Audience:** Developer/Operator + AI Agents (Copilot coord, exec-doc, gate-reviewer)
> **Last Updated:** 2026-03-31
> **Status:** Active — Phased Implementation Plan
>
> **PFLICHTLEKTÜRE für AI Agents:** Dieses Dokument beschreibt die dokumentations-governance-Architektur für compose4tc. Bevor exec-doc eine neue Dokumentationsdatei erstellt oder eine bestehende aktualisiert, müssen Abschnitte §6 (Frontmatter-Schema) und §7 (AI Workflow Rules) gelesen werden.

---

## Inhaltsverzeichnis

1. [Das Problem — Warum Docs driften](#1-das-problem--warum-docs-driften)
2. [Analyse-Ergebnisse (Competitive Research + Intern)](#2-analyse-ergebnisse)
3. [Architektur-Entscheidungen (ADRs)](#3-architektur-entscheidungen-adrs)
4. [Diataxis-Framework — Information Classification](#4-diataxis-framework)
5. [SSOT Canonical Node Model](#5-ssot-canonical-node-model)
6. [Frontmatter-Schema (Pflicht für neue Docs)](#6-frontmatter-schema)
7. [AI Agent Workflow Rules](#7-ai-agent-workflow-rules)
8. [DevSteps `doc` Item-Typ — Erweiterungsvorschläge](#8-devsteps-doc-item-typ)
9. [Doku-Lupe — Filtered Lens Views](#9-doku-lupe--filtered-lens-views)
10. [Doc Coverage Report](#10-doc-coverage-report)
11. [Staleness Detection — Doc-Code Drift](#11-staleness-detection)
12. [Migrations-Strategie (bestehende 42 Docs)](#12-migrations-strategie)
13. [Rollout-Phasen](#13-rollout-phasen)
14. [Constraints und Risiken](#14-constraints-und-risiken)
15. [Offene Fragen und Feature Requests an DevSteps](#15-offene-fragen-und-feature-requests)

---

## 1. Das Problem — Warum Docs driften

### 1.1 Symptom

`Documentation/WORKSPACE-BOOTSTRAP.md` (367 Zeilen) enthält `how-to` + `reference` + `explanation` in einer Datei. Das ist kein Einzelfall — alle 42 Dateien in `Documentation/` haben **nul Frontmatter-Metadaten**:

- Kein Werkzeug kann fragen: "Ist diese Dokumentation noch aktuell?"
- Kein Werkzeug kann fragen: "Welche Docs brauche ich für Phase 1 Bootstrap?"
- Kein AI-Agent kann strukturiert nach "Docs für Audience=Operator, Phase=Bootstrap" filtern
- Kein CI-Gate kann prüfen: "Wurde die Dokumentation nach STORY-363 aktualisiert?"

### 1.2 Root Cause

Dokumentation in diesem Projekt hat drei Probleme:

| Problem | Beschreibung | Konsequenz |
|---|---|---|
| **Mixed Mode** | Eine Datei kombiniert Tutorial + How-to + Reference + Explanation | Autoren wissen nicht wo etwas hingehört; Leser finden nichts |
| **No Metadata** | 42/42 Dateien ohne Frontmatter | Keine maschinenlesbare Struktur für Tooling oder AI Agents |
| **No Ownership** | Keine definierte Verantwortlichkeit per Doc | Niemand ist zuständig für `last_verified` — Docs altern unbemerkt |

### 1.3 Die `WORKSPACE-BOOTSTRAP.md` ist eine Mikrokosmos dieses Problems

In der letzten Session (TASK-304) haben wir aufgedeckt:
- BUG-200 war bereits in STORY-362 behoben, aber die Dokumentation sagte noch "Gap vorhanden"
- Stage 2f (`New-RemoteWorkspaceFile`) existierte bereits, wurde aber als "fehlt" dokumentiert
- Die Docs hatten 3+ Abschnitte die den gleichen Widerspruch enthielten

**Das ist kein menschlicher Fehler — das ist structural drift**, ausgelöst weil es keinen maschinenlesbaren Link zwischen Implementierung und Dokumentation gibt.

---

## 2. Analyse-Ergebnisse

> Diese Sektion dokumentiert die Ergebnisse der COMPETITIVE-Tier-Analyse vom 2026-03-31 (Mandats-IDs: 4f3b790c-13fd-4daa, a8c4e6f2-1b3d-4a57, b4c5d6e7-f8a9-4b0c).

### 2.1 Research-Ergebnisse (analyst-research)

**Top 5 Patterns untersucht (14 Quellen):**

| Pattern | Stärken für compose4tc | Schwächen / Risiken |
|---|---|---|
| **Diataxis** (tutorial/how-to/reference/explanation) | Löst den "one doc does everything"-Fehler; klare Autorenintention; inkrementell adoptierbar | Braucht redaktionelle Governance, sonst schleichen sich mixed-mode docs zurück |
| **DITA-light** (topic modularity + reuse, ohne XML-Stack) | Starke SSOT-Disziplin: topic als wiederverwendbare Einheit; Varianten-Outputs | Voller DITA-Toolchain ist zu schwer; empfohlen: Markdown/Frontmatter Adaptation |
| **Docs-as-Data (YAML frontmatter + schema)** | Maschinen-queryable; AI-Automation sicher; Coverage/Drift-Detection möglich | Schema-Design + Migration-Aufwand; schlechte Metadaten-Hygiene = Rauschen |
| **AsciiDoc include / modulare Komposition** | Single-sourcing von Prozeduren; update-once-propagate | Include-Ketten schwer zu debuggen ohne Linting |
| **Portal-Modell (Backstage TechDocs)** | "Doku-Lupe" in der Praxis bewährt: catalog-driven discovery via Metadaten-Filter | Benötigt Portal-Infrastruktur; löst allein keine Source-Quality-Probleme |

**Empfohlene Kombination:** Diataxis information model + Docs-as-Data metadata + DITA-light modulare Reuse + Lens-Projektionen.

**Quellen:**
- https://diataxis.fr/start-here/
- https://dotit.dk/en/portal-model-documentation
- https://docs.astro.build/en/guides/content-collections/
- https://backstage.io/docs/features/techdocs/
- https://learn.microsoft.com/en-us/azure/devops/project/wiki/create-embed-wit-from-wiki

### 2.2 Interne Analyse (analyst-context)

**Belastbare Fakten aus dem Codebase-Audit:**

| Befund | Details |
|---|---|
| Vorhandene Dateien | 42 MD-Dateien in `Documentation/`, 0 mit Frontmatter |
| DevSteps Item-Typen | `epic`, `story`, `requirement`, `feature`, `task`, `bug`, `spike`, `test` — KEIN `doc` |
| Metadata-Feld | Vorhanden in Item-Schema, aber 0 Items haben non-empty metadata |
| Relation-Typen | `implements`, `depends-on`, `relates-to`, `blocks`, etc. — KEIN `canonical-for` oder `derived-from` |
| `.devsteps/context/` | Vorhanden aber rein file-centric, kein MCP-Level governance |
| Indexes | `by-type`, `by-status`, `by-priority` — KEIN `by-doc-status` oder `by-canonical-scope` |

**`.devsteps/context/` Assessment:**
Das Verzeichnis ist bereits ein **Proto-SSOT für AI-Operational-Memory**. Es ist kuratiert, task-orientiert und hochwertig. Es ist aber schwach maschinentypisiert und hat keine MCP-Level-Doc-Lifecycle-Controls. Es ist die **richtige Basis** für Phase 1.

### 2.3 Constraint-Analyse (aspect-constraints)

**Kritische Erkenntnis:** Der größte unbekannte Faktor ist, ob der DevSteps MCP-Server den `doc` item type aus `config.json` liest oder in einer hardcoded TypeScript-Enum prüft. **Dieser Check ist der erste Schritt vor jeder Implementierung.**

**Harte Constraints (Showstopper wenn verletzt):**

1. **HC-1: DevSteps Server Kompatibilität** — Spike nötig: prüfen ob `item_types` config-driven oder hardcoded
2. **HC-2: Additive-Only Frontmatter Migration** — KEINE Bulk-Migration der 42 bestehenden Docs in Phase 1
3. **HC-3: Doku-Lupe Lens Views nie committen** — nur ephemere CI-Artefakte, nie in Git
4. **HC-4: WORKSPACE-BOOTSTRAP.md kein Split ohne Supersession-Chain** — alle Inbound-Links würden brechen
5. **HC-5: Human-Scale Governance Cap** — max 8 Pflichtfelder im Frontmatter; max 1 CLI-Command für Lenses

### 2.4 Impact-Analyse (aspect-impact)

**Sofortige Gewinne (Phase 1):**
- `exec-doc` kann strukturiert nach verlinkten Doc-Nodes fragen statt heuristisch suchen
- `gate-reviewer` kann `last_verified` Timestamps deterministisch prüfen statt semantisch suchen
- Neue Docs gehen mit Audience und Diataxis-Klassifikation einher — keine Rätselrate mehr

**Freigeschaltete Gewinne (Phase 2+):**
- Doku-Lupe: Operator fragt "Zeige mir alle Docs für Phase 1 Bootstrap, Audience=Operator" — erhält eine generierte Übersicht
- AI Agents erhalten strukturierte Leseliste statt heuristischer Dateiauswahl
- CI blockiert bei Deployment-kritischen Stories ohne verlinkte Doc-Node

---

## 3. Architektur-Entscheidungen (ADRs)

### ADR-001: Diataxis als Informationsklassifikation

**Entscheidung:** Alle neuen Docs in `Documentation/` werden mit `diataxis` Frontmatter-Feld klassifiziert.

**Begründung:** Diataxis ist der bekannteste und am besten erprobte Ansatz zur Vermeidung von "mixed-mode" Dokumentation. Es ist nach Information-Seeking-Behavior aufgebaut, nicht nach Systemstruktur.

**Konsequenz:** `WORKSPACE-BOOTSTRAP.md` bekommt `diataxis: how-to` (es beschreibt wie man Bootstrap durchführt, nicht warum das System so aufgebaut ist). Eine separate `BOOTSTRAP-EXPLANATION.md` könnte später angelegt werden für die Erklärung der Architektur-Entscheidungen.

### ADR-002: `doc` als First-Class DevSteps Item-Typ

**Entscheidung:** DevSteps bekommt einen neuen Item-Typ `doc` mit Prefix `DOC-xxx`.

**Begründung:**
- Docs als Items haben Lifecycle (draft → active → legacy → obsolete)
- Items können zu Implementierungs-Stories verlinkt werden (`canonical-for`)
- `gate-reviewer` kann deterministisch prüfen ob linked Doc-Items updated sind
- Im bestehenden DevSteps-Modell sind Docs nur als `affected_paths` auf anderen Items referenziert — das ist kein bidirektionales, governance-fähiges Linking

**Konsequenz:** Config-Spike (HC-1) nötig bevor Implementierung. Item-Typ `doc` nutzt existing `metadata` Feld für doc-spezifische Felder.

### ADR-003: Docs-as-Data via YAML Frontmatter

**Entscheidung:** Neues Pflicht-Frontmatter-Schema (7 Felder) für alle neuen Docs.

**Begründung:** Frontmatter ist der minimale non-invasive Weg um Docs maschinenlesbar zu machen ohne den Inhalt oder das Format zu verändern. Es ist Markdown-kompatibel, von allen Editoren unterstützt und von bestehenden PowerShell/Node.js Tools parsebar.

**Konsequenz:** Bestehende 42 Docs werden NICHT in Bulk migriert. Migration erfolgt organisch bei inhaltlichen Updates.

### ADR-004: Lens Views sind ephemere CI-Artefakte

**Entscheidung:** Generierte Doku-Lupe Lens-Views werden nie in git committet.

**Begründung:** Veraltete Lens-Views sind gefährlicher als keine Views. Ein Operator der einem veralteten Bootstrap-Verfahren folgt, weil es in einer committed Lens steht, kann einen Node falsch konfigurieren. Ephemere Artefakte zwingen zur Regenerierung und verhindern stille Fehler.

**Konsequenz:** `.devsteps/lens/` in `.gitignore` eintragen. Lens-Generator kann als `tasks.ps1`-Task oder CI-Job ausgeführt werden.

### ADR-005: `.devsteps/context/` bleibt von `Documentation/doc` Items getrennt

**Entscheidung:** `.devsteps/context/` und `Documentation/` bleiben separierte Verzeichnisse mit unterschiedlichen Zwecken.

**Begründung:**
- `.devsteps/context/` = AI Operational Memory: dicht, actionable, agent-fokussiert, task-orientiert. Consumer: AI Agents pre-task.
- `Documentation/` doc items = Documentation Governance Nodes: lifecycle-managed, audience-tagged, freshness-tracked. Consumer: Menschen und AI für Auffindbarkeit und Aktualitätsprüfung.

**Konsequenz:** Spezifische Boundary-Regel in `copilot-instructions.md` nötig (Section 15).

---

## 4. Diataxis-Framework

> Diataxis (https://diataxis.fr) entstammt aus der Praxis bei Divio und wird von Kubernetes, Django, numpy, Ubuntu verwendet.

### 4.1 Die vier Dokumentationstypen

```
                Learning-oriented ←──────────────────────────────→ Work-oriented
                      │                                                   │
      Practical        │   TUTORIAL               HOW-TO                  │
      (Doing)          │   "Learning by doing"    "Step-by-step goal"     │
                       │   Example: First-time    Example: How to         │
                       │   Bootstrap walkthrough  bootstrap a DC node     │
                       │                                                   │
      Theoretical      │   EXPLANATION            REFERENCE               │
      (Understanding)  │   "Why/How it works"     "Look up facts"        │
                       │   Example: Why 4-phase   Example: Function       │
                       │   model exists           Matrix                  │
```

### 4.2 Klassifikation der bestehenden Docs

| Datei | Haupt-Typ | Problem | Empfehlung |
|---|---|---|---|
| `WORKSPACE-BOOTSTRAP.md` | `how-to` | Enthält auch Reference (Function Matrix) und Explanation (Warum PS5.1) | `diataxis: how-to` für jetzt; Phase 2: separiere Function Matrix → Reference |
| `DEPLOYMENT-LIFECYCLE.md` | `explanation` | 5-Phasen-Modell widerspricht 4-Phasen-Modell — kritische Inkonsistenz | Sofort fixen, `diataxis: explanation` |
| `MODULE-DEPLOYMENT-STRATEGY.md` | `explanation` / `reference` | mixed | Phase 2 split |
| `CLI-API-ARCHITECTURE.md` | `reference` | Häufig outdated | `diataxis: reference`, staleness SLO hoch |
| `CONFIG-MANAGEMENT.md` | `reference` | Relativ stabil | `diataxis: reference` |
| `REMOTE-MANAGEMENT-GUIDE.md` | `how-to` | Falsche Behauptung über WinRM | Fix + `diataxis: how-to` |

### 4.3 Warum WORKSPACE-BOOTSTRAP.md nicht gesplittet wird (Phase 1)

Die Datei hat ~15 inbound Links aus DevSteps Items und anderen Docs. Ein Split ohne Redirect-Strategie bricht alle diese Links. Phase 2 löst das mit:
1. Supersession-Chain: Neue Dateien erhalten `supersedes: workspace-bootstrap-guide` im Frontmatter
2. Stub-File bleibt an alter Position mit `status: superseded` und Links zu den neuen Nodes
3. Alle referenzierenden Files werden in einem Batch-Commit aktualisiert

---

## 5. SSOT Canonical Node Model

### 5.1 Das Prinzip

Ein **Canonical Node** ist eine Dokumentationseinheit mit eindeutiger Verantwortlichkeit für genau eine Information. Es gelten zwei Regeln:

> **Rule of One:** Jede Information existiert genau einmal, im ihren Canonical Node.
>
> **Rule of Derivation:** Andere Docs dürfen auf Canonical Nodes verweisen (Link), aber nicht die gleiche Information wiederholen (Copy).

### 5.2 Struktur: Canonical vs. Derived

```
Documentation/
├── nodes/                          ← Canonical Nodes (Phase 2 Migration)
│   ├── bootstrap-how-to.md         ← doc_id: workspace-bootstrap-guide
│   ├── bootstrap-reference.md      ← doc_id: workspace-bootstrap-function-matrix
│   ├── four-phase-model.md         ← doc_id: four-phase-model (explanation)
│   └── site-environment-access.md  ← doc_id: site-env-access-patterns
├── lens/                           ← Generated Lens Views (ephemeral, in .gitignore)
│   ├── phase-1-bootstrap.md        ← Generiert aus phase=bootstrap filter
│   ├── audience-operator.md        ← Generiert aus audience=operator filter
│   └── company-IKTS.md             ← Generiert aus company_scope=IKTS filter
└── [existing files mit stub frontmatter bis Phase 2 Migration]
```

### 5.3 Supersession-Protokoll (für Phase 2 Splits)

Wenn eine große Datei (wie WORKSPACE-BOOTSTRAP.md) in mehrere Nodes aufgeteilt wird:

```yaml
# In der NEUEN Datei (z.B. bootstrap-reference.md):
---
doc_id: workspace-bootstrap-function-matrix
supersedes: workspace-bootstrap-guide  ← zeigt was ersetzt wird
status: active
---

# In der ALTEN Datei (WORKSPACE-BOOTSTRAP.md) nach Split:
---
doc_id: workspace-bootstrap-guide
superseded_by: bootstrap-how-to        ← zeigt wohin zu linken
status: superseded
---
```

---

## 6. Frontmatter-Schema

### 6.1 Pflichtfelder für NEUE Dateien (ab sofort)

```yaml
---
doc_id: <stable-kebab-slug>
# Stabil, kleingeschrieben, mit Bindestrichen.
# Beispiel: workspace-bootstrap-guide, four-phase-model

title: <human-readable Titel>
# Darf den H1-Heading wiederholen — für maschinenlesbare Abfragen.

diataxis: tutorial | how-to | reference | explanation | mixed
# 'mixed' nur bei Legacy-Docs bis zur Phase-2-Migration.

author: <Name oder Team>
# Verantwortlicher für last_verified Updates.

status: draft | active | legacy | obsolete | superseded
# draft      = work in progress, nicht für Operator-Nutzung
# active     = aktuell, verifiziert
# legacy     = bekannt veraltet, Migration geplant
# obsolete   = nicht mehr gültig, kein Nachfolger
# superseded = durch andere Doc-Nodes ersetzt (superseded_by Feld setzen)

last_verified: YYYY-MM-DD
# Datum des letzten manuellen oder automatischen Abgleiches mit dem Codebase.

related_items: [STORY-xxx, TASK-yyy, EPIC-zzz]
# DevSteps-Items denen dieser Doc zugeordnet ist.
---
```

### 6.2 Optionale Felder (Phase 2 Unlock)

```yaml
---
# --- Phase 2 Erweiterungs-Felder ---

audience: operator | developer | architect | all
# Für Doku-Lupe audience-lens Filterung.

phase: bootstrap | init | install | deploy | maintenance | all
# Für Doku-Lupe phase-lens Filterung.

component: bootstrap | modules | docker | config | tui | backup | transfer | all
# Für komponent-spezifische Lens-Views.

company_scope: all | IKTS | Rebo | FES | Rehau | ARCSolutions
# Default: all. Für company-spezifische Lens-Views.

review_cadence_days: 30 | 60 | 90 | 180
# Wie oft sollte diese Doc verifiziert werden?
# Bootstrap/Deploy: 30 Tage. Config: 90 Tage. Architecture: 180 Tage.

risk_level: high | medium | low
# Für CI-Coverage-Gates: high-risk Docs werden bei gate-reviewer geprüft.

related_paths:
  - Modules/Remarc.Tc.Install.Tasks/Public/Environment/Invoke-NodeBootstrapSteps.ps1
  - Install/Deploy-Installer.ps1
# Code/Config-Pfade die diese Doc beschreibt (für Staleness Detection).

supersedes: <doc_id>        # Diese Doc ersetzt welche ältere
superseded_by: <doc_id>     # Diese Doc wurde durch welche neuere ersetzt
tags: [windows, bootstrap, ps51, psremoting, deploy-installer]
---
```

### 6.3 Beispiel: WORKSPACE-BOOTSTRAP.md (Minimal-Frontmatter Phase 1)

```yaml
---
doc_id: workspace-bootstrap-guide
title: Workspace Bootstrap Guide
diataxis: how-to
author: th
status: active
last_verified: 2026-03-31
related_items: [EPIC-007, STORY-361, BUG-200, STORY-362]
---
```

### 6.4 Validierung via PowerShell

```powershell
# Test-DocFrontmatter.ps1 — validiert Pflichtfelder
# Läuft bei gate-reviewer für geänderte .md Dateien
function Test-DocFrontmatter {
    param([string]$Path)
    $content = Get-Content $Path -Raw
    if ($content -notmatch '^---\r?\n(.+?)\r?\n---') {
        throw "Missing frontmatter block in: $Path"
    }
    $yaml = $Matches[1]
    @('doc_id', 'title', 'diataxis', 'author', 'status', 'last_verified', 'related_items') | ForEach-Object {
        if ($yaml -notmatch "^${_}:") {
            throw "Missing required frontmatter field '$_' in: $Path"
        }
    }
    Write-Host "✅ Frontmatter valid: $Path"
}
```

---

## 7. AI Agent Workflow Rules

> Diese Regeln sind PFLICHT für `exec-doc`, `gate-reviewer`, und alle Agents die Docs schreiben.

### 7.1 exec-doc Pflichten

**Beim Erstellen einer neuen Doc-Datei:**
1. YAML Frontmatter mit allen 7 Pflichtfeldern eintragen (§6.1)
2. Frontmatter-Delimiter `---` ATOMISCH schreiben — nie per append
3. Nach dem Schreiben: `mcp_devsteps_add(type=doc, title=..., metadata={doc_id, diataxis, audience})` — Doc-Item anlegen
4. `mcp_devsteps_link(from=DOC-xxx, to=STORY-yyy, relation=canonical-for)` — Doc mit Work-Item verlinken
5. `last_verified` immer auf aktuelles Datum setzen (nie leer lassen)

**Beim Aktualisieren einer bestehenden Doc-Datei:**
1. `last_verified` in Frontmatter auf aktuelles Datum aktualisieren
2. Wenn Frontmatter noch nicht vorhanden: Stub-Frontmatter (7 Pflichtfelder) hinzufügen
3. Falls `status: legacy` oder `status: obsolete`: IMMER vor Edit melden — "Dieser Doc ist als legacy/obsolete markiert, soll er reaktiviert werden?"
4. Frontmatter-Edits: immer als eigenen replace_string_in_file Call (isolation!)

**VERBOTEN für exec-doc:**
- Lens-Views in `.devsteps/lens/` editieren — diese sind GENERATED, nicht canonical
- Docs aus `.devsteps/context/` mit `doc` Items verwechseln — unterschiedliche Zwecke (§3, ADR-005)
- `related_items: []` leer lassen bei neuen Docs — mindestens das auslösende Story/Task-Item

### 7.2 gate-reviewer Pflichten

**Phase 2 (Inline Analysis) Ergänzung:**

Bei jeder PR/Merge-Prüfung:
1. Gibt es geänderte `Documentation/` Dateien? → `last_verified` Timestamp aktualisiert?
2. Hat die Story linked `doc` Items? → Mindestens ein DOC-Item mit `related_items` referenziert die Story?
3. Wenn Doc `status: legacy` und nicht im Rahmen des aktuellen Commits adressiert → explizit erwähnen in Findings
4. Wenn Doc `risk_level: high` (Phase 2) und `last_verified` > `review_cadence_days` überschritten → CONDITIONAL Verdict

**Phase 1 (minimal):** Prüfe ob geänderte Docs `last_verified` have aktuelles Datum.

### 7.3 `.devsteps/context/` — Klare Trennung

```
.devsteps/context/          ← AI OPERATIONAL MEMORY
                              Consumer: AI Agents (lesen vor jedem Task)
                              Inhalt: dense, constraint-focused, machine-actionable rules
                              Update: durch worker-guide-writer Agent
                              KEIN DevSteps Item-Registrierung nötig

Documentation/              ← DOCUMENTATION GOVERNANCE NODES
                              Consumer: Menschen + AI (discovery + freshness)
                              Inhalt: human-readable how-to/reference/explanation
                              Update: durch exec-doc + human edits
                              Frontmatter + DOC-Item Registrierung PFLICHT für neue Docs
```

**Wichtig:** Wenn ein AI Agent Informationen für eine neue Task sucht:
- Operational rules, path patterns, error-prevention → `.devsteps/context/`
- Bootstrap procedures, deployment how-tos, architecture decisions → `Documentation/`
- Beide Quellen nutzen, nicht nur eine

---

## 8. DevSteps `doc` Item-Typ

> Diese Sektion beschreibt die geplanten Erweiterungen für DevSteps. Die Grenze zwischen "was wir schon haben" und "was wir vorschlagen" ist klar markiert.

### 8.1 Aktueller Stand (IST)

DevSteps unterstützt folgende Item-Typen:
`epic | story | requirement | feature | task | bug | spike | test`

Ein `doc` Type existiert **nicht**. Dokumentations-Arbeit wird als `task` mit `affected_paths` auf `.md` Dateien tracked.

**Problem:** Das ist unidirektional und schwach typisiert:
- Kein Lifecycle für Docs (draft/active/legacy/obsolete)
- Kein Ownership-Feld
- Kein `last_verified`-Tracking
- Kein Unterschied zwischen "ich hab einen Doc als Context gelesen" und "ich bin verantwortlich für diesen Doc"

### 8.2 Vorgeschlagener `doc` Item-Typ (SOLL)

**Konfigurationsänderung in `.devsteps/config.json`:**

```json
{
  "item_types": [
    "epic", "story", "requirement", "feature", "task", "bug", "spike", "test",
    "doc"    ← neu (additive, kein Breaking Change für bestehende Items)
  ],
  "item_prefixes": {
    "epic": "EPIC",
    "story": "STORY",
    ...
    "doc": "DOC"    ← neu
  }
}
```

**⚠️ WICHTIG — Spike benötigt:** Es muss vorab geprüft werden ob der DevSteps MCP-Server `item_types` aus `config.json` liest (dann ist die Änderung sicher) oder ob die Typen in einer hardcoded TypeScript-Enum stehen (dann braucht erst der Server-Source gepatcht werden). Diese Prüfung ist HC-1 aus der Constraints-Analyse.

### 8.3 `doc` Item Metadata-Profil

Doc-Items nutzen das vorhandene `metadata` Feld für doc-spezifische Daten:

```json
{
  "id": "DOC-001",
  "type": "doc",
  "title": "Workspace Bootstrap Guide",
  "status": "active",
  "tags": ["bootstrap", "ps51", "how-to"],
  "affected_paths": ["Documentation/WORKSPACE-BOOTSTRAP.md"],
  "metadata": {
    "doc_id": "workspace-bootstrap-guide",
    "diataxis": "how-to",
    "audience": "operator",
    "phase": "bootstrap",
    "last_verified": "2026-03-31",
    "review_cadence_days": 30
  },
  "linked_items": {
    "canonical-for": ["STORY-361", "EPIC-007"],
    "derived-from": [],
    "supersedes": [],
    "superseded_by": []
  }
}
```

### 8.4 Neue Relation-Typen

**Additive Änderungen zur `linked_items` Struktur:**

| Relation | Richtung | Bedeutung |
|---|---|---|
| `canonical-for` | DOC → STORY/EPIC | Dieser Doc ist die kanonische Dokumentation für dieses Work-Item |
| `derived-from` | DOC → DOC | Dieser Doc leitet sich aus einem anderen Canonical Node ab |
| `supersedes` | DOC → DOC | Dieser Doc ersetzt einen älteren Doc (bidirektionale Pflege!) |
| `superseded-by` | DOC → DOC | Dieser Doc wurde durch einen neueren ersetzt |

**Bemerkung:** `relates-to` und `implements` existieren bereits und können auch für Docs verwendet werden. Die neuen Typen sind semantisch spezifischer.

### 8.5 Vorgeschlagene neue MCP Tools (Phase 2+)

> Diese Tools existieren noch nicht. Sie sind Feature-Requests an das DevSteps-Projekt.

#### Tier 1 — Phase 2 (hochprio)

```
mcp_devsteps_doc_list(filter)
  filter: { diataxis?, audience?, phase?, status?, related_item?, component? }
  returns: DOC-Items mit Metadaten und affected_paths
  Use by: exec-doc (structured doc discovery)

mcp_devsteps_doc_staleness_scan(changed_paths)
  input: Liste von geänderten Dateipfaden (aus git diff)  
  returns: DOC-Items deren related_paths die input-Pfade überlappen + last_verified age
  Use by: gate-reviewer (deterministic staleness check)

mcp_devsteps_doc_section_get(doc_id, heading_path)
  input: doc_id (aus Frontmatter), heading_path (z.B. "Bootstrap Methods/PSRemoting Stage")
  returns: Markdown-Inhalt des Abschnitts + line range
  Use by: exec-doc (targeted section read without full file load)

mcp_devsteps_doc_section_upsert(doc_id, heading_path, content, reason)
  input: doc_id, heading_path, neuer Markdown-Inhalt, reason (für Audit-Log)
  action: ersetzt Abschnitt atomisch, updated last_verified, schreibt Audit-Entry
  guardrails: Schema-Validierung, Frontmatter-Integrität prüfen, Ownership-Check
  Use by: exec-doc (safe section-level doc updates)
```

#### Tier 2 — Phase 3 (mittelfristig)

```
mcp_devsteps_doc_coverage_report(scope)
  scope: { phase?, item_status?, risk_level? }
  returns: Coverage-Matrix: für jeden gelinkten STORY/EPIC → hat er linked DOC-Items? 
  Use by: gate-reviewer, CI pipeline

mcp_devsteps_doc_drift_report(changed_paths)
  input: Liste von geänderten Dateipfaden (breiter als staleness_scan)
  returns: Alle DOC-Items + letzte Änderungszeit im Verhältnis zu related_paths changes
  Use by: periodic CI check, weekly hygiene report

mcp_devsteps_doc_validate_ssot(scope)
  input: scope (phase, component oder all)
  returns: Verstöße gegen SSOT-Regeln: doppelte Information in 2+ Docs,
           canonical + derived mit widersprüchlichem Inhalt, orphaned derived docs
  Use by: periodic hygiene, pre-release gate

mcp_devsteps_doc_publish(lens_query, output_path)
  input: Lens-Filter (audience, phase, component, company_scope), output path
  action: generiert ephemere Lens-View-Datei mit machine-generated header
  Use by: CI, tasks.ps1 integration ("Generate Doc Lens")
```

#### Tier 3 — Phase 4 (langfristig / nice-to-have)

```
mcp_devsteps_doc_link_verify(doc_id)
  Prüft ob alle Links in einem Doc-Node noch gültig sind (existenz der Ziel-Dateien)

mcp_devsteps_doc_freshness_slo_report()
  Alle DOC-Items mit review_cadence_days überschritten → sortiert nach Überschreitungsgrad

mcp_devsteps_doc_audience_gap_report()
  Welche Phasen/Components haben keine Docs für audience=operator?
```

---

## 9. Doku-Lupe — Filtered Lens Views

### 9.1 Das Konzept

Die "Doku-Lupe" ist eine **Projektion** über den Dokumentations-Corpus. Sie beantwortet Fragen wie:

- "Zeige mir alle Docs die für Phase 1 Bootstrap relevant sind"
- "Welche Docs existieren für Audience=Operator?"
- "Welche Docs gelten für das Unternehmen IKTS speziell?"

**CRITICAL:** Eine Lens-View ist KEIN neuer Canonical Node. Es ist eine **generierte Übersicht mit Links zu den echten Canonical Nodes**. Die Lens selbst hat keinen eigenen Inhalt — nur Navigation.

### 9.2 Lens-Format

Eine generierte Lens-Datei sieht so aus:

```markdown
<!-- GENERATED BY: Build-DocLens.ps1 -->
<!-- SOURCE HASH: sha256:e3b0c44298fc1c149afb -->
<!-- GENERATED AT: 2026-03-31T14:00:00Z -->
<!-- FILTER: phase=bootstrap, audience=operator -->
<!-- ⚠️ DO NOT EDIT — regenerate with: pwsh tasks.ps1 generate-doc-lens -->

# 🔍 Doku-Lupe: Phase 1 Bootstrap (Audience: Operator)

> Gefilterte Ansicht über den Dokumentations-Corpus.
> Canonical Nodes: 3 | Status: active:2, legacy:1

## Canonical Nodes

### [Workspace Bootstrap Guide](../Documentation/WORKSPACE-BOOTSTRAP.md)
- **Type:** how-to | **Status:** active | **Last Verified:** 2026-03-31
- **Covers:** PSRemoting Stage 1, EXE-Pfad, Bootstrap-Environment.ps1
- **Related Items:** EPIC-007, STORY-361

### [Four Phase Model](../Documentation/DEPLOYMENT-LIFECYCLE.md)  
- **Type:** explanation | **Status:** legacy ⚠️ | **Last Verified:** 2025-11-15
- **Covers:** 4-Phasen-Modell (Phase 1-4), Status nach jeder Phase
- **Related Items:** EPIC-007

### [Module Deployment Strategy](../Documentation/MODULE-DEPLOYMENT-STRATEGY.md)
- **Type:** reference | **Status:** active | **Last Verified:** 2026-02-10
- **Covers:** Modul-Verteilung, PSModulePath, ArcModules Share
- **Related Items:** STORY-125

---
*Lens generated from {3} doc nodes matching filter.*
```

### 9.3 Lens-Generator Implementation (PowerShell PoC)

```powershell
# Build-DocLens.ps1 — Minimal PoC
# Liest YAML-Frontmatter aus Documentation/*.md
# Generiert gefilterte Lens-Views in .devsteps/lens/
param(
    [ValidateSet('bootstrap','init','install','deploy','maintenance','all')]
    [string]$Phase = 'all',
    
    [ValidateSet('operator','developer','architect','all')]
    [string]$Audience = 'all',
    
    [string]$OutputDir = '.devsteps/lens'
)

function Get-DocFrontmatter ([string]$Path) {
    $content = Get-Content $Path -Raw
    if ($content -match '^---\r?\n(.+?)\r?\n---') {
        # Minimaler YAML-Parser für flache Key: Value Strukturen
        $yaml = @{}
        $Matches[1] -split '\r?\n' | ForEach-Object {
            if ($_ -match '^(\w+):\s*(.+)$') { $yaml[$Matches[1]] = $Matches[2].Trim() }
            elseif ($_ -match '^doc_id:\s*(.+)$') { $yaml['doc_id'] = $Matches[1].Trim() }
        }
        return $yaml
    }
    return $null
}

$docs = Get-ChildItem 'Documentation/*.md' | ForEach-Object {
    $fm = Get-DocFrontmatter $_.FullName
    if ($fm -and $fm['doc_id']) {
        [PSCustomObject]@{
            Path       = $_.FullName
            DocId      = $fm['doc_id']
            Title      = $fm['title']
            Diataxis   = $fm['diataxis']
            Phase      = $fm['phase'] ?? 'all'
            Audience   = $fm['audience'] ?? 'all'
            Status     = $fm['status']
            LastVerified = $fm['last_verified']
        }
    }
}

$filtered = $docs | Where-Object {
    ($Phase -eq 'all' -or $_.Phase -eq 'all' -or $_.Phase -eq $Phase) -and
    ($Audience -eq 'all' -or $_.Audience -eq 'all' -or $_.Audience -eq $Audience)
}

# Ausgabe generieren (in .devsteps/lens/, nie in Documentation/)
$null = New-Item $OutputDir -ItemType Directory -Force
$lensPath = Join-Path $OutputDir "phase-${Phase}-audience-${Audience}.md"
# ... (Markdown generieren)
Write-Host "✅ Lens generated: $lensPath (${($filtered | Measure-Object).Count} nodes)"
```

### 9.4 Lens-Sicherheitsregeln

| Regel | Begründung |
|---|---|
| `.devsteps/lens/` in `.gitignore` | Stale committed lenses sind gefährlicher als keine lenses |
| Machine-generated header PFLICHT | Verhindert dass AI Agents Lens-Views als Canonical behandeln |
| Source-Hash im Header | Ermöglicht Validierung ob die Lens noch aktuell ist |
| Lens-Files nie editieren | Wenn eine Lens falsch ist: den Canonical Node fixen, dann neu generieren |
| Gate-Lense-Generierung auf ≥30% Frontmatter-Coverage | Sonst ist die View irreführend leer |

---

## 10. Doc Coverage Report

### 10.1 Was Coverage bedeutet

**Doc Coverage** = Verhältnis von Stories/Epics die ein linked `canonical-for` DOC-Item haben zu allen aktiven Stories/Epics.

```
Coverage = (Stories mit ≥1 canonical-for DOC-Item) / (alle Stories mit status ∈ {done, in-progress, review})
```

**Minimum viable Coverage Target:**
- Phase 1: kein CI-Gate, nur reporting
- Phase 2: `risk_level: high` Stories MÜSSEN doc coverage haben (CI-Gate bei gate-reviewer)
- Phase 3: >60% overall coverage target für neue Releases

### 10.2 Coverage Report Format (Phase 2)

```
Doc Coverage Report — 2026-03-31
═══════════════════════════════════
Total active stories:    127
Stories with doc nodes:   23  (18%)
Stories without docs:    104  (82%)

High-risk stories without docs:
  ⚠️ STORY-363  New-RemoteWorkspaceFile (phase=bootstrap, risk=high)  
  ⚠️ STORY-361  Deploy-Installer Workspace-File Fix (phase=bootstrap, risk=high)

Coverage by Phase:
  bootstrap: 4/12 (33%)  [WARNING: below 50% threshold]
  init:       2/15 (13%)  [WARNING]
  install:    1/8  (12%)  [WARNING]
  deploy:     8/40 (20%)  [WARNING]
```

---

## 11. Staleness Detection — Doc-Code Drift

### 11.1 Das Problem konkret

In der TASK-304-Session wurde aufgedeckt: `WORKSPACE-BOOTSTRAP.md` beschrieb BUG-200 als "offener Gap" obwohl STORY-362 dies bereits behoben hatte. Das ist **Staleness** — ein Doc der Realität um Wochen hinterherhinkt.

**Wie entsteht das?**
```
STORY-362 (done) ──changes──→ Get-NodeBootstrapSteps.ps1 (Step 2f added)
                                        │
                                        ▼
                              Documentation/WORKSPACE-BOOTSTRAP.md
                              ← NIEMAND hat diesen Link für Aktualisierung getriggert
```

### 11.2 Minimal Viable Staleness Detection (Phase 2)

**Algorithmus:**
1. Hol alle `done` Stories der letzten 30 Tage mit `affected_paths`
2. Prüfe für jede affected_path: gibt es DOC-Items mit überlappenden `related_paths`?
3. Wenn ja: ist der DOC-Item `last_verified` NACH dem Story-Done-Datum?
4. Wenn nicht: → DOC-Item als STALE markieren → gate-reviewer sieht es

```
Story STORY-362 (done: 2026-01-15)
  affected_paths: [Modules/.../New-RemoteWorkspaceFile.ps1, .../Get-NodeBootstrapSteps.ps1]
                                │
                                ▼
  DOC-Item DOC-001 (WORKSPACE-BOOTSTRAP.md)  
  related_paths: {Modules/.../Get-NodeBootstrapSteps.ps1, ...}  ← ÜBERLAP!
  last_verified: 2025-11-20  ← VOR Story-Done → STALE!
```

### 11.3 Integration in gate-reviewer

```
Gate-Reviewer Phase 2 (Inline Analysis) — erweitert ab Phase 2:

BEVOR PASS:
  mcp_devsteps_doc_staleness_scan(changed_paths_from_current_story)
  → Wenn STALE DOC-Items gefunden: CONDITIONAL Verdict
  → Operator entscheidet: update doc first, oder waive (with reason)
```

---

## 12. Migrations-Strategie (bestehende 42 Docs)

### 12.1 Goldene Regel: Keine Bulk-Migration

Die 42 existierenden Docs in `Documentation/` werden **NICHT** in Phase 1 in Bulk migriert. Gründe:
- Frontmatter-YAML-Fehler in Bulk-Automation sind schwer zu entdecken
- Große Diffs brechen line-anchored DevSteps `affected_paths` Referenzen
- CI-Frontmatter-Validierung würde auf dem gesamten Corpus sofort fehlschlagen

### 12.2 Organische Migration

Strategie: Docs werden **beim nächsten inhaltlichen Update** mit Frontmatter versehen.

**Prioritätsliste (wer zuerst):**

| Priorität | Datei | Warum |
|---|---|---|
| P1 — Sofort | `WORKSPACE-BOOTSTRAP.md` | Größter canonical doc, aktuelle Session |
| P1 — Sofort | `DEPLOYMENT-LIFECYCLE.md` | 5-Phasen-Widerspruch muss behoben werden |
| P2 — Nächste Session | `REMOTE-MANAGEMENT-GUIDE.md` | Falsche WinRM-Claim |
| P2 | `SELF-EXTRACTING-INSTALLER.md` | Prohibited `7z x` example (BUG-117) |
| P3 — Organisch | Alle anderen 38 Docs | Beim nächsten inhaltlichen Update |

### 12.3 Stub-Frontmatter für Legacy-Docs

Wenn eine Doc nur Frontmatter bekommt (kein Inhalt-Update):

```yaml
---
doc_id: <kebab-slug-des-dateinamens>
title: <H1 des Dokuments>
diataxis: mixed
author: th
status: legacy
last_verified: 2025-01-01  ← approximate date, marks it as needing verification
related_items: []
---
```

`status: legacy` signalisiert: "Dieser Doc ist nicht verifiziert aktuell."

---

## 13. Rollout-Phasen

### Phase 1 — MVP (jetzt)

**Scope:**
- ✅ `WORKSPACE-BOOTSTRAP.md` bekommt Frontmatter (§6.3)
- ✅ Dieses Dokument (`DOC-ARCHITECTURE.md`) als Governance-Referenz anlegen
- ⬜ Spike: DevSteps Server config-driven item_types (HC-1 prüfen)
- ⬜ `doc` in `.devsteps/config.json` hinzufügen (nach Spike-OK)
- ⬜ `canonical-for` + `derived-from` Relation-Typen in DevSteps
- ⬜ `Test-DocFrontmatter.ps1` anlegen (§6.4)
- ⬜ Neue Docs ab sofort mit Frontmatter

**Für den Menschen:** Normal schreiben, nur neue Docs bekommen ~12 Zeilen Frontmatter.
**Für AI Agents:** exec-doc registriert neue Docs als DOC-Items. gate-reviewer prüft `last_verified`.

### Phase 2 — Doku-Lupe (4-8 Wochen)

**Scope:**
- ⬜ `Build-DocLens.ps1` implementieren
- ⬜ `.devsteps/lens/` in `.gitignore`
- ⬜ `tasks.ps1` Task: `generate-doc-lens`
- ⬜ `mcp_devsteps_doc_list`, `mcp_devsteps_doc_staleness_scan` (MCP Server Erweiterung)
- ⬜ `mcp_devsteps_doc_section_get` + `mcp_devsteps_doc_section_upsert`
- ⬜ `DEPLOYMENT-LIFECYCLE.md` fix (5→4 Phasen) + Frontmatter
- ⬜ Weitere P2-Docs aus Migrations-Liste (§12.2)

**Für den Menschen:** Neue CLI-Tasks verfügbar. `pwsh tasks.ps1 generate-doc-lens -Phase bootstrap` gibt eine Übersicht.
**Für AI Agents:** exec-doc kann gezielt Sections lesen/schreiben, keine File-Scans mehr.

### Phase 3 — Coverage Gates (8-20 Wochen)

**Scope:**
- ⬜ Doc Coverage Report CLI + MCP Tool
- ⬜ CI-Gate: `risk_level: high` Stories brauchen DOC-Item
- ⬜ Staleness SLO Enforcement via `review_cadence_days`
- ⬜ WORKSPACE-BOOTSTRAP.md Split (mit Supersession-Chain)
- ⬜ `Doc Coverage` als Dashboard-Metric in TUI

---

## 14. Constraints und Risiken

### 14.1 Harte Constraints (aus Constraint-Analyse)

| HC | Constraint | Konsequenz wenn verletzt |
|---|---|---|
| HC-1 | DevSteps Server item_types: config-driven oder hardcoded? | Alle `doc` Items schlagen lautlos fehl |
| HC-2 | Keine Bulk-Frontmatter-Migration | CI bricht für alle 42 Docs gleichzeitig |
| HC-3 | Lens-Views nie committen | Stale views→ Operator folgt falscher Prozedur |
| HC-4 | WORKSPACE-BOOTSTRAP.md kein Split ohne Supersession-Chain | Alle ~15 inbound Links brechen |
| HC-5 | Max 8 Pflicht-Frontmatter-Felder (1 Mensch!) | Overhead → Frontmatter wird übersprungen |

### 14.2 Soft Constraints

| SC | Constraint | Fallback |
|---|---|---|
| SC-1 | Phase 1 MCP: null neue Tools (reuse existing) | Akzeptabler Kompromiss |
| SC-2 | Lens-Generator als `tasks.ps1` Task | Standalone-Script als Fallback |
| SC-3 | YAML-Parser: pnpm/node statt PowerShell | PowerShell Regex-Parser für einfache Fälle |
| SC-4 | `.devsteps/context/` bleibt separiert | Klare Boundary-Regel in copilot-instructions |

### 14.3 Risikomatrix

| Risiko | Likelihood | Severity | Mitigation |
|---|---|---|---|
| DevSteps Server hardcoded enum → Spike false | HIGH (unbekannt) | HIGH | Spike zuerst |
| exec-doc editiert Lens-View statt Canonical | HIGH | HIGH | Machine-header + agent rules |
| Frontmatter-Bulk-Migration Syntax-Fehler | HIGH | MEDIUM | Additive-only policy |
| Lens zeigt stale Prozedur → falsche Konfiguration | HIGH | HIGH | Never commit lenses |
| AI Agent verwechselt context/ mit doc/ | MEDIUM | MEDIUM | copilot-instructions Boundary rule |
| 1 Mensch vergisst last_verified update | HIGH | LOW | gate-reviewer prüft es |

---

## 15. Offene Fragen und Feature Requests an DevSteps

> Diese Sektion ist explizit als **Feature-Request-Brief** an das DevSteps-Projekt formuliert. Der Copilot im DevSteps-Projekt soll diese Insights bei der Weiterentwicklung berücksichtigen.

### 15.1 Kritische Gap: Kein `doc` Item-Typ

**Problem:** Dokumentation ist in DevSteps nur indirekt über `affected_paths` auf anderen Items referenziert. Es gibt keine:
- Bidirektionalen Doc↔Story Links
- Doc-Lifecycle (draft/active/legacy/obsolete)
- Doc-Ownership
- Staleness Tracking

**Feature Request:** `doc` als first-class Item-Typ mit `DOC-xxx` Prefix. Minimaler Metadata-Overhead (nutzt vorhandenes `metadata` Feld). Zero Breaking Changes für bestehende Items.

### 15.2 Kritische Gap: Kein `canonical-for`/`derived-from` Relation-Typ

**Problem:** Bestehende Relation-Typen (`relates-to`, `implements`, `depends-on`) sind für Work-Items designed, nicht für Doc↔Work-Item Semantik.

**Feature Request:** Zwei neue Relation-Typen additive zur `linked_items` Struktur:
- `canonical-for`: DOC ist die Primär-Dokumentation für STORY/EPIC
- `derived-from`: DOC leitet sich ab aus einem anderen DOC (Lens-Views, zusammenfassende Docs)

### 15.3 Hoher Wert: Section-Level Doc Tools

**Problem:** AI Agents müssen heute ganze Dateien lesen/schreiben um einen Abschnitt zu aktualisieren. Das ist fehleranfällig bei großen Dateien (500+ Zeilen) und produziert unzuverlässige replace_string_in_file Matches bei ähnlichen Paragraphen.

**Feature Request** (höchste Priorität unter Phase-2-Tools):
- `mcp_devsteps_doc_section_get(doc_id, heading_path)` — gibt genauen Abschnitt zurück
- `mcp_devsteps_doc_section_upsert(doc_id, heading_path, content, reason)` — atomischer Abschnitt-Update mit Audit-Log, Schema-Validierung, Frontmatter-Integrität

**Nutzen:** exec-doc wird wesentlich präziser, keine falschen Matches in großen Docs, besseres Audit-Log.

### 15.4 Mittlerer Wert: Staleness Detection API

**Problem:** Derzeit keine Möglichkeit für gate-reviewer zu wissen welche Docs durch welche Stories outdated sein könnten.

**Feature Request:**
- `mcp_devsteps_doc_staleness_scan(changed_paths)` — Input: Dateipfade aus git diff. Output: DOC-Items mit related_paths Overlap + last_verified Age.
- Integration: gate-reviewer nutzt das automatisch bei PASS-Entscheidung.

### 15.5 Nice-to-Have: Coverage Report

**Problem:** Keine Sichtbarkeit ob kritische Deployment-Phasen dokumentiert sind.

**Feature Request:** `mcp_devsteps_doc_coverage_report(scope)` — Coverage-Matrix Stories→DOC-Items, gefiltert nach Phase oder risk_level.

### 15.6 Architektur-Empfehlung: `doc` Type in UI

Wenn die VS Code Extension (TUI) eine Ansicht für `doc` Items bekommt, sollte sie:
- "Doku-Lupe"-Style Filterung unterstützen (nach Phase, Audience, Component)
- `last_verified` Timestamps prominent anzeigen (rot wenn überfällig)
- Link "Open in Editor" für `affected_paths`
- `status: legacy/obsolete` Docs visuell abgrenzen (grau/durchgestrichen)

### 15.7 Grenzlinie: Was DevSteps NICHT sein soll

**Doc-Management in DevSteps soll NICHT:**
- Ein Wiki werden (kein Full-Content in Items — Items zeigen auf Dateien)
- Ein CMS werden (kein WYSIWYG-Editor)
- Confluence ersetzen (DevSteps ist für Developer/Operator, nicht für Enterprise-Docs)

**DevSteps soll:**
- Die **Governance-Metadaten-Ebene** sein: Wer ist verantwortlich? Ist es aktuell? Für wen ist es?
- Die **Linking-Ebene** zwischen Code-Arbeit (Stories) und Dokumentation (DOC-Items) sein
- AI Agents ermöglichen **deterministisch** und **sicher** Docs zu finden und zu aktualisieren

---

## Related Documentation

- [WORKSPACE-BOOTSTRAP.md](./WORKSPACE-BOOTSTRAP.md) — Erstes Canonical Doc mit Frontmatter (Phase 1 Beispiel)
- [.devsteps/context/README.md](../.devsteps/context/README.md) — AI Operational Memory (getrennt von doc governance!)
- [.devsteps/context/path-resolution-truth.md](../.devsteps/context/path-resolution-truth.md) — Beispiel context file
- [copilot-instructions.md](../.github/copilot-instructions.md) — AI Agent Instructions (muss §7 Regeln integrieren)

---

*Dokument erstellt: 2026-03-31 | Basis: COMPETITIVE-Tier Analyse mit 4 Analyst-Mandaten (Research, Context, Constraints, Impact)*
