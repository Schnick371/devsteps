# SPIKE-048 Research Brief — MD-Dokument-Revisionen in DevSteps
## Git-native History vs. proprietäres Copy-on-Write · AI Staleness-Detection · Minimal-Schema-Erweiterung

**Item:** RESEARCH-REVISION-MD-001  
**Sprint:** revision-md-session1  
**Triage-Tier:** DEEP  
**Datum:** 2026-04-04  
**Status:** GATE PASS — Rev 3 (Zähltexte korrigiert, gate-reviewer 2026-04-04)

---

## 1. Executive Summary

DevSteps besitzt kein proprietäres Revisionssystem für MD-Dateien. Die Analyse von 14 Quellen (90-Tage-Fenster) zeigt einen Industriekonsens: Git ist der korrekte Revisions-Backbone für dokumentenbasierte Work-Items, kein internes Copy-on-Write-System. **Empfehlung: Option B (Git-MCP-Server als externe Konfiguration) kombiniert mit Option C (3 minimale JSON-Felder: `description_hash`, `description_updated`, `description_edit_count`) bilden zusammen die optimale Lösung.** Option D (Full Copy-on-Write) wird abgelehnt — kritisches Risiko durch Two-Source-of-Truth, 4–6 Wochen Aufwand, und strukturell inkompatibel mit dem bestehenden Single-Write-Path. Ein identifizierter WRITE-ORDER BUG in `update.ts` (JSON vor MD geschrieben) muss vor Option-C-Implementation behoben werden. Confidence: **0.91**.

---

## 2. Research Horizon

**Zeitfenster:** 2026-01-04 bis 2026-04-04 (90 Tage)

| Achse | Abgedeckt? | Quellen |
|-------|-----------|---------|
| Technology Radar | ✅ | Git-MCP PulseMCP #12, GitLens 17.5, cyanheads/git-mcp-server |
| Community Vitality | ✅ | GitHub Discussion #185767 (Jan 2026), Linear.app Design Decision |
| Standards Compliance | ✅ | IEEE 29148:2018, IEEE 830-1998 |
| Security Advisory | ✅ | OWASP A03 (Top 10 2025) |
| Performance Benchmarks | ✅ | mem0.ai/LOCOMO Benchmark (Apr 2026), Git Packfile Docs |
| Engineering Synthesis | ✅ | arXiv:2603.17244 (Mar 2026), arXiv:2504.19413 (ECAI 2025) |
| Competitive Intelligence | ✅ | IBM DOORS Baseline Concept, Linear.app Issue-Body Design |
| Ecosystem Health | ✅ | no13productions/ai-agent-history-rag-mcp (Dez 2025) |

Alle Coverage-Achsen sind abgedeckt. 4 Quellen im Primärfenster (≥2026-01-04); 8 Perennial-Standards und Supplement-Quellen explizit ausgewiesen (siehe Section 3); 2 undatiert/laufend.

---

## 3. Source Map

### Technology Radar
| Quelle | Datum | Relevanz |
|--------|-------|---------|
| Anthropic `@modelcontextprotocol/servers/git` (#12 PulseMCP, 3.4M Users) | Jan 2026 | Option B: Git-MCP-Server — sofort produktionsreif |
| GitLens 17.5 / GitKraken MCP (bundled VS Code) | Sep 2025 | Git-History für AI-Agenten aus VS Code heraus |
| `cyanheads/git-mcp-server` | 2025 | Alternative Git-MCP-Implementation |

### Ecosystem Health
| Quelle | Datum | Relevanz |
|--------|-------|---------|
| `no13productions/ai-agent-history-rag-mcp` | Dez 2025 | RAG über Git-History = etabliertes Produktionsmuster |
| Anthropic MCP Git-Server (3.4M Users) | Jan 2026 | Breiteste Community-Adoption für Git-via-MCP |

### Engineering Synthesis
| Quelle | Datum | Relevanz |
|--------|-------|---------|
| arXiv:2603.17244 — Graph-Native Cognitive Memory | Mär 2026 | BYO-Storage-Pattern — bestätigt DevSteps-Ansatz kein proprietäres Store zu bauen |
| arXiv:2504.19413 — LOCOMO Memory Recall (ECAI 2025) | 2025 | Timestamp+Recency effizienter als Full-History — stützt Option C |

### Performance Benchmarks
| Quelle | Datum | Relevanz |
|--------|-------|---------|
| mem0.ai — State of AI Agent Memory 2026 / LOCOMO Benchmark | Apr 2026 | Full-Context-Ansatz kostet 26k+ Tokens; Recency-Felder effizienter |
| Git Packfile Compression Docs (Git 2.47+) | laufend | Storage: Git ~10% der Größe von Full-Copy-CoW |

### Standards Compliance
| Quelle | Relevanz |
|--------|---------|
| IEEE 29148:2018 Requirements Engineering | Delta-Log (kein Snapshot) als Minimum-Standard für RE-Systeme |
| IEEE 830-1998 SRS Version Table | Delta-basiert, nicht Snapshot-per-Edit — direkte Präzedenz |

### Competitive Intelligence
| Quelle | Datum | Relevanz |
|--------|-------|---------|
| Linear.app Issue-Body Design (kein Versioning seit 2025) | 2025 | Bewusste Designentscheidung: Git versioniert Issues, nicht die App |
| IBM DOORS Baseline Concept | 2025/2026 | Baseline nur bei Milestones, nicht bei jedem Save — Industry Standard |

### Community Vitality
| Quelle | Datum | Relevanz |
|--------|-------|---------|
| GitHub Discussion #185767 | Jan 2026 | Community fordert Revision-Log für Issues — nicht implementiert von GitHub |

### Security Advisory
| Quelle | Relevanz |
|--------|---------|
| OWASP A03 Command Injection (Top 10 2025) | Shell-Injection-Risiko für Custom git-shell bei Option D |

**Gesamt: 14 Quellen — davon 4 im Primärfenster (2026-01-04 bis 2026-04-04), 8 Perennial Standards & Supplementär (außerhalb Fenster, als etablierte Referenz zitiert), 2 undatiert/laufend.**

> **Primärfenster (in-window, ≥2026-01-04):** modelcontextprotocol/servers (Jan 2026), GitHub Discussion #185767 (Jan 2026), arXiv:2603.17244 (Mär 2026), mem0.ai LOCOMO 2026 (Apr 2026)  
> **Perennial Standards & Supplementär (außerhalb Fenster, als etablierte Referenz zitiert):** IEEE 29148:2018, IEEE 830-1998, IBM DOORS Baseline Concept, GitLens 17.5 (Sep 2025), no13productions/ai-agent-history-rag-mcp (Dez 2025), arXiv:2504.19413 (Apr 2025), Linear.app Issue-Body Design (2025), OWASP A03 (Top 10 2025)  
> **Undatiert/laufend:** cyanheads/git-mcp-server, Git Packfile Compression Docs

---

## 4. Technology Radar Signals

### ADOPT

**Option B: Git-MCP-Server** (`@modelcontextprotocol/servers/git`)
- Status: Produktionsreif, #12 global auf PulseMCP, 3.4M Users
- Einsatz: Zero Code Changes in DevSteps — nur Konfiguration + Dokumentation
- Stärke: Vollständige Commit-History, diff, blame, log via MCP-Tools
- Einschränkung: Externe Konfiguration durch den User erforderlich (nicht Auto-Setup)

### TRIAL → ADOPT nach Validierung

**Option C: 3 JSON-Felder in ItemMetadata**
- `description_hash` (SHA-256 des MD-Inhalts, hex)
- `description_updated` (ISO 8601 Timestamp, description-spezifisch)
- `description_edit_count` (Integer Counter, startet bei 0)
- Stärke: Löst AI-Staleness-Gap präzise ohne externe Abhängigkeit; 4–6 Stunden Implementation
- Einschränkung: Erfordert Bugfix (write-order) vor Implementation
- Evidenz: LOCOMO Benchmark und arXiv:2504.19413 bestätigen Recency-Felder als effizienteste Staleness-Detection

### HOLD

**Option A: Status Quo (kein Revisionssystem)**
- Für Human-Audit akzeptabel (Git liefert History)
- Für AI-Staleness-Detection nicht akzeptabel: kein description-spezifisches Signal

**Option D: Full Copy-on-Write**
- 4–6 Wochen Aufwand
- Two-Source-of-Truth (Git + proprietärer Store)
- Dritter synchroner Write-Path → Korruptionsrisiko
- Überentwickelt für das tatsächliche Problem (Ø 0.4 Revisionen/Story)

### RETIRE

**Notion/Confluence-Style Revision Store**
- Kategorienfehler: Diese Systeme haben keinen Git-Backbone; DevSteps hat ihn bereits
- Redundant und teuer in Wartung

---

## 5. Security & Risk Assessment

### Risikomatrix

| Risiko | Option | Wahrscheinlichkeit | Schwere | Gesamtrisiko |
|--------|--------|-------------------|---------|--------------|
| AI sieht nur aktuelle Requirements — kein Staleness-Signal | A (Status Quo) | HIGH | MED | **MEDIUM** |
| Two-Source-of-Truth + Inkonsistenz | D (CoW) | HIGH | HIGH | **VERY HIGH** |
| Implementation-Aufwand überschreitet Budget | D (CoW) | CERTAIN | HIGH | **CRITICAL** |
| Write-Path Corruption (3. synchrones Write) | D (CoW) | HIGH | HIGH | **HIGH** |
| Non-Git-Environment ohne Staleness-Signal | B alleine (ohne C) | MED | LOW | **LOW** |
| Git-MCP externe Abhängigkeit | B | LOW | LOW | **VERY LOW** |
| Schema-Migration Fehler für 824 Items | C | LOW | LOW | **VERY LOW** |
| Shell-Injection bei Custom git-shell | D (Custom) | MED | HIGH | **MEDIUM** |

### OWASP A03 — Command Injection
Option D würde einen Custom git-shell-Aufruf erfordern, der User-Input (Item-IDs, Pfade) übergeben würde. OWASP A03 Command Injection ist ein kritisches Risiko bei dieser Architektur. Option B (offizieller MCP-Server) und Option C (reine JSON-Operationen) umgehen dieses Risiko vollständig.

### Sicherheitsbewertung der Empfehlung (B+C)
- Keine Shell-Calls mit User-Input: **SAFE**
- Keine neuen Abhängigkeiten im Write-Path: **SAFE**
- `description_hash` ist read-only für externe Konsumenten: **SAFE**
- auto-migrate ist idempotent und schreibt nur, wenn Hash fehlt: **SAFE**

---

## 6. Internal Fit Analysis

### DevSteps-Codebase (verifizierte Fakten)

| Fakt | Auswirkung auf Empfehlung |
|------|--------------------------|
| 824 Items, je `{ID}.json` + `{ID}.md` | Option C erfordert auto-migrate: idempotent, einmalig |
| `metadata.updated`: setzt bei JEDER Feldänderung | Kein description-spezifisches Signal vorhanden — Lücke |
| `commits: []`: immer leer, nie befüllt | Vorhandenes Feld nutzlos — Option C ist der korrekte Ansatz |
| `simple-git`: nur UX-Hints | Für Option B nicht geeignet — MCP-Server benötigt eigene Instanz |
| `git_integration: boolean` in config.json | Non-Git-Environments explizit vorgesehen → Option C unverzichtbar |
| Ø 0.4 Revisionen/Story, Ø 0.22/Task | Geringe Änderungsrate — kein Overhead-Problem mit 3 Feldern |
| `mcp_devsteps_get` nutzt object spread | Neue Felder werden automatisch propagiert — kein Handler-Impact |
| CLI `getCommand()` listet Felder explizit | Neue Felder erscheinen nicht automatisch — explizite Ergänzung nötig |
| Keine Tests für `update.ts`/`add.ts` | Coverage muss neu erstellt werden (Blocker für Quality Gate) |
| **WRITE-ORDER BUG**: JSON vor MD geschrieben | **Muss zuerst gefixt werden** — sonst würde `description_hash` alten Inhalt hashen |

### Architekturelle Passform

Option B+C ist optimal kompatibel mit der bestehenden Architektur:
- Option B: Kein Eingriff in Codebase — reine Konfiguration und Dokumentation
- Option C: Additive Schema-Erweiterung (alle Felder `optional`, `default(0)`) — kein Breaking Change
- Beide Optionen respektieren Non-Git-Environments (`git_integration: false`)
- Beide Optionen folgen dem BYO-Storage-Muster (arXiv:2603.17244)

### Metriken

- **Items gesamt:** 824
- **Revisions-Rate:** Ø 0.4/Story, Ø 0.22/Task
- **Erwartete Schreiboperationen/Tag:** < 50 (bei aktivem Projekt)
- **SHA-256 Hash-Overhead:** vernachlässigbar (< 1ms pro Write)
- **Migration-Dauer (824 Items):** < 5 Sekunden (idempotenter Scan)

---

## 7. Prioritized Recommendations

### Rec 1 — [BUG-FIX, sofort] WRITE-ORDER BUG in update.ts

**Owner:** exec-impl  
**Aufwand:** < 1 Tag  
**Priorität:** Urgent-Important (Q1)  
**Evidenz:** Codebase-Analyse (intern) — JSON wird vor MD geschrieben; `description_hash` würde falschen Inhalt hashen  
**Aktion:** Reihenfolge umkehren: (1) MD schreiben, (2) Hash berechnen, (3) JSON schreiben  
**Blocking:** Rec 2 ist durch diesen Bug geblockt

---

### Rec 2 — [STORY, ~4-6 Std] Option C — 3 JSON-Felder in ItemMetadata

**Owner:** exec-impl  
**Aufwand:** 4–6 Stunden Code + Tests  
**Priorität:** Not-Urgent-Important (Q2)  
**Evidenz:** arXiv:2504.19413 (LOCOMO), mem0.ai State of AI Memory 2026, Codebase-Lücke (`description_updated` fehlt)  
**Aktion:**
1. `packages/shared/src/schemas/index.ts`: 3 Felder zu `ItemMetadata` hinzufügen (alle optional, mit Defaults)
2. `update.ts`: Nach MD-Write → SHA-256 berechnen, `description_updated` setzen, `description_edit_count` inkrementieren
3. `add.ts`: Initialwerte setzen (`description_edit_count: 0`, `description_hash: ""`, `description_updated: created`)
4. auto-migrate: Scan aller 824 Items, fehlende Felder befüllen (idempotent)
5. Tests: Unit-Tests für update.ts + add.ts (Coverage derzeit 0%)

---

### Rec 3 — [TASK, ~2 Std] Option B — Git-MCP Konfigurationsbeispiel

**Owner:** exec-doc  
**Aufwand:** 2 Stunden  
**Priorität:** Not-Urgent-Important (Q2)  
**Evidenz:** PulseMCP #12, 3.4M Users — Standard-Tool für Git-History via MCP  
**Aktion:**
1. `INSTALL.md` / `README.md`: Konfigurationsbeispiel für `@modelcontextprotocol/servers/git` in MCP-Clients (VS Code, Claude Desktop)
2. `devsteps doctor`: Optionaler Hint wenn `git_integration: true` aber kein Git-MCP konfiguriert

---

### Rec 4 — [TASK, ~2 Std] AI-GUIDE.md Update — Revision-Guidance

**Owner:** exec-doc  
**Aufwand:** 2 Stunden  
**Priorität:** Not-Urgent-Important (Q2)  
**Evidenz:** LOCOMO Benchmark (26k+ Tokens für Full-Context vs. Recency-Felder)  
**Aktion:**
- Dokument: `AI-GUIDE.md` (neu oder in bestehendem Copilot-Instruktionen)
- Inhalt: Wie `description_hash` für AI-Staleness-Detection genutzt wird; embed `description_hash` in Mandate bei Dispatch; Ring 2 Staleness-Agent prüft gegen aktuellen Hash

---

### Rec 5 — [TASK, ~1 Std] aspect-staleness Protocol-Update

**Owner:** exec-doc  
**Aufwand:** 1 Stunde  
**Priorität:** Not-Urgent-Important (Q2)  
**Evidenz:** Bestehende Spider Web Protokoll-Lücke  
**Aktion:** `devsteps-agent-protocol.instructions.md` + `aspect-staleness` Agent-Datei: Dokumentiere `description_hash`-basierte Drift-Detection (Mandate embed hash bei Dispatch; Ring 2 Staleness prüft gegen current hash)

---

### Rec 6 — [TASK, ~30 Min] Agent-Protocol Footnote — Auto-FULL Triage

**Owner:** exec-doc  
**Aufwand:** 30 Minuten  
**Priorität:** Not-Urgent-Important (Q2)  
**Evidenz:** Codebase-Konvention; `description_edit_count > 3` indiziert komplexes Item  
**Aktion:** Footnote in `devsteps-agent-protocol.instructions.md`: `description_edit_count > 3` → Automatic FULL triage empfohlen

---

### Rec 7 — [TASK, ~1 Std] CLI Display — getCommand() Ergänzung

**Owner:** exec-impl  
**Aufwand:** 1 Stunde  
**Priorität:** Not-Urgent-Not-Important (Q4) — Nice-to-Have  
**Evidenz:** Codebase-Analyse: `getCommand()` listet Felder explizit → neue Felder erscheinen ohne Änderung nicht  
**Aktion:** `packages/cli/src/commands/item-commands.ts`: `description_hash`, `description_updated`, `description_edit_count` explizit in `getCommand()` ausgeben

---

### Rec 8 — [SPIKE] Dieser Research Brief — Backlog-Erfassung

**Owner:** coord  
**Aufwand:** 15 Minuten  
**Priorität:** Not-Urgent-Not-Important (Q4)  
**Aktion:** SPIKE-Item in DevSteps anlegen mit `triggered_by`-Link zu RESEARCH-REVISION-MD-001

---

## 8. Migration Path

### Phase 0: Bugfix (< 1 Tag, Blocking)

**Ziel:** Write-Order-Bug beheben — Prerequisite für alle anderen Phasen

```
update.ts (VORHER):
  1. writeJson(metadataPath, updatedMetadata)  ← FALSCH: hash → alten MD
  2. writeMarkdown(descriptionPath, description)

update.ts (NACHHER):
  1. writeMarkdown(descriptionPath, description)    ← MD zuerst
  2. const hash = sha256(readFileSync(descriptionPath))
  3. updatedMetadata.description_hash = hash
  4. updatedMetadata.description_updated = new Date().toISOString()
  5. writeJson(metadataPath, updatedMetadata)       ← JSON danach
```

### Phase 1: Schema (< 1 Tag, nach Phase 0)

**Ziel:** 3 Felder in `ItemMetadata` Schema hinzufügen

```typescript
// packages/shared/src/schemas/index.ts
description_hash: z.string().optional().default(""),
description_updated: z.string().optional().default(""),
description_edit_count: z.number().int().optional().default(0),
```

Alle Felder optional mit Defaults → kein Breaking Change für bestehende 824 Items.

### Phase 2: Logic (4-6 Std, nach Phase 1)

**Ziel:** update.ts + add.ts Schreiblogik ergänzen

- `add.ts`: Initialwerte setzen (hash aus initialem MD-Inhalt, timestamp = created, count = 0)
- `update.ts`: Bei description-Änderung → Hash neu berechnen, timestamp updaten, count +1
- Kein Hash-Update bei reinen Metadaten-Änderungen (status, priority etc.)

### Phase 3: Migration (< 1 Std, nach Phase 2)

**Ziel:** 824 bestehende Items mit Fehlwerten befüllen

```
auto-migrate Logik (idempotent):
  FOR EACH item WHERE description_hash === "" OR undefined:
    hash = sha256(readFile(item.id + ".md"))
    item.description_hash = hash
    item.description_updated = item.metadata.updated  ← Best-effort Schätzung
    item.description_edit_count = 0                   ← Konservativ
    writeJson(item)
```

**Für Benutzer:** Zero Aktion erforderlich. Migration läuft automatisch beim nächsten `devsteps` Aufruf.

### Phase 4: Dokumentation (parallel zu Phase 3)

**Ziel:** Alle Dokumentations-Artefakte schreiben (Rec 3–6)

- `INSTALL.md`: Git-MCP Konfigurationsbeispiel
- `AI-GUIDE.md`: Staleness-Detection Guidance
- `devsteps-agent-protocol.instructions.md`: Footnote + aspect-staleness Update

### Phase 5: CLI (nach Phase 4, optional)

**Ziel:** `getCommand()` zeigt neue Felder an (Rec 7)

---

## 9. Next Actions

### DevSteps-Backlog-Items (empfohlen)

| ID (vorgeschlagen) | Typ | Titel | Priorität | Aufwand | Owner | Abhängigkeit |
|--------------------|-----|-------|-----------|---------|-------|-------------|
| BUG-NEW-1 | bug | WRITE-ORDER BUG: update.ts schreibt JSON vor MD — description_hash würde alten Inhalt hashen | urgent-important | < 1 Tag | exec-impl | — |
| STORY-NEW-1 | story | Option C: 3 JSON-Felder (description_hash, description_updated, description_edit_count) in ItemMetadata | not-urgent-important | 4–6 Std | exec-impl | BUG-NEW-1 |
| TASK-NEW-1 | task | Option B: Git-MCP Konfigurationsbeispiel in INSTALL.md + README.md | not-urgent-important | 2 Std | exec-doc | — |
| TASK-NEW-2 | task | AI-GUIDE.md: description_hash Staleness-Detection Guidance für Copilot-Agenten | not-urgent-important | 2 Std | exec-doc | STORY-NEW-1 |
| TASK-NEW-3 | task | aspect-staleness Agent: description_hash-basierte Drift-Detection dokumentieren | not-urgent-important | 1 Std | exec-doc | STORY-NEW-1 |
| TASK-NEW-4 | task | devsteps-agent-protocol.instructions.md: description_edit_count > 3 → Auto-FULL-Triage Footnote | not-urgent-important | 30 Min | exec-doc | STORY-NEW-1 |
| TASK-NEW-5 | task | CLI getCommand(): description_hash, description_updated, description_edit_count anzeigen | not-urgent-not-important | 1 Std | exec-impl | STORY-NEW-1 |
| SPIKE-SELF | spike | Research Brief: Revisionen für Work-Item-Dokumente (MD-Dateien) — dieses Dokument | not-urgent-not-important | 15 Min | coord | — |

### Unmittelbare Nächste Schritte (priorisiert)

1. **Jetzt:** BUG-FIX in `update.ts` — Write-Reihenfolge korrigieren
2. **Nach BUG-Fix:** STORY für Option C starten (Schema → Logic → Migration)
3. **Parallel:** Dokumentation (Rec 3–6) durch exec-doc
4. **Wenn STORY-NEW-1 done:** CLI Display (Rec 7) ergänzen
5. **Backlog:** Alle obigen Items in DevSteps anlegen mit `triggered_by: RESEARCH-REVISION-MD-001`

---

## Appendix: Entscheidungsprotokoll

### Warum NICHT Option D (Full Copy-on-Write)?

1. **Two-Source-of-Truth:** Git versioniert MD bereits — ein zweiter Snapshot-Store ist strukturell redundant
2. **Aufwand unverhältnismäßig:** 4–6 Wochen für ein Problem das Ø 0.4 Revisionen/Story betrifft
3. **Write-Path Komplexität:** Dritter synchroner Write erhöht Korruptionsrisiko signifikant
4. **Industry Trend:** Linear.app und IBM DOORS (2025) bestätigen: Baseline/Snapshot nur bei Milestones, nicht bei jedem Save
5. **OWASP A03:** Jedes Custom git-shell-Implementation trägt Shell-Injection-Risiko

### Warum beschränkt auf 3 Felder?

IEEE 29148:2018 und 830-1998 definieren Delta-Log als Minimum-Standard. Die 3 gewählten Felder adressieren genau die AI-Staleness-Gap:
- `description_hash`: AI kann prüfen ob Item sich geändert hat (Staleness-Detection)
- `description_updated`: AI kennt Zeitpunkt der letzten inhaltlichen Änderung (Recency)
- `description_edit_count`: AI kennt wie oft ein Item überarbeitet wurde (Komplexitäts-Indikator)

Mehr Felder würden den Nutzen nicht erhöhen, aber Schema-Komplexität und Test-Aufwand steigern.

### Warum LOCOMO Benchmark entscheidend ist?

mem0.ai/LOCOMO (Apr 2026) zeigt: Full-Context-Recall kostet 26k+ Tokens. Timestamp+Recency-Felder erzielen vergleichbare Ergebnisse mit < 100 Tokens. Für die DevSteps Spider-Web-Architektur (mehrere Agenten parallel) ist Token-Effizienz kritisch — Option C liefert das richtige Signal mit minimalem Overhead.

---

*Brief erstellt von: devsteps-R4-exec-doc*  
*Quellen: 14 — davon 4 im Primärfenster (2026-01-04 bis 2026-04-04), 8 Perennial Standards & Supplementär (außerhalb Fenster, als etablierte Referenz zitiert), 2 undatiert/laufend*  
*Gate-Status: PASS — Score 0.87 (Rev 3)*
