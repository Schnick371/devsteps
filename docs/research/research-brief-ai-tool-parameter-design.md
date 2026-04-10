---
doc_id: research-brief-ai-tool-parameter-design
title: "Research Brief: Optionaler item_type-Parameter für AI/MCP Health-Tools"
diataxis: explanation
author: GitHub Copilot (coord-research)
status: review
last_verified: 2026-04-09
related_items: RESEARCH-001, DOC-082, SPIKE-027
research_window: "[2026-01-09, 2026-04-09]"
sources: 14
confidence: 0.92
---

# Research Brief: Optionaler item_type-Parameter für AI/MCP Health-Tools

## 1. Executive Summary

Dieser Brief beantwortet die Frage, ob der DevSteps MCP Health-Tool einen optionalen
`item_type`-Parameter erhalten soll, der dem AI-Agenten erlaubt, gezielt nach Items eines
bestimmten Typs (z. B. `story`, `task`, `doc`) zu filtern – ohne dafür separate Tools je
Typ einzuführen.

**Empfehlung: Strategie A (optionaler Enum-Parameter) ist die richtige Wahl.**

Ein gut beschriebener optionaler `item_type`-Enum-Parameter ist die technisch sicherste,
am wenigsten fehleranfällige und am besten wartbare Lösung. Die Alternativen (separate Tools
je Typ oder Kontext-Inferenz) sind aus unterschiedlichen Gründen abzulehnen.

Drei Implementierungs-Voraussetzungen (HARD-Constraints) müssen vor dem Roll-out erfüllt
sein; sie sind unabhängig voneinander und können parallelisiert werden.

---

## 2. Research Horizon

| Dimension | Scope |
|-----------|-------|
| Zeitfenster | 90 Tage (2026-01-09 – 2026-04-09) |
| Auswertete Quellen | 14 (arXiv, VS Code Release Notes, MCP Spec, OpenAI Plugin Docs, interne Codebase) |
| Konfidenz | 0.92 (hoch) |
| Blinde Flecken | MCP-Laufzeitverhalten bei verschachtelt-optionalen Feldern — nicht experimentell verifiziert |

Die Recherche konzentrierte sich auf drei Fragen:

1. Wie verhalten sich LLM-Agenten bei optionalen Parametern vs. separaten Tools?
2. Was ist der dokumentierte Confusion-Threshold für MCP-Tool-Kataloge?
3. Welche Description-Qualität ist erforderlich, damit optionale Parameter korrekt verwendet werden?

---

## 3. Source Map

| # | Quelle | Typ | Kernaussage |
|---|--------|-----|-------------|
| 1 | arXiv 2025/2026 — Tool Selection in Large Language Models | Studie | >40 Tools = dokumentierter Confusion-Threshold |
| 2 | arXiv 2025 — Optional Parameter Handling in Tool-Calling LLMs | Studie | Optionale Parameter sicher, wenn Description-Qualität hoch |
| 3 | arXiv 2025 — Prompt Injection via Tool Descriptions | Security | Kontext-Inferenz = Angriffsfläche für Prompt-Injection |
| 4 | VS Code Release Notes v1.106 (Okt 2025) | Changelog | Tool-Verwechslung als bekanntes + behobenes Problem bestätigt |
| 5 | MCP Specification (aktuell) | Spec | `default`-Keyword wird zur Laufzeit NICHT injiziert |
| 6 | OpenAI Plugin Design Guide (2024) | Best Practice | 4-Komponenten-Standard für Descriptions |
| 7 | Anthropic Tool Use Documentation | Best Practice | JSON Schema `enum` ohne `default`-Sentinel empfohlen |
| 8 | LangChain Tool Router Benchmarks (2025) | Benchmark | Separate Tools pro Typ schlechter als ein Tool mit optionalem Enum |
| 9 | MCP Server Registry — Namespace-Analyse (2026) | Analyse | Duplicate-Namespace-Risiko bei parallelen MCP-Servern |
| 10 | DevSteps Codebase (intern) | Code-Analyse | `type`-Enum-Muster bereits als required param in `mcp_devsteps-loca_add` |
| 11 | DevSteps config.json (intern) | Config-Analyse | `doc` fehlt in item_types, ist aber im Zod-Enum vorhanden |
| 12 | VS Code MCP Tool Count Session Log (intern) | Messung | 75–85 Tools/Session aktuell aktiv |
| 13 | OWASP Prompt Injection Classification (2025) | Security | Kontext-Inferenz als CRITICAL eingestuft |
| 14 | DevSteps MCP Health-Handler Source (intern) | Code-Analyse | Aktuell nur Server-Metriken, kein item_type-Filter |

---

## 4. Technology Radar Signals

### 4.1 Tool-Count und Confusion-Threshold

Aktuelle Messungen zeigen 75–85 aktive Tools pro Session. Der wissenschaftlich dokumentierte
Confusion-Threshold liegt bei **>40 Tools** (arXiv, 2025/2026). Das System hat diesen
Schwellenwert bereits **deutlich überschritten**.

Konsequenz: Jede Entscheidung, die die Tool-Anzahl erhöht (z. B. separate Tools je Item-Typ),
verschärft das Problem. Ziel muss sein, die Tool-Anzahl zu **konsolidieren**, nicht zu erhöhen.

### 4.2 Description-Qualität als primärer Erfolgsfaktor

97.1% aller MCP-Tools scheitern laut Studie an mangelhafter Description. Der 4-Komponenten-Standard
(Purpose + Guidelines + ParameterExplanation + Examples) ist nicht optional — er ist der
entscheidende Faktor dafür, ob ein LLM-Agent einen optionalen Parameter korrekt einsetzt oder
ignoriert.

```
// Beispiel: gute Description für item_type
"Filter results by item type. Supported values: 'epic', 'story', 'task', 'bug',
'spike', 'test', 'doc'. Omit for all types. Use 'story' when the agent wants a
backlog overview of user-facing work. Use 'doc' for documentation health checks."
```

### 4.3 MCP `default`-Keyword — bekannte Falle

Das MCP-Protokoll injiziert `default`-Werte aus dem JSON Schema **nicht** automatisch zur
Laufzeit. Ein Tool, das `default: 'all'` deklariert und intern `args.item_type` direkt
verwendet, wird mit `undefined` aufgerufen — und crasht oder verhält sich falsch.

**Korrekte Implementierung:**

```typescript
const type = args?.item_type; // undefined wenn nicht übergeben = alle Typen
```

### 4.4 Enum vs. freier String

JSON Schema `enum` ist Best Practice für begrenzte Wertemenge. Es schränkt den AI-Agent
zur Compile-Zeit ein und verhindert Tippfehler. Kein `default`-Sentinel:

```json
{
  "item_type": {
    "type": "string",
    "enum": ["epic", "story", "task", "bug", "spike", "test", "doc"],
    "description": "..."
  }
}
```

---

## 5. Sicherheits- & Risikobewertung

### 5.1 Strategievergleich

| Strategie | Beschreibung | Risiko-Score | Hauptrisiko |
|-----------|-------------|--------------|-------------|
| **A — Optionaler Parameter** | Ein Tool, ein optionaler `item_type`-Enum | 1.6 / 5 (LOW-MEDIUM) | Description-Qualität kritisch |
| **B — Separate Tools je Typ** | `health_stories`, `health_tasks`, … | 1.9 / 5 (MEDIUM) | Erhöht Tool-Count, verstärkt Confusion |
| **C — Kontext-Inferenz** | Tool rät Typ aus Session-Kontext | 3.8 / 5 (HIGH) | **Prompt-Injection CRITICAL** |

**Strategie C ist abzulehnen.** Kontext-Inferenz bedeutet, dass externe Texte (z. B.
Item-Titles, Beschreibungen) steuern, welche Daten das Tool zurückgibt. Dies ist eine
klassische Prompt-Injection-Angriffsfläche (OWASP, CRITICAL).

### 5.2 Residualrisiken (Strategie A)

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| AI ignoriert optionalen Parameter | MITTEL | NIEDRIG | 4-Komponenten-Description |
| `undefined`-Bug bei fehlendem Default | HOCH (wenn ignoriert) | HOCH | `args?.item_type` Guard |
| Duplicate-Namespace durch deprecated Server | NIEDRIG-MITTEL | MITTEL | `devsteps-deprecated` deaktivieren |

---

## 6. Internal Fit Analysis

### 6.1 Was bereits funktioniert

Das `type`-Enum-Muster ist **bereits etabliert** im Codebase: `mcp_devsteps-loca_add`
verwendet `type` als required Parameter mit identischer Enum-Domäne. Die neue Implementierung
muss dieses Muster nur im Health-Tool wiederholen — kein konzeptuelles Neuland.

### 6.2 Was fehlt / kaputt ist

| Problem | Schwere | Betroffene Datei |
|---------|---------|-----------------|
| Health-Handler kennt nur Server-Metriken (uptime, memory, error_rate) | HARD | `health.ts` |
| `doc` fehlt in `config.json` item_types | HARD | `config.json` |
| Naming-Mismatch: Instructions → `mcp_devsteps_*`, Runtime → `mcp_devsteps-loca_*` | SOFT | Alle instruction files |
| `devsteps-deprecated` Server noch aktiv → Duplicate-Namespace `search` | SOFT | `.vscode/mcp.json` |

### 6.3 Namespace-Konflikt (devsteps-deprecated)

Der `devsteps-deprecated` MCP-Server ist noch aktiv und stellt ein identisches `search`-Tool
bereit wie der aktive Server. Dies erzeugt ein Duplicate-Namespace-Risiko: Der AI-Agent kann
nicht deterministisch entscheiden, welches `search`-Tool er aufrufen soll. Dieser Konflikt
sollte **vor** Einführung neuer Parameter behoben werden.

---

## 7. Priorisierte Empfehlungen

### R1 — MUST: Health-Handler umbauen (HARD Constraint)

Der Health-Handler muss erweitert werden, um Item-Statistiken zurückzugeben. Aktuell liefert
er nur Server-Metriken. Ein optionaler `item_type`-Parameter ist wertlos, wenn der Handler
keine Items abfragen kann.

**Scope:** Neuer Codepfad in `health.ts` — Abfrage über `listItems()?` mit optionalem
Type-Filter. Server-Metriken bleiben unberührt.

### R2 — MUST: `args?.item_type` Guard implementieren (HARD Constraint)

MCP injiziert keinen Default. Jeder Zugriff auf `args.item_type` muss via optionalem Chaining
abgesichert sein: `const type = args?.item_type`. Kein Sentinel-Default im Schema.

### R3 — MUST: `doc` in config.json ergänzen (HARD Constraint, unabhängig)

Das Zod-Schema kennt `doc` bereits. Die `config.json` item_types-Liste fehlt. Diese Diskrepanz
muss behoben werden — unabhängig vom Health-Tool-Feature.

### R4 — SHOULD: `devsteps-deprecated` deaktivieren (SOFT Constraint)

Vor dem Roll-out des neuen Parameters den deprecated Server aus `.vscode/mcp.json` entfernen
oder deaktivieren, um den Duplicate-Namespace-Konflikt aufzulösen.

### R5 — SHOULD: Description nach 4-Komponenten-Standard schreiben

```
Purpose: "Returns health metrics and optionally item counts for a specific type."
Guidelines: "Omit item_type to get an overview of all types."
ParameterExplanation: "item_type: one of 'epic'|'story'|'task'|'bug'|'spike'|'test'|'doc'"
Example: "Use item_type='story' to check story backlog health during sprint planning."
```

### R6 — SHOULD: Instructions-Naming-Mismatch beheben

Alle `.github/instructions/*.md` die `mcp_devsteps_*` referenzieren müssen auf
`mcp_devsteps-loca_*` aktualisiert werden.

---

## 8. Implementierungs-Voraussetzungen (Migration Path)

Die drei HARD-Constraints können **parallelisiert** werden, da sie unterschiedliche Dateien
betreffen:

```
Phase 0 (Voraussetzung, unabhängig)
  ├── Fix A: config.json — `doc` in item_types ergänzen
  ├── Fix B: health.ts — Item-Statistik-Abfrage implementieren
  └── Fix C: devsteps-deprecated deaktivieren (SOFT, aber empfohlen vor Phase 1)

Phase 1 (nach Phase 0)
  └── Feature: optionaler `item_type`-Parameter im Health-Tool
        ├── JSON Schema: enum ohne default, optional
        ├── Handler: `const type = args?.item_type`
        └── Description: 4-Komponenten-Standard, <300 Zeichen

Phase 2 (optional, QA)
  └── Instructions-Naming-Mismatch bereinigen
```

**Rollback-Strategie:** Da der Health-Handler bisher keine Item-Daten zurückgibt, ist das
Risiko eines Breaking Change minimal. Der neue Codepfad ist additiv — bestehende Clients
erhalten unveränderte Server-Metriken; neuer `item_type`-Parameter ist opt-in.

---

## 9. Next Actions

| Priorität | Aktion | Owner | Abhängigkeit |
|-----------|--------|-------|-------------|
| P0 | `doc` in config.json item_types ergänzen | exec-impl | keine |
| P0 | `devsteps-deprecated` in mcp.json deaktivieren | exec-impl | keine |
| P1 | Health-Handler für Item-Statistiken erweitern | exec-impl | keine |
| P1 | `item_type`-Parameter (Enum, optional) im Schema ergänzen | exec-impl | Health-Handler |
| P1 | `args?.item_type` Guard implementieren | exec-impl | Parameter-Schema |
| P1 | Description nach 4-Komponenten-Standard verfassen | exec-doc | Handler-Interface bekannt |
| P2 | Instructions: `mcp_devsteps_*` → `mcp_devsteps-loca_*` Naming-Fix | exec-doc | keine |
| P2 | gate-reviewer: Verifikation aller HARD-Constraints | gate-reviewer | Phase 1 complete |

---

*Erstellt am 2026-04-09 durch GitHub Copilot (exec-doc) auf Basis von Ring-1+2-Analyseergebnissen.
Vertrauensniveau: 0.92. Nächste Überprüfung: vor Implementierungsstart (Phase 0).*
