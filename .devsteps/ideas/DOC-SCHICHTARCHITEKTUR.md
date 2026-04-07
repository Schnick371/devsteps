---
doc_id: doc-schichtarchitektur
title: "Schichtdokumentation — Tiefenstrukturierte Dokumentationsarchitektur"
diataxis: explanation
author: th
status: draft
last_verified: 2026-04-02
related_items: [SPIKE-027]
---

# Schichtdokumentation

> 🏠 **Navigation:** [Documentation/README.md](./README.md)  
> 🏛️ **Governance:** [DOC-ARCHITECTURE.md](./DOC-ARCHITECTURE.md)  
> **Status:** Draft — Konzeptphase, Implementierung in Planung

---

## 1. Problem und Motivation

Die heutige Dokumentation hat einen Konflikt:

- Ein **Operator** sucht schnell die TUI-Tastenkürzel → will maximal 1 Seite
- Ein **Newcomer** braucht das Konzept → will Zusammenhänge verstehen, nicht Details
- Ein **Debugger** arbeitet sich durch einen Fehler → braucht jeden Schritt mit Kontext
- Ein **AI-Agent** durchsucht die Docs nach Funktionsdefinitionen → braucht spezifische Details

Die bisherige Lupe (L1/L2/L3 = getrennte Dateien) löst das für den Deployment-Bereich. Für die **gesamte System-Architektur** (alle Module, alle Funktionen) reicht das nicht — die Anzahl der Dateien würde explodieren.

**Kernidee:** Ein Dokument enthält ALLE Ebenen. Ein Viewer filtert, welche Tiefenstufe sichtbar ist.

---

## 2. Benennung

### Warum nicht "Lupe"?

"Lupe" beschreibt das Werkzeug (den Viewer), nicht die Eigenschaft des Dokuments oder des Systems selbst. Präzisere Begriffe:

| Begriff | Verwendung | Beschreibung |
|---|---|---|
| **Detailstufe** | Einstellungswert | Die Nummer 1–N die der Benutzer wählt |
| **Tiefenstruktur** | Eigenschaft des Dokuments | Ein Dokument das mehrere Detailstufen enthält |
| **Schichtdokumentation** | Der Dokumententyp | Dokumentation die in Schichten/Ebenen organisiert ist |
| **Fokustiefe** | VS Code Feature | Der Regler/Schieber im Editor |
| **Inhaltsschicht** | Eine konkrete Ebene | "Schicht 2 zeigt alle H2-Überschriften + Texte" |

**Empfehlung:** "Detailstufe" für den Slider-Wert, "Tiefenstruktur" für die Dokumenteigenschaft, "Fokustiefe" für das VS Code Feature.

### Verwandtschaft zu anderen Standards

| Standard/Konzept | Ähnlichkeit | Unterschied |
|---|---|---|
| **C4-Model** (Simon Brown) | Hierarchische Architektur-Views: System → Container → Component → Code | C4 = separate Diagramme, nicht ein Dokument mit Tiefenfilter |
| **DITA** (Darwin Information Typing Architecture) | Topic + Map Hierarchie, conditional filtering (`ditaval`) | DITA = XML, schwer, Tool-abhängig |
| **Information Mapping® (IBM)** | Strukturiertes Authoring, Block-Typen, Maps | Proprietär, kein Depth-Filter |
| **Progressive Disclosure** (UX/Nielsen) | Zeige Details erst auf Anfrage | UX-Prinzip, kein Doc-Format |
| **Stückliste (BOM)** | Hierarchie mit Positionsnummern, Ebenen | BOM ist für Produkte, nicht für Dokumente |

> **Fazit:** Das hier beschriebene Konzept ist eine Synthese aus **Stücklistenprinzip** (BOM-Hierarchie) + **DITA-Conditional-Filtering** + **C4 Views**, aber für Markdown-Dokumente ohne schweres Tooling.

---

## 3. Konzept: Tiefenstrukturiertes Dokument

### 3.1 Grundprinzip

Ein Tiefenstrukturiertes Dokument (`TSD`) ist ein Markdown-Dokument, das:
1. **Alle Inhaltsebenen** in einer Datei enthält (H1 bis Hn)
2. Inhalt einer Ebene ist **vollständig innerhalb** seines übergeordneten Abschnitts enthalten
3. Ein **Strukturmanifest** (`docs-map.json`) definiert die Hierarchie als JSON Adjacency List
4. Ein **Viewer-Filter** (Fokustiefe-Regler) blendet Ebenen ein oder aus

### 3.2 Ebenenstruktur

```
Detailstufe 1 (Gesamtschau)
  └─ Nur H1-Überschriften + T1-Fließtext sichtbar
  └─ Zeigt: Was ist das Ziel? Was leistet das System?

Detailstufe 2 (Baugruppen)
  └─ H1 + T1 (aus Stufe 1) +
  └─ H2-Überschriften + T2-Fließtext
  └─ Zeigt: Welche Hauptkomponenten gibt es?

Detailstufe 3 (Komponenten)  
  └─ Nur H2 + T2 sichtbar (H1 ausgeblendet)
  └─ Zeigt: Wie sind die Komponenten intern aufgebaut?

Detailstufe 4 (Baugruppendetail)
  └─ H2 + T2 + H3 + T3
  └─ Zeigt: Details der Unterkomponenten

...

Detailstufe N (Funktionsebene)
  └─ Nur Hn + Tn (letztes Level)
  └─ Zeigt: Einzelne Funktionsdefinitionen, Parameter, Verhalten
```

**Wichtig:** Die Stufenlogik ist:
- **Ungerade Stufen** (1, 3, 5, ...): Zeigen nur die Ebene des Levels, nicht ihre Unterelemente
- **Gerade Stufen** (2, 4, 6, ...): Zeigen eine Ebene + die direkt darunter liegende

> Diese Regel verhindert "Informationsexplosion" — man sieht immer genau das, was man braucht.

### 3.3 Stückliste (BOM): `docs-map.json`

Das Strukturmanifest ist die **SSOT** für die Dokumentenhierarchie.
Format: **JSON Adjacency List** — konsistent mit `.devsteps/index/*.json`.
Begründung: [DOC-ARCHITECTURE-BOM.md](DOC-ARCHITECTURE-BOM.md) (ADR-007).

```json
{
  "version": "1.1.0",
  "title": "Remarc Deployment Automation — Documentation Map",
  "nodes": [
    {
      "id": "ARCH-001",
      "doc_id": "deployment-lifecycle",
      "parent_id": null,
      "order": 100,
      "title": "Deployment System"
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
      "title": "PS5.1 Bootstrap-Kompatibilität"
    },
    {
      "id": "ARCH-001-P2",
      "doc_id": "deployment-phase2-init",
      "parent_id": "ARCH-001",
      "order": 30,
      "title": "Phase 2: Init (Infrastructure)"
    }
  ]
}
```

**Schlüsseleigenschaften der Adjacency List:**
- `id` = stabiler semantischer Identifier (niemals positional numeriert)
- `parent_id` = zeigt auf Parent-Knoten — frei änderbar ohne ID-Bruch
- `order` = Gap-Nummerierung (10, 20, 30...) — Einfügen mit `order=15` ohne Renumerierung
- Anzeigeposition (`1.1`, `1.2.1`) wird zur Laufzeit aus dem Baum berechnet, **nie gespeichert**

### 3.4 Verhältnis TSD ↔ aktuellem Lupe-Konzept

Das bestehende L1/L2/L3 Lupe-Konzept (ADR-006) bleibt gültig und ergänzt das TSD-Konzept:

| Konzept | Format | Zweck | Erstellt von |
|---|---|---|---|
| **L1/L2/L3 (ADR-006)** | Separate Dateien pro Zoom-Level | Einstiegspunkte für verschiedene Nutzertypen | Human (einmalig) |
| **TSD (dieses Konzept)** | Eine Datei mit allen Ebenen | Vollständige Systemarchitektur als gefilterte Ansicht | Generiert aus Manifest |
| **Lens-View (ADR-004)** | Ephemere Projektion | Themen-fokussierte Aggregation | Auto-generiert, nie committen |

---

## 4. VS Code Feature: Fokustiefe-Regler

### 4.1 Feature-Beschreibung

Ein Schieberegler im VS Code Markdown-Viewer (Remarc Extension) der:
1. Die aktuelle Detailstufe (1–N) als Slider anzeigt
2. Beim Wechsel der Stufe: H-Tags unterhalb der gewählten Stufe ausblendet
3. Bidirektionale Anzeige: kann auch "nur H2+H3 zeigen" (Stufe 3)

**UI-Metapher:** Wie der "Aperture"-Ring einer Kamera — man regelt die Tiefe, nicht die Größe.

### 4.2 Implementation via CSS-Filter (Markdown Preview)

Die technisch einfachste Implementation: ein Custom CSS für VS Code Preview, das via JavaScript Heading-Klassen togglet:

```javascript
// Konzept: content-depth-filter.js (VS Code Extension)
function setDetailLevel(level) {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach(h => {
    const hLevel = parseInt(h.tagName.slice(1));
    // Sichtbarkeitsregel:
    // Ungerade Stufe N: zeige nur hLevel == N  
    // Gerade Stufe N: zeige hLevel == N-1 AND hLevel == N
    const odd = level % 2 === 1;
    const targetLevel = odd ? Math.ceil(level / 2) : [level/2, level/2 + 1];
    const visible = odd 
      ? hLevel === targetLevel
      : (hLevel === targetLevel[0] || hLevel === targetLevel[1]);
    h.style.display = visible ? '' : 'none';
    // Auch den zugehörigen Fließtext ist/ausblenden...
  });
}
```

### 4.3 Feature Request (für Remarc VS Code Extension)

```
[RQ-EXTENSION-001] Fokustiefe-Regler im Markdown Preview

Beschreibung:
  Schieberegler in der VS Code Extension webview/preview, der zwischen 
  Detailstufen 1...N wechselt. Pro Stufe werden H-Tags und zugehöriger 
  Fließtext eingeblendet/ausgeblendet gemäß TSD-Regel (§3.2).

Acceptance Criteria:
  - Slider sichtbar in Markdown Preview Toolbar
  - Wert 1 = nur H1 + T1 sichtbar
  - Wert N = alle H-Ebenen sichtbar (=Standard-Markdown)
  - Stufen-Mapping konfigurierbar in Extension Settings
  - Zustand pro Datei persistent (session-Scope)

Priority: Niedrig (Concept Phase)
Gates on: SPIKE-027 abgeschlossen, TSD-Konzept prototyped
```

---

## 5. DevSteps Work Items als eingebettete Boxen

### 5.1 Konzept

Ein DevSteps Work Item (Story/Task) kann **innerhalb eines Dokument-Abschnitts** referenziert werden:

```markdown
## Phase 2 — Init: WinRM-Endpoint einrichten

PSRemoting muss auf einem PS7-Endpoint registriert werden, da alle Remote-Sessions
`ConfigurationName = 'PowerShell.7'` verwenden (→ PS7-REMOTE-ENFORCEMENT.md).

<!-- devsteps:embed STORY-364 -->
> **📋 STORY-364:** [WinRM PS7-Endpoint Provisioning] — `in-progress`  
> **Fortschritt:** WinRM-Konfiguration fertig; UTF-8-Profil offen  
> **Link:** [STORY-364](.devsteps/items/stories/STORY-364.md)
<!-- /devsteps:embed -->

**Schritte:**
1. `Register-PSSessionConfiguration -Name PowerShell.7 ...`
```

**Wichtig:** Die `<!-- devsteps:embed -->` Blöcke sind **ephemer** — sie werden beim Öffnen der Datei aus dem MCP gelesen und bei Commit wieder entfernt (nur im Viewer zu sehen, nie committed).

### 5.2 Bidirektionale Traceability

```
STORY-364 (DevSteps)
  ↑ references
  DEPLOYMENT-PHASE2-INIT.md §2.1 (Canonical Doc Section)
  
DEPLOYMENT-PHASE2-INIT.md §2.1
  ↓ canonical-for
  STORY-364 (Work Item — welches Issue hat diesen Abschnitt hervorgebracht)
```

Dies wird über das **`canonical-for`** Relation-Feld in der DevSteps `doc`-Item Phase realisiert (→ ADR-002, DOC-ARCHITECTURE.md §8).

---

## 6. Dokument-IDs im BOM-System

### 6.1 ID-Schema

Parallel zu den bestehenden DevSteps Work-Item-IDs (`STORY-NNN`, `TASK-NNN`) braucht das BOM-System eigene Positions-IDs:

| ID-Typ | Format | Beispiel | Bedeutung |
|---|---|---|---|
| **Doc-ID** | `doc-<kebab>` | `doc-deployment-lifecycle` | Eindeutige Datei-ID (Frontmatter) |
| **Section-ID** | `<doc_id>#<anchor>` | `deployment-lifecycle#phase-2` | Abschnitt innerhalb einer Datei |
| **BOM-Position** | `ARCH-<NNN>[-<NN>]...` | `ARCH-001-02-03` | Strukturposition im Manifest |
| **DevSteps-Doc** | `DOC-NNN` | `DOC-001` | DevSteps `doc`-Item (Phase 2) |

> Die BOM-Position ist PARALLEL zu allen anderen IDs — ein Abschnitt kann gleichzeitig haben:
> - `doc-deployment-lifecycle` (Datei-Identität)
> - `ARCH-001` (Position in der Hierarchie)
> - `DOC-042` (DevSteps Work-Item wenn Phase 2 aktiv)
> - Cross-Link zu `STORY-364` (welches Work-Item hat das erstellt)

### 6.2 Umbenennung / Verschobene Funktionen

Wenn eine Funktion in ein anderes Modul verschoben wird (z.B. `Get-SiteEnvironment` von `Remarc.Common` nach `Remarc.TC.Config`):

1. **BOM-Position** bleibt gleich wenn logische Zugehörigkeit gleich bleibt
   - Oder: BOM-Position wird verschoben (z.B. `1.3.2` → `2.1.4`)
2. **`docs-map.json`** wird aktualisiert (neuer Eintrag mit `parent_id`)
3. **`doc_id`** der Datei bleibt gleich (verhindert broken links)
4. **`supersedes` / `superseded-by`** wenn das Modul selbst deprecated wird

---

## 7. Rollout-Phasen

### Phase A: Manifest (sofort möglich)

- Erstelle `.devsteps/docs-map.json` mit der aktuellen Struktur (15–20 Docs)
- Nutze bestehende `doc_id` Werte aus Frontmatter
- Vergib `ARCH-NNN` Positionsnummern
- Kein Code nötig — nur YAML

> **Deliverable:** `.devsteps/docs-map.json` — Navigation und BOM in einem (JSON Adjacency List)

### Phase B: Lens Integration (nach SPIKE-027)

- `Build-DocLens.ps1` liest `docs-map.json` als Hierarchie-Quelle
- Generiert Lens-Views pro Detailstufe (ephemer, `.devsteps/lens/`)
- Export: "Stufe 1 View" = nur L1-Docs, "Stufe 3 View" = L3-Details

### Phase C: VS Code Feature (längerfristig)

- Extension: Fokustiefe-Regler im Markdown Preview
- Reads: `docs-map.json` für Kontext
- Feature: Inline Work-Item-Embedding via MCP `mcp_devsteps_get`

---

## 8. Constraint & Risk Matrix

| Constraint | Typ | Beschreibung |
|---|---|---|
| CC-1 | Hard | `docs-map.json` in `.devsteps/` — nie direkt bearbeiten, nur via `worker-meta-hierarchy` oder Prompts |
| CC-2 | Hard | BOM-Positionsnummern (ARCH-NNN) sind STABIL — wenn ein Doc verschoben wird, muss BOM-Position mit angepasst werden |
| CC-3 | Hard | Eingebettete Work-Item-Boxen werden nie committed — nur ephemer im Viewer |
| SC-1 | Soft | Tiefe ≤ 5 empfohlen — tiefere Strukturen werden schwer navigierbar |

| Risiko | W | Schwere | Mitigation |
|---|---|---|---|
| BOM veraltet schnell wenn Docs hinzugefügt | Hoch | Niedrig | ADR-Regel: jedes neue Doc bekommt BOM-Eintrag |
| Fokustiefe-Regler bricht bei non-standard Markdown | Mittel | Niedrig | Feature ist opt-in, Standard-Preview immer vorhanden |
| ID-Kollision: `ARCH-NNN` vs `DOC-NNN` | Niedrig | Mittel | Getrennte Namespaces; nie mischen |

---

## 9. Abgrenzung zu bestehenden Konzepten

| Was | Wo definiert | Verhältnis |
|---|---|---|
| L0/L1/L2/L3 Lupe (Zoom-Ebenen per Datei) | DOC-ARCHITECTURE.md ADR-006 | ✅ Bestehend — ergänzt TSD für Einstiegspunkte |
| `doc`-Item-Typ in DevSteps | DOC-ARCHITECTURE.md ADR-002 | ✅ Geplant — TSD nutzt `DOC-NNN` IDs wenn verfügbar |
| Lens-Views (ephemere Projektionen) | DOC-ARCHITECTURE.md ADR-004 | ✅ Bestehend — TSD nutzt `docs-map.json` als Lens-Quelle |
| Schichtdokumentation (TSD, dieses Dokument) | Hier | 🆕 Neu — BOM + Fokustiefe-Konzept |

---

## 10. Nächste Schritte

1. **JETZT:** ✅ `.devsteps/docs-map.json` erstellt (JSON Adjacency List, Phase 1-4 Deployment-Docs)
2. **SPIKE-027 abgeschlossen:** `doc`-Item-Typ → vergib `DOC-NNN` IDs für Hauptdocs
3. **Später:** `Build-DocLens.ps1` mit `docs-map.json` Integration
4. **Feature Branch:** Fokustiefe-Regler Prototyp in Remarc Extension

---

*Verwandte Konzepte: C4-Model (Simon Brown) · DITA Content Architecture · Information Mapping® · Progressive Disclosure (Nielsen Norman Group)*
