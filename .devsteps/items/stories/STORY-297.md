# DevSteps Handbook — 5-Level BOM TOC Guide für Copilot

## Zweck und Scope

Diese Story definiert das verbindliche Inhaltsverzeichnis (BOM) für das DevSteps-Handbook. Sie ist **kein Implementierungsentwurf**, sondern ein **Leitfaden für Copilot**: was erstellt werden soll, wo bestehende DOC-Items eingehängt werden, welche neuen DOC-Items tief spezifisch zu erstellen sind, und in welcher Reihenfolge die `devsteps_doc*`-Tools zu verwenden sind.

### Voraussetzungen

| Abhängigkeit | Grund |
|---|---|
| STORY-284 | `bom_commit` `parent_id`-Fix erforderlich für echte BOM-Hierarchie |
| TASK-437 | `docs_assemble` muss im Tool-Index registriert sein |

**Schritte 1–6** (Inhalt erstellen, klassifizieren, verknüpfen, BOM-Status prüfen) sind heute vollständig unblockiert und direkt ausführbar.

---

## Grundprinzip: Struktur des Handbuchs

Das Handbook folgt dem **Siemens-Dokumentationsprinzip**: Gliederung nach funktionalen Bereichen, nicht nach Diataxis-Typ auf der Hauptebene. Diataxis-Typen (Tutorial, How-to, Reference, Explanation) erscheinen als **Unter-Kapitel innerhalb jedes Bereichs**. Die erweiterten Typen (Architecture, Research) werden ebenfalls als Unter-Kapitel des jeweiligen Bereichs angelegt, in dem sie thematisch relevant sind.

### BOM-Ebenen (5 Ebenen + Root)

| Ebene | Rolle | Heading im Assembled Output |
|---|---|---|
| L0 | Handbook Root | H1 |
| L1 | Funktionaler Hauptbereich | H2 |
| L2 | Kapitel innerhalb eines Bereichs | H3 |
| L3 | Abschnitt / spezifisches Thema | H4 |
| L4 | Tiefer Referenz-Unterabschnitt | H5 |
| L5 | Sehr spezifisches Sub-Thema | H6 |

**Authoring-Invariante:** Jedes DOC-Item beginnt mit `# Titel` (H1). Der Assembler berechnet den Offset: `assembled_level = 1 + (bom_level − 1)`. Hard Cap: H6.

---

## Werkzeug-Workflow (Schritt-für-Schritt)

```
1. mcp_devsteps_add (type=doc)
   → Für jeden ARCH-NNN-Slot ein DOC-Item anlegen (Titel, ggf. Platzhalter-Beschreibung)

2. mcp_devsteps_update (description)
   → Inhalt schreiben — beginnt mit # Titel (H1), H2–H5 sind Prosa-Inhalt im Item

3. devsteps_docs_classify (path oder excerpt)
   → Diataxis-Typ validieren (Tutorial / How-to / Reference / Explanation / Architecture / Research)

4. devsteps_docs_classify_confirm (decision=accept oder split)
   → Klassifikation bestätigen oder in Sub-Items aufteilen

5. mcp_devsteps_link (source=DOC-NNN, relation=documents, target=EPIC-NNN oder STORY-NNN)
   → DOC-Item mit übergeordnetem Backlog-Item verknüpfen

6. devsteps_docs_bom_status (session_id, token)
   → Fortschritt der Klassifikations-Session prüfen

7. devsteps_docs_bom_commit (session_id, token, parent_id pro Node)   [NACH STORY-284]
   → Hierarchie in docs-map.json eintragen (L0-Root bis L4)

8. devsteps_docs_assemble (bom_path, output_path)               [NACH TASK-437]
   → Handbook aus BOM-Baum zusammenbauen, Heading-Normalisierung anwenden
```

**Fallback für Schritt 7 (vor STORY-284):** DOC-Items einzeln anlegen + manuell `parent_id` in `docs-map.json` ergänzen.  
**Fallback für Schritt 8 (vor TASK-437):** Manuelles Concatenieren in `docs/generated/handbook.md` mit `offset = bom_level − 1`.

---

## ARCH-NNN Namenskonvention

ARCH-IDs sind 3-stellige Nummern (hundert-Schritte pro L1-Bereich). Sub-Knoten erhalten Dezimalerweiterungen:

- `ARCH-050` = L1-Root "MCP Tools"
- `ARCH-052` = L2-Kapitel unter ARCH-050
- `ARCH-052a` = L3-Abschnitt unter ARCH-052 (Buchstabe a–z für L3)
- `ARCH-052a1` = L4-Unterabschnitt (Ziffer 1–9 für L4)

Der ARCH-NNN-Root-Knoten (L0) ist immer `ARCH-001`.

---

## 5-Level BOM — Vollständiges Inhaltsverzeichnis

> **Legende:** `←` = bestehende DOC-Items die hier eingehängt werden | `(neu)` = neues DOC-Item zu erstellen | `(neu, deep)` = neues Deep-Reference-Item mit vollständigen Parameter-Tabellen und Schema-Details

### L0 — ARCH-001: DevSteps Handbook

---

### L1 — ARCH-010: Introduction & Overview

| ID | Titel | Typ | DOC-Mapping |
|---|---|---|---|
| ARCH-011 | What is DevSteps? — Überblick und Einsatzgebiete | Explanation | ← DOC-002 |
| ARCH-012 | Product Architecture & Components | Architecture | (neu) |
| ARCH-013 | Release Notes & Changelog | Reference | (neu) |

---

### L1 — ARCH-020: Fundamentals

| ID | Titel | Typ | DOC-Mapping |
|---|---|---|---|
| ARCH-021 | Core Concepts & Terminology | Explanation | ← DOC-003 |
| ARCH-022 | Data Model — Felder, Typen, Schemas | Reference | (neu, deep) |
| ARCH-022a | Item Types Reference (Epic, Story, Task, Bug, Spike, Doc…) | Reference | ← DOC-004, DOC-023, DOC-024, DOC-025, DOC-026, DOC-027, DOC-028 |
| ARCH-022b | Status Lifecycle & Eisenhower-Priorisierung | Reference | ← DOC-005 |
| ARCH-022c | Relationship Types — alle Relationstypen | Reference | ← DOC-006 |
| ARCH-023 | Architecture Decisions — Fundamentals | Architecture | (neu) |
| ARCH-023a | ADR-008 · Doc ItemType for Knowledge Artifacts | Architecture | ← DOC-001 |

---

### L1 — ARCH-030: AI & Copilot Integration (Spider Web)

| ID | Titel | Typ | DOC-Mapping |
|---|---|---|---|
| ARCH-031 | Overview — Spider Web Dispatch Architecture | Explanation | ← DOC-010 |
| ARCH-032 | Agent Roles & Ring Structure | Reference | ← DOC-048 |
| ARCH-032a | Triage Tiers — QUICK, STANDARD, FULL, COMPETITIVE | Reference | ← DOC-049 |
| ARCH-032b | Dispatch Prompt Format & Invariants | Reference | ← DOC-050 |
| ARCH-033 | Entry Points — Prompt-Übersicht & Einsatzgebiete | Reference | ← DOC-051 |
| ARCH-033a | Doc Items als Copilot-Wissensquelle | Explanation | ← DOC-052 |
| ARCH-034 | How-to: Mit Copilot arbeiten | How-to | ← DOC-012 (anteilig) |
| ARCH-034a | How-to: Arbeit planen (devsteps-10-plan-work) | How-to | (neu) |
| ARCH-034b | How-to: Story implementieren (devsteps-20-start-work) | How-to | (neu) |
| ARCH-034c | How-to: Dokumentations-Sprint durchführen | How-to | ← DOC-053 |
| ARCH-035 | Architecture & Design — Spider Web Protokoll | Architecture | (neu) |
| ARCH-035a | Design Decisions — Dispatch-Protokoll & Invarianten | Architecture | (neu, deep) |

---

### L1 — ARCH-040: VS Code Extension

| ID | Titel | Typ | DOC-Mapping |
|---|---|---|---|
| ARCH-041 | Overview & Installation | Explanation | ← DOC-009 (anteilig) |
| ARCH-042 | Activity Bar & Views | Reference | (neu) |
| ARCH-042a | TreeView — Items, Gruppen, Filter | Reference | (neu, deep) |
| ARCH-042b | Status Bar & Decorations | Reference | (neu, deep) |
| ARCH-043 | Dashboard / Webview | Explanation | (neu) |
| ARCH-043a | Kanban-Board — Ansichten und Interaktion | Reference | (neu, deep) |
| ARCH-043b | Charts & Statistiken — Dashboard-Kacheln | Reference | (neu, deep) |
| ARCH-044 | How-to: Extension im Arbeitsalltag | How-to | (neu) |
| ARCH-044a | How-to: Items anlegen & bearbeiten über die Extension | How-to | (neu) |
| ARCH-044b | How-to: MCP-Server starten & verwalten | How-to | ← DOC-009 (anteilig) |
| ARCH-045 | Architecture — Extension Design | Architecture | (neu) |
| ARCH-045a | Extension Activation & MCP Manager — Internals | Architecture | (neu, deep) |

---

### L1 — ARCH-050: DevSteps MCP Tools

| ID | Titel | Typ | DOC-Mapping |
|---|---|---|---|
| ARCH-051 | Overview & Tool Capabilities | Explanation | ← DOC-007 |
| ARCH-052 | Work Item CRUD Tools | Reference | ← DOC-045 |
| ARCH-052a | mcp_devsteps_add — Parameter, Typen, Beispiele | Reference | ← DOC-041 (anteilig) |
| ARCH-052b | mcp_devsteps_update — Batch, Append, Tag-Ops | Reference | (neu, deep) |
| ARCH-052c | mcp_devsteps_list / get / search / trace | Reference | (neu, deep) |
| ARCH-052d | mcp_devsteps_link / unlink — Relations-Management | Reference | ← DOC-042 |
| ARCH-053 | Spider Web Analysis Tools | Reference | ← DOC-047 |
| ARCH-053a | write_mandate_result / read_mandate_results | Reference | (neu, deep) |
| ARCH-053b | write_analysis_report / read_analysis_envelope | Reference | (neu, deep) |
| ARCH-053c | write_escalation / write_verdict / write_iteration_signal | Reference | (neu, deep) |
| ARCH-054 | Documentation Pipeline Tools | Reference | ← DOC-046, DOC-043, DOC-044 |
| ARCH-054a | devsteps_docs_import — Parameter & Session-Modell | Reference | (neu, deep) |
| ARCH-054b | devsteps_docs_classify + classify_confirm | Reference | (neu, deep) |
| ARCH-054c | devsteps_docs_bom_commit + bom_status | Reference | ← DOC-044 (anteilig) |
| ARCH-054c1 | docs-map.json Schema — alle Felder und Typen | Reference | (neu, deep) |
| ARCH-054c2 | BOM parent_id Regeln & Ebenen-Logik | Reference | ← DOC-059 (anteilig) |
| ARCH-054d | devsteps_docs_assemble — geplant (TASK-437) | Reference | (neu) |
| ARCH-054d1 | Heading Normalization Rules — offset-Berechnung | Reference | ← DOC-059 |
| ARCH-055 | How-to: MCP Tools im Dokumentations-Workflow | How-to | (neu) |
| ARCH-055a | How-to: Vollständiger Dokumentations-Sprint mit MCP | How-to | (neu) |
| ARCH-055b | How-to: BOM-Hierarchie aufbauen & validieren | How-to | ← DOC-053 |
| ARCH-056 | Architecture — MCP Server Design | Architecture | (neu) |
| ARCH-056a | Tool Registration & Prometheus Metrics | Architecture | (neu, deep) |
| ARCH-056b | Transport & Protokoll-Entscheidungen | Architecture | (neu, deep) |

---

### L1 — ARCH-060: DevSteps CLI

| ID | Titel | Typ | DOC-Mapping |
|---|---|---|---|
| ARCH-061 | Overview & Installation | Explanation | (neu) |
| ARCH-062 | Command Reference | Reference | ← DOC-008 |
| ARCH-062a | devsteps init / status / health | Reference | (neu, deep) |
| ARCH-062b | devsteps add / update / list / get / search | Reference | ← DOC-041 (anteilig) |
| ARCH-062c | devsteps export / archive / purge / metrics | Reference | (neu, deep) |
| ARCH-062d | devsteps context — Output-Formate & Optionen | Reference | (neu, deep) |
| ARCH-062d1 | Output-Formate JSON/YAML/Text — alle Flags | Reference | (neu, deep) |
| ARCH-063 | How-to: CLI-Workflows | How-to | ← DOC-012 (anteilig) |
| ARCH-063a | How-to: Neues Projekt einrichten | How-to | (neu) |
| ARCH-063b | How-to: Tägliche Arbeit mit dem CLI | How-to | (neu) |
| ARCH-064 | Architecture — CLI Design | Architecture | (neu) |

---

### L1 — ARCH-070: Documentation System (DevSteps Docs)

| ID | Titel | Typ | DOC-Mapping |
|---|---|---|---|
| ARCH-071 | Doc Items — Konzept und Zweck | Explanation | ← DOC-028, DOC-011 |
| ARCH-072 | DOC BOM — Struktur und Regeln | Explanation | (neu) |
| ARCH-072a | ARCH-NNN Namenskonvention & BOM-Struktur | Reference | ← DOC-043 |
| ARCH-072b | BOM-Level & Heading Normalization — Vollreferenz | Reference | ← DOC-059, DOC-044 |
| ARCH-073 | Diataxis Framework in DevSteps | Explanation | ← DOC-040 |
| ARCH-073a | Tutorial-Quadrant — Regeln & Signale | Explanation | (neu, deep) |
| ARCH-073b | How-to-Quadrant — Regeln & Signale | Explanation | (neu, deep) |
| ARCH-073c | Reference-Quadrant — Regeln & Signale | Explanation | (neu, deep) |
| ARCH-073d | Explanation-Quadrant — Regeln & Signale | Explanation | (neu, deep) |
| ARCH-073e | Extended Types — Architecture & Research | Explanation | (neu, deep) |
| ARCH-074 | How-to: Documentation erstellen & zusammenführen | How-to | (neu) |
| ARCH-074a | How-to: Doc Items anlegen und inhaltlich füllen | How-to | ← DOC-041 |
| ARCH-074b | How-to: BOM committen & Status prüfen | How-to | ← DOC-053 |
| ARCH-074c | How-to: Handbook zusammenbauen (assemble) | How-to | (neu) |
| ARCH-075 | Research & Architecture — Documentation System | Architecture | (neu) |
| ARCH-075a | Design Decisions — Doc Item H1-Block-Modell | Architecture | (neu, deep) |

---

## Mapping: Alle 33 bestehenden DOC-Items → ARCH-Slots

| DOC-Item | Titel (kurz) | ARCH-Slot |
|---|---|---|
| DOC-001 | ADR-008: doc ItemType | ARCH-023a |
| DOC-002 | Überblick DevSteps | ARCH-011 |
| DOC-003 | Konzepte & Grundbegriffe | ARCH-021 |
| DOC-004 | Item-Typen | ARCH-022a |
| DOC-005 | Status-Lifecycle | ARCH-022b |
| DOC-006 | Beziehungstypen | ARCH-022c |
| DOC-007 | MCP Server Werkzeugpalette | ARCH-051 |
| DOC-008 | CLI-Referenz | ARCH-062 |
| DOC-009 | VS Code Extension Übersicht | ARCH-041 / ARCH-044b |
| DOC-010 | Spider Web Agenten-Protokoll | ARCH-031 |
| DOC-011 | Copilot-Integration & Doc-Workflow | ARCH-071 |
| DOC-012 | Entwickler-Guide | ARCH-034 / ARCH-063 |
| DOC-023 | Epic | ARCH-022a |
| DOC-024 | Story | ARCH-022a |
| DOC-025 | Task | ARCH-022a |
| DOC-026 | Bug | ARCH-022a |
| DOC-027 | Spike | ARCH-022a |
| DOC-028 | Doc Item — Content Fragment | ARCH-071 |
| DOC-040 | Inhalt eines Doc Items — Felder | ARCH-073 |
| DOC-041 | Anlegen eines Doc Items | ARCH-052a / ARCH-074a |
| DOC-042 | Verknüpfen von Doc Items | ARCH-052d |
| DOC-043 | Die DOC BOM | ARCH-072a |
| DOC-044 | Inhalt der DOC BOM — ARCH-NNN Schema | ARCH-054c / ARCH-072b |
| DOC-045 | CRUD-Tools | ARCH-052 |
| DOC-046 | Docs-Pipeline — Import, Klassifikation, BOM | ARCH-054 |
| DOC-047 | Spider Web Tools | ARCH-053 |
| DOC-048 | Ring-Struktur R0–R5 | ARCH-032 |
| DOC-049 | Triage-Tiers | ARCH-032a |
| DOC-050 | Dispatch Prompt Format | ARCH-032b |
| DOC-051 | Entry Points — Prompt-Übersicht | ARCH-033 |
| DOC-052 | Doc Items als Copilot-Wissensquelle | ARCH-033a |
| DOC-053 | 7-Schritt Doc-Item-Workflow | ARCH-055b / ARCH-074b |
| DOC-059 | Content Fragment Hierarchy — H-Level Mapping | ARCH-054c2 / ARCH-072b |

---

## Neue DOC-Items (Deep Reference — zu erstellen)

Ca. 25 neue Items, konzentriert auf L3/L4. Priorität:

**Dringend (blockieren Handbook-Vollständigkeit):**
1. ARCH-022: Data Model — Felder, Typen, Schemas (Übersicht-Kapitel)
2. ARCH-054a: devsteps_docs_import — Parameter & Session-Modell (vollständige Parametertabelle)
3. ARCH-054b: devsteps_docs_classify + classify_confirm (Scoring-Logik, diataxis_type-Werte)
4. ARCH-054c1: docs-map.json Schema — alle Felder und Typen (JSON-Schema-Referenz)
5. ARCH-073a–e: Diataxis Quadrant Rules je Quadrant (Signale, Checker-Liste, Negativbeispiele)

**Wertvoll (deep reference):**
6. ARCH-042a: TreeView — Items, Gruppen, Filter (Konfigurationsoptionen)
7. ARCH-052b: mcp_devsteps_update — Batch, Append, Tag-Ops (alle Felder)
8. ARCH-052c: mcp_devsteps_list / get / search / trace (Filter-Syntax, Paginierung)
9. ARCH-053a–c: Spider Web Analysis Tools (MandateResult-Schema, Quorum-Logik)
10. ARCH-056a: Tool Registration & Prometheus Metrics (Metriken-Inventar)

---

## Acceptance Criteria

1. **ARCH-001-Root existiert** — DOC-Item `ARCH-001 DevSteps Handbook` ist in DevSteps angelegt.
2. **Alle L1-Roots (ARCH-010–ARCH-070) sind als DOC-Items angelegt** mit korrektem Diataxis-Typ und `documents`-Relation zu EPIC-046.
3. **Alle 33 bestehenden DOC-Items sind mit einem ARCH-NNN-Slot verknüpft** (via `mcp_devsteps_link`, Relation `documents` oder BOM-Eintrag in `docs-map.json`).
4. **Alle neuen Deep-Reference-Items (mind. die 5 "Dringend"-Items) sind als DOC-Items angelegt** und inhaltlich befüllt (≥200 Wörter, vollständige Parametertabellen).
5. **`devsteps_docs_bom_commit`** wird aufgerufen (nach STORY-284) und erzeugt eine `docs-map.json` mit L0–L4-Hierarchie, die den ARCH-NNN-Baum widerspiegelt.
6. **Kein DOC-Item bleibt Waise** — jedes DOC-Item hat mind. eine `documents`-Relation zu einem ARCH-NNN-Knoten oder Backlog-Item.

## Abhängigkeiten

- `depends-on`: STORY-284 (bom_commit parent_id Fix — für Schritt 7)
- `blocks`: STORY-292 (Skill-Update muss ARCH-NNN-Namen kennen)
- `implements`: EPIC-046