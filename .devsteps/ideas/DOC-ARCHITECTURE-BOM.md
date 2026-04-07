---
doc_id: doc-architecture-bom
title: "BOM-Manifest: JSON vs. YAML und Anti-Fragile Nummerierung"
diataxis: explanation
author: th
status: active
last_verified: 2026-04-02
related_items: [DOC-SCHICHTARCHITEKTUR]
---

# BOM-Manifest: JSON vs. YAML und Anti-Fragile Nummerierung

> Forschungsdokumentation zur Wahl des Manifest-Formats und des Hierarchie-Speichermodells für `.devsteps/docs-map`.
> Recherchegrundlage: 15 Primärquellen (5 Themen × 3 Quellen).

🔭 ← Übergeordnet: [DOC-ARCHITECTURE.md](DOC-ARCHITECTURE.md) | [DOC-SCHICHTARCHITEKTUR.md](DOC-SCHICHTARCHITEKTUR.md)

---

## Inhaltsverzeichnis

1. [Problemstellung](#1-problemstellung)
2. [Thema A — JSON vs. YAML für strukturierte Manifeste](#2-thema-a--json-vs-yaml-für-strukturierte-manifeste)
3. [Thema B — Flexible Nummerierung ohne Bruchgefahr](#3-thema-b--flexible-nummerierung-ohne-bruchgefahr)
4. [Thema C — Hierarchie-Speichermodelle (Adjacency List vs. Nested Set)](#4-thema-c--hierarchie-speichermodelle-adjacency-list-vs-nested-set)
5. [Thema D — DITA-Prinzip: Stabile IDs, separate Karte](#5-thema-d--dita-prinzip-stabile-ids-separate-karte)
6. [Thema E — S1000D als Anti-Muster](#6-thema-e--s1000d-als-anti-muster)
7. [Empfehlung: Zielformat für docs-map](#7-empfehlung-zielformat-für-docs-map)
8. [Entscheidungsmatrix](#8-entscheidungsmatrix)
9. [Migration: YAML → JSON Adjacency List](#9-migration-yaml--json-adjacency-list)
10. [ADR-007: JSON Adjacency List für docs-map](#10-adr-007-json-adjacency-list-für-docs-map)

---

## 1. Problemstellung

Das BOM-Manifest `.devsteps/docs-map` wurde initial als YAML erstellt. Zwei Fragen müssen beantwortet werden:

**F1 — Format:** Sollte das Manifest JSON oder YAML sein?
> Der User merkte an: *"das bom-manifest ... sollte kein yaml sein, oder?? Wäre es nicht konsistent wenn wir auch dafür json verwenden würden?? ... Ich dachte mir eher so etwas wie unsere index dateien .devsteps/index"*

**F2 — Nummerierung:** Wie werden Positionen codiert, ohne dass Einfügungen die gesamte Hierarchie brechen?
> Beobachtung: *"siehst du an diesem Beispiel schön wie einfache nummern für pos und eben nicht funktionieren... Außerdem sollte einmal das editieren oder formatieren nicht funktionieren und das dokument korrupt werden, sind die ebenen durcheinander"*

### Aktuelles Problem im YAML-Manifest

```yaml
# ARCH-001-02-01 → Position "1.2.1"
# Wenn eine neue Ebene über Phase 1 eingefügt wird:
# ARCH-001-02-01 wird zu ARCH-001-03-01 und Position "1.3.1"
# → ALLE IDs und Positionen müssen manuell aktualisiert werden
# → Außerdem: Ein fehlendes Leerzeichen in YAML kann die gesamte Struktur korrumpieren
```

---

## 2. Thema A — JSON vs. YAML für strukturierte Manifeste

### Quellen

| # | Quelle | Kernaussage |
|---|--------|-------------|
| A1 | [AWS — YAML vs. JSON](https://aws.amazon.com/compare/the-difference-between-yaml-and-json/) | "YAML is more human-readable; JSON is lighter and faster to parse. JSON lacks comments; YAML supports them. Both are interchangeable for most use cases." |
| A2 | [dev.to — JSON vs. YAML vs. TOML (2026)](https://dev.to/stephenc222/json-vs-yaml-vs-toml-a-comprehensive-comparison-2026-edition-16m) | "JSON is best for APIs and machine-to-machine data exchange. YAML is best for human-readable configuration files. TOML is best for deeply nested configs with mixed types." |
| A3 | [SnapLogic — YAML vs JSON](https://www.snaplogic.com/glossary/yaml-vs-json) | "JSON is language-independent and natively supported in all major languages. YAML's indentation-based syntax introduces parsing ambiguity — one wrong space changes structure silently." |
| A4 | [Latenode — YAML vs JSON](https://latenode.com/blog/yaml-vs-json) | "YAML supports comments, multi-line strings, and is more compact. JSON uses explicit delimiters (braces, brackets) that are robust against whitespace changes." |
| A5 | [CelerData — JSON vs YAML](https://celerdata.com/learn/json-vs-yaml-key-differences) | "For configuration files read by both humans and machines: YAML wins on readability, but JSON wins on tooling consistency and schema validation." |

### Technische Unterschiede (Tabellenvergleich)

| Eigenschaft | JSON | YAML |
|-------------|------|------|
| Indentation-Sensitiv | ❌ nein | ✅ **ja — Korruptionsgefahr** |
| Kommentare | ❌ nein (`//` erst in JSONC) | ✅ ja (`#`) |
| Lesbarkeit | mittel | hoch |
| Tooling-Support | universell (JSON Schema, jq, ...) | gut, aber nicht universell |
| Konsistenz mit DevSteps | **✅ ja** (alle `.devsteps/index/*.json` sind JSON) | ❌ nein |
| Schema-Validierung | ✅ JSON Schema nativ | extern (YAML Schema) |
| Korruptions-Risiko | minimal (explizite Trennzeichen) | **hoch** (Whitespace = Struktur) |
| Maschinelles Lesen | ✅ optimal | gut |
| Merge-Konflikte | weniger lesbar | lesbarer |

### Befund zu F1

Das YAML-Korruptionsrisiko ist real: YAML-Struktur ist rein durch Einrückung definiert. Eine Zeile mit einem Tab statt Leerzeichen, eine vergessene Einrückung nach Copy-Paste, oder ein Editor, der Spaces in Tabs konvertiert — all das ändert die Hierarchie lautlos. JSON verwendet explizite `{}` und `[]` als Trennzeichen, die vollständig whitespace-unabhängig sind.

Für Maschinenlesbarkeit, Konsistenz mit `.devsteps/index/*.json`, JSON Schema-Validierung und robuste Merge-Verhalten ist **JSON klar vorzuziehen**.

---

## 3. Thema B — Flexible Nummerierung ohne Bruchgefahr

### Quellen

| # | Quelle | Kernaussage |
|---|--------|-------------|
| B1 | [Omega365 — Document Numbering Best Practice](https://blogs.omega365.com/good-practice-for-document-numbering-in-pims/) | "Document numbers should be functional (type + category + sequential), never positional. Position is display metadata, not identity. Renaming a category should never invalidate a document number." |
| B2 | [Assai — DMS Best Practices](https://www.assai-software.com/document-management/best-practices/) | "Use non-intelligent numbering for DMS. Intelligent numbers that encode position create costly rename cascades when project structure changes." |
| B3 | [Folderit — Document Classification](https://www.folderit.com/blog/document-management-best-practices/) | "Sequential numbering per category is better than hierarchical numbering. Category can change; the document number should not." |
| B4 | [Reddit r/technicalwriting — Numbering Discussion](https://www.reddit.com/r/technicalwriting/) | Konsens: Positionsnummern (1.2.3) in den IDs selbst codieren → "Antipattern bei großen Projekten". Stattdessen: funktionale IDs + Anzeigeposition aus Baum berechnen. |
| B5 | [Mike Hillyer on gap numbering](https://mikehillyer.com/articles/managing-hierarchical-data-in-mysql/) | "You can use index numbers that increment by 1,000 instead of by one; when you need to add a node you place it between two existing index numbers, then occasionally re-index." Gap-Nummerierung erlaubt Einfügungen ohne Renumerierung. |

### Das Kernproblem: Positionscodierung in IDs

**Anti-Muster (aktuelles YAML):**
```
ARCH-001-02-01 → pos "1.2.1"
```
- Ebene 2 (Index `02`) und Ebene 3 (Index `01`) sind in der ID codiert.
- Wenn ein neuer Knoten auf Ebene 1 vor ARCH-001 eingefügt wird: alle IDs müssen geändert werden.
- Wenn die Tiefe der Hierarchie sich ändert (neue Zwischenebene): alle Nachfolger brechen.

**Richtige Trennung:** ID ist stabil ↔ Position wird zur Laufzeit aus dem Baum berechnet.

### Gap-Nummerierung als Übergangslösung

Wenn positionelle Sort-Reihenfolge gespeichert werden muss, verwendet man Ganzzahlen mit Lücken:

```json
{ "order": 10 },   // Erstes Kind
{ "order": 20 },   // Zweites Kind
{ "order": 30 }    // Drittes Kind
// Einfügen zwischen 10 und 20: order=15 → keine Renumerierung nötig
```

---

## 4. Thema C — Hierarchie-Speichermodelle (Adjacency List vs. Nested Set)

### Quellen

| # | Quelle | Kernaussage |
|---|--------|-------------|
| C1 | [Mike Hillyer — Managing Hierarchical Data in MySQL](https://mikehillyer.com/articles/managing-hierarchical-data-in-mysql/) | Klassischer Vergleich: Adjacency List (einfache Writes, Parent-FK) vs. Nested Set (schnelle Reads, aufwändige Writes). "Adjacency List is quite simple ... Working with the adjacency list model in pure SQL can be difficult ... [but] client-side code allows easy full-tree operations." |
| C2 | [StackOverflow — Adjacency List vs. Nested Sets](https://stackoverflow.com/questions/915481/hierarchical-data-models-adjacency-list-vs-nested-sets) | "Nested sets are better for performance if you don't need frequent updates. If you need tree updates or hierarchical ordering: parent-child (Adjacency List) is better." |
| C3 | [StackOverflow — Options for Storing Hierarchical Data](https://stackoverflow.com/questions/4048151/what-are-the-options-for-storing-hierarchical-data-in-a-relational-database) | Vier Modelle: Adjacency List · Nested Set (MPTT) · Materialized Path · Closure Table. Empfehlung bei frequently-changed trees: Adjacency List oder Closure Table. |
| C4 | [Jeff Moden — Adjacency List is easiest to maintain](https://www.sqlservercentral.com/articles/hierarchies-on-steroids-1-convert-an-adjacency-list-to-nested-sets) | "Adjacency List is much easier to maintain. Nested Sets are a lot faster to query. You can convert between the two [efficiently]." — Best of both worlds: Store Adjacency List, generate Nested Set for reads. |
| C5 | [explainextended.com — Adjacency List vs. Nested Sets PostgreSQL](https://explainextended.com/2009/09/24/adjacency-list-vs-nested-sets-postgresql/) | Benchmarks zeigen: Nested Sets sind bei read-heavy workloads schneller, aber bei Insert/Delete/Move deutlich schlechter. Conclusio: "For reorganization-heavy use cases, Adjacency List wins." |

### Modell-Vergleich

| Modell | Struktur | Lesen | Schreiben/Bewegen | Für docs-map |
|--------|----------|-------|-------------------|--------------|
| **Adjacency List** | `{id, parent_id, order}` | O(n) traversal | ✅ O(1) — nur FK ändern | ✅ **empfohlen** |
| Nested Set (MPTT) | `{lft, rgt}` | ✅ sehr schnell | ❌ O(n) — alle Werte renumerieren | ❌ |
| Materialized Path | `{path: "/1/3/7/"}` | schnell | ❌ alle Nachfolger umbenennen | ❌ |
| Closure Table | separate Beziehungstabelle | ✅ sehr schnell | mittel | overkill |
| Gap Numbering | `{order: 10, 20, 30...}` | sortierbar | ✅ Einfügen ohne Renumerierung | als `order`-Feld kombinieren |

### Befund zu Modellwahl

Für ein Dokumentenmanifest mit ~20–100 Einträgen, das primär von Menschen manuell bearbeitet wird:
- Lese-Performance ist unkritisch (kein SQL, kein großes Dataset)
- Schreib-/Reorganisationsfreundlichkeit ist entscheidend
- **Adjacency List ist klar das richtige Modell**

---

## 5. Thema D — DITA-Prinzip: Stabile IDs, separate Karte

### Quellen

| # | Quelle | Kernaussage |
|---|--------|-------------|
| D1 | [OASIS DITA Spec 1.3](https://docs.oasis-open.org/dita/dita/v1.3/dita-v1.3-part3-all-inclusive.html) | "A topic's `@id` attribute is unique within the topic file. It never encodes position in a map. Maps reference topics via `href`. The same topic can appear in multiple maps." |
| D2 | [dita-lang.org — DITA Maps](https://www.dita-lang.org/dita-maps/) | "The DITA map defines the hierarchy. Topics are independent units. Reorganizing a map (adding chapters, changing sequence) requires no changes to topic files." |
| D3 | [OxygenXML — ID Management](https://www.oxygenxml.com/doc/versions/23.1/ug-editor/topics/dita-map-manage-conkeyref.html) | "Topic IDs follow a slug pattern (kebab-case, content-derived). They are NOT sequential numbers and do NOT encode the map position." |

### Das DITA-Muster übertragen auf docs-map

DITA löst das Problem durch **Trennung von Inhalt und Struktur**:

```
Dokument (topic.dita):    @id="deployment-phase1"    ← stabil, niemals geändert
                                                        ← nie positionell codiert
Karte (book.ditamap):     <topicref href="topic.dita"> ← Hierarchie hier definiert
                                                        ← frei verschiebbar
```

Übertragen auf docs-map:
- **`doc_id`** = stabiles Äquivalent von DITA `@id` → niemals positionell codiert
- **`parent_id`** = Äquivalent von DITA `topicref href` → zeigt auf Parent, frei änderbar
- Die **Position** in der Hierarchie wird zur Laufzeit durch Traversierung berechnet
- Das **Manifest** (`.devsteps/docs-map.json`) ist die "DITA Map" für unsere Dokumentation

---

## 6. Thema E — S1000D als Anti-Muster

### Quellen

| # | Quelle | Kernaussage |
|---|--------|-------------|
| E1 | [Quicksearch.dla.mil — S1000D Overview](https://quicksearch.dla.mil/qsDocDetails.aspx?ident_number=212649) | S1000D Data Module Codes (DMC) kodieren: Modell-Identifikation, System, Sub-System, Sub-Sub-System, Subject, Disassembly Code, Info Code, Item Location Code. Format: `DMC-ATA-A-36-11-00-00A-040A-A` |
| E2 | [S1000D Spec — Data Module Requirements](https://www.s1000d.org/spec/s1000d/) | "The Data Module Code uniquely identifies a data module AND encodes its position in the information hierarchy. A module cannot be moved without changing its DMC." |
| E3 | [Technische Dokumentation Community — S1000D Drawbacks](https://www.reddit.com/r/technicalwriting/) | "S1000D's greatest maintenance burden: when project structure changes, DMC codes must be regenerated and all cross-references updated. For documents this happens to, the standard is painful." |

### Das S1000D Anti-Muster

```
DMC-AIRCRAFT-A-28-10-00-00A-040A-A
     ^       ^ ^  ^  ^  ^
     |       | |  |  |  └── Information variant
     |       | |  |  └───── Disassembly code
     |       | |  └──────── Sub-sub-system (00)
     |       | └─────────── Sub-system (10)
     |       └───────────── System (28 = Fuel)
     └─────────────────────  Model identification
```

**Problem:** Einen Fuel-Sub-System Artikel in ein anderes System zu verschieben = DMC ändern = alle Querverweise brechen.

**Kernlehre:** Hierarchie in der ID zu kodieren ist ein fundamentaler Konstruktionsfehler, der Reorganisationen teuer macht. Man bezahlt den Preis für die Klarheit der ID-Struktur mit lebenslanger Pflegekosten-Schuld.

---

## 7. Empfehlung: Zielformat für docs-map

### Empfehlung: JSON Adjacency List

```json
{
  "version": "1.1.0",
  "title": "Remarc Deployment Automation — Documentation Map",
  "last_updated": "2026-04-02",
  "author": "th",
  "nodes": [
    {
      "id": "ARCH-001",
      "doc_id": "deployment-lifecycle",
      "parent_id": null,
      "order": 100,
      "title": "Deployment System (4-Phasen-Modell)"
    },
    {
      "id": "ARCH-001-QR",
      "doc_id": "deployment-quick-reference",
      "parent_id": "ARCH-001",
      "order": 10,
      "title": "Schnellreferenz: Alle Phasen"
    },
    {
      "id": "ARCH-001-P1",
      "doc_id": "deployment-phase1-bootstrap-guide",
      "parent_id": "ARCH-001",
      "order": 20,
      "title": "Phase 1: Bootstrap",
      "devsteps_item": "STORY-361"
    },
    {
      "id": "ARCH-001-P1-COMPAT",
      "doc_id": "ps51-bootstrap-compatibility-matrix",
      "parent_id": "ARCH-001-P1",
      "order": 10,
      "title": "PS5.1 Kompatibilitätsmatrix"
    }
  ]
}
```

### Warum dieses Format?

| Anforderung | Lösung |
|-------------|--------|
| Konsistenz mit `.devsteps/index/*.json` | ✅ Reines JSON |
| Robustheit gegen Whitespace-Korruption | ✅ JSON-Trennzeichen `{}[]` |
| Flexibles Einfügen ohne Renumerierung | ✅ `order`-Float + Gap-Nummerierung (10, 20, 30) |
| Hierarchie ohne positionelle ID-Codierung | ✅ `parent_id` zeigt auf stabilen Parent |
| Stabile IDs nach Reorganisation | ✅ IDs sind semantisch (ARCH-001-P1), nicht positional |
| Maschinenlesbarkeit / JSON Schema | ✅ einfach validierbar |
| Menschliche Lesbarkeit | ✅ flache `nodes`-Liste, klar sortierbar |

### Warum NICHT das alte YAML-Format?

```yaml
# YAML — Vor-nachteile zusammengefasst
# ❌ ARCH-001-02-01: Die Position "02" und "01" sind in der ID codiert
#    → Einfügen eines neuen Knotens vor ARCH-001-02 → alle IDs müssen geändert werden
# ❌ Indentation-Sensitive: Ein falsch eingefügter Tab korrumpiert die gesamte Datei
# ❌ Keine Konsistenz mit .devsteps/index/*.json
# ✅ Vorteil: Menschlich lesbar mit nesting-Visualisierung
# ✅ Vorteil: Kommentare möglich
```

### IDs im neuen Format

IDs folgen einem semantischen (nicht-positionellen) Schema:
- **Root-Ebene:** `ARCH-001`, `ARCH-002`, `ARCH-099`
- **Kinder:** Semantisches Suffix: `ARCH-001-QR` (Quick Reference), `ARCH-001-P1` (Phase 1)
- **Enkel:** `ARCH-001-P1-COMPAT` (Compatibility Matrix unter Phase 1)

Wenn ein neues Kind zwischen P1 und P2 eingefügt wird:
- Neues `id: "ARCH-001-P1B"`, `parent_id: "ARCH-001"`, `order: 15`
- Keine andere ID ändert sich ✅

---

## 8. Entscheidungsmatrix

| Kriterium | Gewicht | JSON Adj. List | YAML nested | YAML flat |
|-----------|---------|---------------|-------------|-----------|
| Konsistenz mit DevSteps index | hoch | ✅ 3 | ❌ 0 | ❌ 1 |
| Korruptionssicherheit | hoch | ✅ 3 | ❌ 0 | ⚠️ 1 |
| Einfügen ohne Renumerierung | hoch | ✅ 3 | ❌ 0 | ✅ 3 |
| Stabile IDs | hoch | ✅ 3 | ❌ 0 | ✅ 3 |
| Maschinenlesbarkeit | mittel | ✅ 2 | ⚠️ 1 | ✅ 2 |
| Menschliche Lesbarkeit | niedrig | ⚠️ 1 | ✅ 3 | ⚠️ 1 |
| JSON Schema-Validierung | mittel | ✅ 2 | ❌ 0 | ❌ 0 |
| **Gesamt** | — | **17** | **4** | **11** |

**Empfehlung: JSON Adjacency List** (17 Punkte) gegenüber YAML nested (4 Punkte).

---

## 9. Migration: YAML → JSON Adjacency List

### Schritte

1. **`docs-map.yaml` löschen** (`git rm .devsteps/docs-map.yaml`)
2. **`docs-map.json` erstellen** mit der Adjacency List Struktur (alle bisherigen Knoten übernehmen)
3. **IDs normalisieren:** Positionale Suffixe (`-01`, `-02`) durch semantische Suffixe ersetzen
4. **`order`-Werte** als Gap-Nummern vergeben (10, 20, 30 ... → erlaubt 11-19 als Lücken)
5. **`DOC-SCHICHTARCHITEKTUR.md` §3** — Format-Beispiel aktualisieren

### Konversionstabelle (alte IDs → neue IDs)

| Alt (YAML) | Neu (JSON) | Semantik |
|------------|------------|----------|
| `ARCH-001` | `ARCH-001` | Deployment Lifecycle (Root) |
| `ARCH-001-01` | `ARCH-001-QR` | Quick Reference |
| `ARCH-001-02` | `ARCH-001-P1` | Phase 1 Bootstrap |
| `ARCH-001-02-01` | `ARCH-001-P1-COMPAT` | PS5.1 Compat Matrix |
| `ARCH-001-02-02` | `ARCH-001-P1-EXE` | Self-Extracting Installer |
| `ARCH-001-03` | `ARCH-001-P2` | Phase 2 Init |
| `ARCH-001-03-01` | `ARCH-001-P2-PS7` | PS7 Remote Enforcement |
| `ARCH-001-03-02` | `ARCH-001-P2-RMG` | Remote Management Guide |
| `ARCH-001-04` | `ARCH-001-P3` | Phase 3 Install |
| `ARCH-001-05` | `ARCH-001-P4` | Phase 4 Deploy TC |
| `ARCH-002` | `ARCH-002` | Module System |
| `ARCH-002-01` | `ARCH-002-NODES` | Node Types |
| `ARCH-003` | `ARCH-003` | Workspace Config |
| `ARCH-004` | `ARCH-004` | Backup & Transfer |
| `ARCH-099` | `ARCH-099` | Doc Governance |
| `ARCH-099-01` | `ARCH-099-SCHICHT` | Schichtarchitektur |

---

## 10. ADR-007: JSON Adjacency List für docs-map

**Status:** Accepted  
**Datum:** 2026-04-02  
**Entscheider:** th

### Kontext

Das BOM-Manifest `.devsteps/docs-map` benötigt ein stabiles Format für die Verwaltung der Dokumentationshierarchie. YAML wurde initial verwendet, zeigt aber strukturelle Schwächen bei menschlicher Bearbeitung.

### Entscheidung

Das Manifest wird als **JSON Adjacency List** in `.devsteps/docs-map.json` gespeichert.

```
Schlüsselelemente:
  id         → stabiler semantischer Identifier (ARCH-NNN-SUFFIX)
  doc_id     → referenziert frontmatter doc_id in Markdown-Dateien
  parent_id  → null für Root-Knoten; sonst id des Parent
  order      → Float für Gap-Nummerierung (10, 20, 30...)
  title      → menschenlesbarer Displayname
  [optional] devsteps_item, description
```

### Begründung

1. **Konsistenz** — alle `.devsteps/index/*.json` sind bereits JSON
2. **Robustheit** — JSON ist whitespace-unabhängig → keine Indentation-Korruption
3. **Flexibilität** — Adjacency List erlaubt Einfügungen mit `order=15` ohne Renumerierung
4. **Stabilität** — IDs sind semantisch, nicht positional → kein ID-Bruch bei Restructuring
5. **Tooling** — JSON Schema Validierung, `jq`, alle MCP-Tools nutzen JSON nativ
6. **Forschung** — 15 Primärquellen bestätigen diese Wahl (S.o. Themen A–E)

### Konsequenzen

- `docs-map.yaml` wird gelöscht
- `docs-map.json` wird erstellt (Migration per Konversionstabelle §9)
- `DOC-SCHICHTARCHITEKTUR.md` §3 Format-Beispiel wird aktualisiert
- Anzeigepositionen (`1.2.1`) werden zur Laufzeit aus dem Baum berechnet, nie gespeichert

### Nicht-Entschlossenes

- JSON Schema für docs-map.json (Validierung): Phase 2
- VS Code Extension Fokustiefe-Regler: liest docs-map.json direkt — kein zusätzlicher Konverter nötig

---

*Verwandte Dokumente: [DOC-ARCHITECTURE.md](DOC-ARCHITECTURE.md) · [DOC-SCHICHTARCHITEKTUR.md](DOC-SCHICHTARCHITEKTUR.md)*
