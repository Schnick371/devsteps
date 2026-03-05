# Research Brief: GitHub Copilot #runSubagent Inter-Agent Communication

> SPIKE-021 | 2026-03-05 | Confidence: 0.89 (Ø 10 MandateResults) | Tier: COMPETITIVE+

---

## 1. Executive Summary

Das SPIKE-021-Competitive-Research liefert ein klares Verdikt: Der einzige designte IPC-Kanal zwischen GitHub Copilot Subagenten ist die **filesystem-mediated JSON-Kommunikation via DevSteps MandateResult** (`.devsteps/cbp/<sprint>/*.result.json`), validiert durch MCP `write_mandate_result` mit atomarem `.tmp→rename`-Write und beidseitiger Zod-`safeParse`-Enforcement. Direkte Subagent-zu-Subagent-Kommunikation, typisierte `runSubagent`-Rückgaben und Streaming-Output sind durch die **Context-Isolated Subagent (CIS)-Architektur** von VS Code strukturell nicht möglich — diese Grenzlinien sind extern und unveränderbar. Zwei kritische Dokument-Inkonsistenzen gefährden das System unmittelbar: (1) `TIER2-PROTOCOL.md` beschreibt illegalen T2→T3-Nested-Dispatch, der Spider-Web-Invariante I-3 direkt widerspricht, und (2) die Phantom-Felder `report_path`, `upstream_paths` und `verdict` sind in vier Dokumenten als formale Austauschfelder referenziert, existieren aber nicht im MandateResult-JSON-Schema. Der Gesamtqualitätsscore beträgt **5.4/10**: das Kernprotokoll (Schema-Validierung, atomare Writes) ist stark, während Beobachtbarkeit, Testbarkeit und Fehlerbehandlung kritisch unterversorgt sind. Die priorisierten Sofort-Maßnahmen sind rein dokumentarischer Natur (≤2h) und blockieren keine laufende Implementierungsarbeit.

---

## 2. Research Horizon

**Datum-Fenster:** 4. Dezember 2025 – 5. März 2026 (91 Tage)

| Achse | Abdeckung |
|-------|-----------|
| Web-Research (Live) | 17+ Quellen verifiziert (analyst-research, conf. 0.88) |
| Codebase-Archaeology | 36 Agent-Dateien + 17 Prompt-Dateien + 4 Protokoll-Docs analysiert |
| Risk Assessment | 5 Sicherheits- + 6 Zuverlässigkeits- + 4 Architekturrisiken bewertet |
| Quality Standards | 7 Qualitätsdimensionen, GAP-Analyse gegen Soll |
| Cross-Validation | 5 Ring-2-Aspekte (impact, constraints, staleness, quality, integration) |

**Analysten:** 4 Ring-1 (archaeology 0.93 · quality 0.91 · research 0.88 · risk 0.88) + 5 Ring-2 Aspekte + 1 exec-planner

---

## 3. Forschungsfragen & Antworten

### F1: Wird das Kommunikationsformat in Copilot-Files spezifiziert?

**Ja — und nein, je nach Ebene.**

Das Format ist in vier kanonischen Dokumenten des Projekts spezifiziert (Vollständigkeit ~70%):
- `AGENT-DISPATCH-PROTOCOL.md` §5: Communication Contracts Summary-Tabelle
- `REGISTRY.md`: Agent-Dispatch-Routing, Chat-Return-Format
- `TIER2-PROTOCOL.md`: (veraltet/widersprüchlich — CRITICAL, siehe F3)
- `copilot-instructions.md`: Mandate-Typ-Routing und DevSteps-Tool-Routing

**Keine offiziell von Microsoft/GitHub publizierten Spezifikation** für `runSubagent`-Interna existiert. Die VS Code-Dokumentation beschreibt das Feature auf Nutzerebene (Custom Agents, Subagent-Aktivierung), enthält aber kein formales Protokoll-Spec-Dokument für `runSubagent`-Internals (analyst-research, bestätigt).

### F2: Ideales Format — oder situativ bestes Format?

**Eindeutig: File-based JSON via MCP-Bus ist das ideale Format** (kein situatives Abwägen nötig).

Begründung aus Cross-Validation (5 Quellen konvergent):

| Format | Bewertung | Begründung |
|--------|-----------|-----------|
| **File-based JSON** (`.devsteps/cbp/`) | ✅ **Best Practice** | Maschinenlesbar, Audit-Trail, Idempotenz, Zod-Validierung, atomare Writes |
| Natural Language Final Result | ⚠️ Fallback | Nur wenn MCP nicht verfügbar; fehleranfällig, kein Schema |
| MCP JSON-RPC | ✅ Standard | Offiziell für Tool-Kommunikation (VS Code 1.107+) |
| Direkte Rückgabe via runSubagent | ❌ ABGELEHNT | <2% Latenzgewinn vs. Verlust von Validierung + Audit-Trail; Theoretische Einsparung ~200–400ms, echter Bottleneck ist LLM-Generation (5–30s) |
| workspaceStorage `content.txt` | ❌ NICHT GEEIGNET | VS Code-internes Artefakt, nie von Agenten zu lesen |

Research-Befund (LawrenceHwang Feb 2026 Gist): "File-Based Handoff" ist explizit als Community-Best-Practice für Multi-Agent-Koordination in VS Code dokumentiert.

### F3: Ist die Kommunikationsform in der Copilot-Dokumentation angegeben?

**Teilweise — mit einer kritischen Lücke.**

Die VS Code-Dokumentation bestätigt:
- CIS-Architektur: nur der **finale LLM-Text** wird in den Parent-Context injiziert
- `subagentType`-Parameter wählt Custom-Agent (Modell + Tools)
- Seit VS Code 1.109 (Feb 2026): **Parallele Ausführung** möglich
- **Kein offizielles Protokoll-Spec-Dokument für runSubagent-Internals** — nicht vorhanden

Die **projektinterne** Spezifikation enthält den kritischen Widerspruch: `TIER2-PROTOCOL.md` (183 Zeilen) beschreibt einen T1→T2→T3-Drei-Ebenen-Dispatch, bei dem T2-Agenten T3-Subagenten via `runSubagent` dispatchen. Dies widerspricht `AGENT-DISPATCH-PROTOCOL.md` v4.0 (2026-03-02) Invariante I-3 direkt: *"Non-coord agents NEVER call `runSubagent`"*. Fünf von neun Analysten bewerteten dies als **KRITISCH**. Ein neuer Agent, der `TIER2-PROTOCOL.md` liest, würde illegales Nested-Dispatch implementieren.

### F4: Wie verbessern? Müssen wir überhaupt?

**Ja — gezielt und in zwei Wellen.**

Das System ist in den Kernpfaden (Write/Read Validierung) bereits gut implementiert. Verbesserungsbedarf besteht in drei Kategorien:

**Kategorie 1: MÜSSEN (Sicherheitsrisiko, Architekturfehler)**
- TIER2-PROTOCOL.md deprecieren (verhindert Fehlimplementierungen durch neue Agenten)
- Phantom-Felder aus 4 Dokumenten entfernen (irreführende Architektur-Dokumentation)
- Quorum-Check in coord (Silent Failures sind aktuell vollständig undetektierbar)

**Kategorie 2: SOLLTEN (Protokoll-Robustheit)**
- Zod-Schema-Erweiterungen (`t3_recommendations`, `failed_approaches[]`) — hebt Coord-Ring-2-Selektion von informeller Konvention auf Schema-Garantie
- Contract-Tests — aktuell 0% Coverage für den kritischsten Pfad im System

**Kategorie 3: KÖNNEN (Optionale Verbesserungen)**
- Extension CBP-Layer (Visualisierung)
- CLI `devsteps cbp status`
- VS Code-Mindestversion dokumentieren

**Nicht verbessern (extern blockiert):** Typed runSubagent Returns, Streaming, direkte A→B-Kommunikation — CIS-Architekturgrenze der VS Code-API.

### F5: Können Sub-Agent-Outputs direkt an weitere Sub-Agents weitergegeben werden?

**Nein. Strukturell unmöglich. Kein Workaround via VS Code-API.**

Der `runSubagent`-Mechanismus materialisiert immer den **vollständigen Output in `content.txt`** (VS Code-intern), bevor der Parent-Context Zugriff erhält. Das Protokoll:

```
coord → runSubagent(Analyst-A)
         ↓  [CIS: isolierter Context-Window]
         Analyst-A generiert Output
         ↓  [VS Code Framework: content.txt schreiben]
         Finaler LLM-Text → Parent-Context injiziert
         ↑  [HIER: Analyst-A done]
coord empfängt Text-Ergebnis → kann es als Prompt für runSubagent(Analyst-B) nutzen
```

Optionen und ihre Bewertung:

| Ansatz | Machbarkeit | Empfehlung |
|--------|-------------|-----------|
| Direkte A→B-Kommunikation | ❌ 1/5 | Nicht möglich (CIS-Grenze) |
| Parent als Vermittler (coord empfängt A, dispatcht B mit A's Ergebnis) | ✅ 5/5 | Standard-Pattern |
| File-Bus (.devsteps/cbp/): Analyst-A schreibt, coord liest, coord dispatcht Analyst-B mit Report-Path | ✅ 5/5 | DevSteps Best Practice |
| MCP Push-Notifications (SDK v1.22.0 SSE) | ⚠️ 3/5 | Technisch möglich, aber Bottleneck ist runSubagent, nicht MCP-Transport |
| Streaming innerhalb runSubagent | ❌ 1/5 | Nicht in VS Code 1.110 (Q3 2026 möglicherweise) |

VS Code 1.109+ Parallele Ausführung ändert daran nichts — Koordination bleibt zwingend im Parent (coord).

### F6: Weitere wichtige Fragen (die der User noch nicht gestellt hat)

Fünf Befund-Kategorien aus Cross-Validation, die über die ursprünglichen Fragen hinausgehen:

**F6.1: Wie funktioniert der R2-Aspect-Output-Kanal wirklich?**
Alle 5 R2-Agent-Dateien spezifizieren `write_analysis_report` als Output (Caller liest via `read_analysis_envelope`). Live-Daten aus TASK-293 und SPIKE-021 selbst zeigen R2-Agenten, die `write_mandate_result` in `.devsteps/cbp/` nutzen. Das AGENT-DISPATCH-PROTOCOL I-5/I-6 unterhält ein Zwei-Wege-Modell. Die Praxis hat sich auf einen einzigen Weg konsolidiert — aber weder die Agenten-Dateien noch das Protokoll wurden aktualisiert.

**F6.2: Was passiert bei einem Silent Failure (kein MandateResult geschrieben)?**
`read_mandate_results` gibt ein leeres Array zurück — kein Error, kein Log. Coord könnte mit 0 MandateResults weiterlaufen. Kein Quorum-Check, kein Timeout-Mechanismus dokumentiert. Bei 20 parallelen Ring-1-Dispatches: statistische Wahrscheinlichkeit ≥1 Silent Failure ist signifikant.

**F6.3: Was sind "report_path", "upstream_paths" und "verdict"?**
Phantom-Felder — in vier Dokumenten als formale JSON-Austauschfelder referenziert, in keinem einzigen Live-MandateResult vorhanden (archaeology, conf. 0.93). Sie sind informelle Chat-Text-Metaphern, die historisch in die Dokumentation übernommen wurden. Keine Schema-Handlung nötig; **Entfernen aus Dokumenten ist kritisch**.

**F6.4: Welche VS Code-Mindestversion ist für das Spider-Web-System erforderlich?**
- VS Code 1.107+ (Dez 2025): MCP vollständig integriert — **Minimum für DevSteps MCP-Bus**
- VS Code 1.109+ (Feb 2026): Parallele Subagent-Ausführung — **Minimum für Spider-Web-Parallel-Fan-out**
- VS Code 1.110+ (Mrz 2026): Session Memory `/compact` + Session Forking `/fork` — Context-Budget-Tools für lange Sprints
Keine dieser Anforderungen ist in README/INSTALL/Agent-Frontmatter dokumentiert.

**F6.5: Was fehlt im Vergleich zu ausgereiften Multi-Agent-Frameworks?**
VS Code `#runSubagent` hat kein typed state, kein automatic checkpointing und keine retry-logic — im Gegensatz zu LangGraph (TypedDict + Reducer), CrewAI (Pydantic Task-Output-Chain) und AutoGen (Event-Driven Typed Messages). DevSteps kompensiert dies durch MandateResult-Schema + `write_iteration_signal` + `write_escalation` — aber ohne Contract-Tests ist die Kompensation unverified.

---

## 4. Source Map

### Coverage-Axis: VS Code Platform Internals
1. VS Code Subagents Docs: `code.visualstudio.com/docs/copilot/agents/subagents` (2025–aktuell)
2. VS Code 1.107 Release Notes: Visual Studio Magazine, Dez 2025 — MCP vollständig
3. VS Code 1.109 — Parallele Subagent-Ausführung (Feb 2026)
4. VS Code 1.110 Mar 4, 2026: Session Memory `/compact` + `/fork` — `visualstudiomagazine.com/Articles/2026/03/04/VS-Code-1-110-Ships`
5. Imaginet Dec 12, 2025: "Mastering Subagents in VS Code Copilot" — `imaginet.com/2025/mastering-subagents-in-vs-code-copilot`

### Coverage-Axis: Community Patterns & Best Practices
6. LawrenceHwang Gist Feb 17, 2026: File-based JSON Handoff als Community-Best-Practice — `gist.github.com/LawrenceHwang/6194421c3bb4208fff84452b403e191a`
7. VSM Hands-On Feb 9, 2026: "Hands-on with new multi-agent orchestration" — `visualstudiomagazine.com/articles/2026/02/09/hands-on-with-new-multi-agent-orchestration`
8. dev.to Dec 11, 2025: "Deep Dive into the Latest GitHub Copilot Updates" — `dev.to/seiwan-maikuma/deep-dive-into-the-latest-github-copilot-updates-3pba`
9. alexop.dev Jan 24, 2026: "What's new VSCode Copilot January 2026" — `alexop.dev/posts/whats-new-vscode-copilot-january-2026`
10. O'Reilly Feb 25, 2026: "Why Multi-Agent Systems Need Memory Engineering" — `oreilly.com/radar/why-multi-agent-systems-need-memory-engineering`

### Coverage-Axis: Protocol & SDK
11. Copilot SDK Changelog Jan 14, 2026 — `github.blog/changelog/2026-01-14-copilot-sdk`
12. MCP Spezifikation (2025-11-25): `modelcontextprotocol.io/spec`
13. @modelcontextprotocol/sdk v1.22.0 — installiert in `packages/mcp-server`

### Coverage-Axis: Competitive Frameworks
14. LangGraph Dokumentation (Typed State Dict, Reducer Functions, Checkpointing)
15. CrewAI Framework (Pydantic Task Output Chain)
16. AutoGen (Event-Driven Typed Messages)
17. GitHub Blog Research: "400ms+ Latenz-Penalty bei 40+ Tools" + "Orchestrator-Specialist Pattern"

### Coverage-Axis: Interne Codebase (Live-Archäologie)
- 36 Agent-Dateien (Ring 0–5) + 17 Prompt-Dateien
- `packages/shared/src/schemas/cbp-mandate.ts` (MandateResultSchema, MandateSchema)
- `packages/mcp-server/src/handlers/cbp-mandate.ts` (323 Zeilen, atomare Writes)
- Live-MandateResult-Dateien aus TASK-293, TASK-296-sprint, SPIKE-021, GPU-research-sprint
- workspaceStorage-Analyse: 49 Tool-Verzeichnisse aus Session 1c2e94bc (2026-03-05)

---

## 5. Technology Radar Signals

| Kandidat | Signal | Begründung |
|----------|--------|-----------|
| **File-based JSON Handoffs via MCP** (`.devsteps/cbp/`) | ✅ **adopt** | Live-getestet, Zod-validiert, atomare Writes, Audit-Trail, Community-Best-Practice |
| **MCP JSON-RPC als IPC-Bus** | ✅ **adopt** | Offizieller VS Code 1.107+ Standard, Schema-Validierung, Apache 2.0 |
| **Parallele Subagent-Dispatches** (VS Code 1.109+) | ✅ **adopt** | Signifikante Zeitersparnis bei Ring-1-Fan-out; ab Feb 2026 GA |
| **Session Memory `/compact` + `/fork`** (VS Code 1.110+) | 🔵 **trial** | Neu (2026-03-04), Context-Budget-Tool für lange Sprints; in Agent-Frontmatter dokumentieren |
| **MCP Push-Notifications** (SSE, SDK v1.22.0) | 🔵 **trial** | Technisch möglich, Bottleneck ist runSubagent nicht MCP-Transport; erst nach Contract-Tests |
| **Natural Language als Rückgabeformat** | ⚠️ **hold** | Fallback-only; fehleranfällig, kein Schema, kein Audit-Trail |
| **Direkte Sub-Agent-Kommunikation (A→B)** | ❌ **retire** | CIS-Architekturgrenze; kein Workaround möglich |
| **workspaceStorage als IPC-Kanal** | ❌ **retire** | VS Code-internes Artefakt; Pfad-Schema kann sich ändern, sensitive Daten unverschlüsselt, kein TTL |
| **Streaming zwischen Agenten** | ⏳ **assess** (Q3 2026) | Technisch nicht möglich in VS Code 1.110; Copilot SDK Technical Preview deutet auf 1.112–1.115 hin |
| **TIER2-PROTOCOL.md T2→T3-Dispatch** | ❌ **retire** | Direkt konträr zu Spider-Web-Invariante I-3; Architektur-Implementierungsfalle |

---

## 6. Wie Kommunikation WIRKLICH funktioniert

### 6.1 Die `content.txt` workspaceStorage-Dateien

**Was sie sind:** VS Code Copilot's internes Session-History-Persistenz-Format. Jeder `runSubagent`-Aufruf erzeugt ein Verzeichnis:

```
~/.vscode-server/data/User/workspaceStorage/[extension-hash]/
  GitHub.copilot-chat/chat-session-resources/[session-uuid]/
    toolu_vrtx_[tool-id]__vscode-[timestamp]/
      content.txt    ← vollständiger LLM-Text-Output des Subagenten
      content.json   ← oder strukturiertes JSON bei MCP-Tool-Calls
      schema.json    ← JSON-Schema bei MCP-Tool-Calls
```

**Was sie enthalten:** Den vollständigen Markdown-Text-Output des Subagenten (8 KB–102 KB beobachtet). In session `1c2e94bc` (2026-03-05): 49 Tool-Verzeichnisse total, davon 26 mit `content.txt` (Subagent-Text) und 21 mit `content.json` (MCP-Tool-Resultate).

**Warum Koordinatoren sie NICHT lesen:**
- Die Pfadstruktur ist VS Code-intern und kann sich ohne Vorwarnung ändern (Risk C10: MEDIUM)
- Dateinamen `toolu_vrtx_[opaque-id]` haben kein semantisches Labeling nach Agent-Rolle
- Permissions: 644 (alle User-Prozesse + Extensions haben Lesezugriff)
- Kein TTL, kein automatisches Cleanup — ~27 MB/Monat Wachstum bei 50 Sprints
- Das Framework schreibt `content.txt` ohne atomare Writes (kein `.tmp→rename`)
- **Designentscheidung:** Koordinatoren lesen ausschließlich `.devsteps/cbp/` MandateResults via MCP-Tool

### 6.2 Der `.devsteps/cbp/` MandateResult-Kanal

**Der einzige designte IPC-Kanal.** Mechanismus:

```
Analyst-Agent                          MCP-Server                    coord
     │                                     │                           │
     ├─ write_mandate_result({...}) ───────►│                           │
     │                                     ├─ safeParse(args) ─────────►│ VALIDATE
     │                                     ├─ .tmp → rename ───────────►│ ATOMIC
     │                                     │  .devsteps/cbp/SPIKE-021/  │
     │                                     │  [uuid].result.json        │
     │                                     │                           │
     │                                     │◄── read_mandate_results() ─┤
     │                                     │    (sprint_id)             │
     │                                     ├─ safeParse(each file) ─────►│ VALIDATE
     │                                     │  → return[] ──────────────►│
```

**Schema** (schema_version: '1.0', bestätigt in `packages/shared/src/schemas/cbp-mandate.ts`):

```typescript
MandateResultSchema = z.object({
  mandate_id: z.string().uuid(),
  item_ids: z.array(z.string()),
  sprint_id: z.string(),
  analyst: z.string(),
  status: z.enum(['complete', 'partial', 'escalated']),
  findings: z.string().max(6000),      // Markdown, ~800 Token Soft-Cap
  recommendations: z.array(z.string()).max(5),
  confidence: z.number().min(0).max(1),
  token_cost: z.number().int().min(0),
  completed_at: z.string().datetime(),
  schema_version: z.literal('1.0').default('1.0'),
})
```

**Mechanismus-Garantien:**
- Atomarer Write (`.tmp → rename`) — kein Partial-Write möglich
- `safeParse` vor Write (Hard-Rejection) AND nach Read (bidirektionale Validierung)
- Idempotenz: mehrfacher Dispatch desselben Agenten → mehrere Dateien, coord sieht alle

### 6.3 Phantom-Felder: `report_path`, `upstream_paths`, `verdict`

**Was sie sind:** Informelle Chat-Text-Metaphern, die historisch in die Projekt-Dokumentation übernommen wurden. Sie beschreiben konzeptuelle Handoff-Konzepte auf Instruktionsebene.

**Wo sie stehen (STALE, KRITISCH):**
- `copilot-instructions.md`: "pass MandateResult `report_path` as `upstream_paths`"
- `AGENT-DISPATCH-PROTOCOL.md` I-6: "`read_analysis_envelope(report_path)`"
- `TIER2-PROTOCOL.md` Phase 4: "Return ONLY `{report_path, verdict, confidence}` to Tier-1"
- `devsteps-R0-coord.agent.md`: handoffs über "Pass `report_path` from planner MandateResult"

**Warum sie im echten Schema NICHT existieren** (archaeology, conf. 0.93, direkt aus Live-Dateien):
- `read_mandate_results(sprint_id)` gibt ein `MandateResult[]`-Array zurück — kein `report_path`-Feld zum Weiterreichen
- `MandateResultSchema` in `cbp-mandate.ts` hat keines dieser Felder
- Live-MandateResult-Dateien aus 4 Sprints bestätigen: Schema Version 1.0 enthält sie nicht
- Kein Schema-Handlungsbedarf; **Entfernen aus Dokumenten ist unmittelbar notwendig**

---

## 7. Security & Risk Assessment

### A. Sicherheitsrisiken

| ID | Risiko | Schwere | Status |
|----|--------|---------|--------|
| **A1** | `content.txt` 644-Permissions — alle Extensions + User-Prozesse lesbar | MEDIUM | Offen |
| **A4** | Persistenz sensitiver Daten ohne TTL, ohne Verschlüsselung at rest | **HIGH** | Offen |
| **A5** | Path Traversal in workspaceStorage-Pfad | LOW | Mitigiert (session-uuid-Isolation) |

**A4-Detail:** Kein automatisches Cleanup. Inhalt: vollständige Analyseberichte, Code mit potenziellen Secrets, Vulnerability-Descriptions. Kompromittierung des Systems legt vollständige Sprint-Historien offen. Empfehlung: `~/.vscode-server/` auf 700 härten; in `SECURITY.md` dokumentieren.

### B. Zuverlässigkeitsrisiken

| ID | Risiko | Schwere | Status |
|----|--------|---------|--------|
| **B6** | content.txt ohne atomaren Write — Silent Partial-Write bei Extension-Host-Crash | MEDIUM | Nicht behebbar (extern) |
| **B7** | Agent schreibt kein MandateResult (nur Markdown-Output) | MEDIUM | Kein Quorum-Check vorhanden |
| **B8** | schema_version: '1.0' — Breaking Changes durch neue required-Felder | **HIGH** | ~~Kein schema_version-Feld~~ (**KORREKTUR**: `z.literal('1.0')` vorhanden ✅) |
| **B9** | `read_mandate_results` gibt leeres Array (nicht Error) bei fehlendem File | MEDIUM | Silent Failure undetektierbar |

### C. Architekturrisiken

| ID | Risiko | Schwere | Status |
|----|--------|---------|--------|
| **C10** | VS Code-interne `content.txt`-Pfadstruktur kann sich ohne Warnung ändern | MEDIUM | Mitigiert (`.devsteps/cbp/` als einziger IPC) |
| **C11** | Null Contract-Tests für runSubagent-Dispatch-Zyklus | **HIGH** | Offen |
| **C12** | Opake Tool-IDs (`toolu_vrtx_*`), kein semantisches Agent-Labeling | **HIGH** | Offen |
| **C13** | 20 parallele LLM-Calls: Rate-Limiting-Risiko; unbeschränkte T1/T2 | MEDIUM | Offen |

**Risk B8-Korrektur (Impact-Analyse):** Risk-Analyst behauptete, kein `schema_version`-Feld vorhanden. Quality-Analyst widerlegte dies mit direktem Code-Nachweis: `z.literal('1.0').default('1.0')` in `cbp-mandate.ts` existiert und wird bidirektional enforced. Sekundäre Risk-Befunde (A4, C11, C12) bleiben valide.

### Relevante CVEs / Sicherheitshinweise (2025–2026)
- **Prompt Injection via File-Content (Feb 2026):** Bei file-based Kommunikation kann manipulierter Datei-Inhalt als Prompt-Injection wirken — relevant für MandateResult-`findings`-Felder
- **Free-Tier Premium-Delegation Issue (Feb 2026):** Gemeldetes Issue — Free-Tier-Nutzer können via `runSubagent` Premium-Modelle delegieren
- VS Code 1.107+: 2-Stufen-URL-Approval + Fetch-Prompt-Injection-Protection mitigiert externe Angriffsvektoren

---

## 8. Befund: Aktuelle Qualität (5.4/10)

Quelle: devsteps-R2-aspect-quality (conf. 0.89), Cross-Validation aller 9 Upstream-Reports.

| Dimension | Ist | Soll | Gap | Maßnahme |
|-----------|:---:|:----:|:---:|----------|
| Schema-Vollständigkeit | 7 | 10 | 3 | `t3_recommendations` + `failed_approaches[]` in Zod |
| Format-Konsistenz | 8 | 10 | 2 | MandateType-Enum fix + TIER2-PROTOCOL.md deprecaten |
| **Error Handling** | 4 | 10 | **6** | Quorum-Check + Timeout-Policy für missing MandateResults |
| **Testbarkeit** | 3 | 10 | **7** | Contract-Tests Dispatch-Zyklus — aktuell 0% Coverage |
| **Observability** | 4 | 10 | **6** | Dispatch-Manifest + semantisches Agent-Labeling |
| Dokumentation | 6 | 10 | 4 | TIER2-PROTOCOL.md archivieren, Phantom-Felder entfernen |
| Sicherheit | 6 | 10 | 4 | TTL-Cleanup `content.txt`, `~/.vscode-server/` 700-Permissions |
| **Gesamt** | **5.4** | **10** | **4.6** | — |

**Kernaussage:** Das Kernprotokoll (Schema Write/Read-Validierung, atomare Writes) ist stark (7–8/10). Die drei kritisch unterversorgten Dimensionen — **Testbarkeit (3/10), Error Handling (4/10), Observability (4/10)** — sind die eigentlichen Risikostellen.

---

## 9. Internal Fit Analysis

DevSteps ist in einer spezifischen Position: Das Projekt implementiert nicht nur ein Multi-Agent-System — es **entwickelt die Infrastruktur** (MCP-Server, CLI, Extension), auf der das Multi-Agent-System läuft. Diese Doppelrolle hat folgende Implikationen:

**Stärken (DevSteps-spezifisch):**
- `packages/shared/src/schemas/cbp-mandate.ts` — zentrales Schema, alle Packages können importieren
- `packages/mcp-server/src/handlers/cbp-mandate.ts` — dedizierter Handler mit bidirektionaler Zod-Validierung
- `write_iteration_signal` + `write_escalation` — Loop-Bound-Mechanismen vorhanden
- `mcpServerManager.ts` in Extension — theoretischer Integrationspunkt für CBP-Visualisierung

**Lücken (DevSteps-spezifisch):**
- Extension (5 DataProvider, `stateManager.ts`, `devstepsTreeDataProvider.ts`) ist vollständig blind gegenüber laufenden Spider-Web-Dispatches — kein CBP-Panel, kein Agent-Status
- CLI hat zero `mandate`/`cbp`-Referenzen — MandateResults nur über direkten Dateizugriff inspizierbar
- `packages/cli` und `packages/extension` importieren `@schnick371/devsteps-shared` noch nicht für MandateResult-Typen

**Datenfluss aktuell:**
```
shared (MandateResultSchema) → mcp-server ✅
shared (MandateResultSchema) → cli ❌ (nicht importiert)
shared (MandateResultSchema) → extension ❌ (nicht importiert)
```

**Migrationskomplexität gesamt:** ~70 Dateien (36 Agent + 17 Prompt + 11 Instruction + 4 Protokoll-Docs + 2 Zod/Handler). Keine Contract-Test-Safety-Net — Silent Failures bei Refactoring wahrscheinlich. Neue Felder **müssen `.optional()` oder `.default()` sein** (backward-compatibility: Live-MandateResults aus 4+ Sprints vorhanden).

---

## 10. Priorisierte Recommendations

Aggregiert aus 10 MandateResults | Priorisiert nach Consensus-Stärke (5/9 > 4/9 > 3/9) und Risikoschwere.

### SOFORT (Heute, ≤2h — nur Dokumentation, kein Code)

**1. TIER2-PROTOCOL.md deprecieren**
- Owner: exec-doc
- Aufwand: 15 Minuten
- Evidence: 5/9 Analysten KRITISCH; beschreibt T2→T3-Nested-Dispatch konträr zu Invariante I-3
- Aktion: Deprecation-Header hinzufügen:
  ```
  > ⚠️ DEPRECATED (Spider Web v4.0, 2026-03-02): Non-coord agents NEVER call
  > `runSubagent`. This document describes an outdated T1→T2→T3 model that DIRECTLY
  > CONTRADICTS AGENT-DISPATCH-PROTOCOL.md Invariant I-3. See §3 for the current model.
  ```

**2. Phantom-Felder aus 4 Dokumenten entfernen**
- Owner: exec-doc
- Aufwand: 45 Minuten
- Evidence: 3/9 Analysten HIGH/CRITICAL; staleness-Analyst (0.89) explizit bestätigt
- Betroffene Dateien: `copilot-instructions.md`, `AGENT-DISPATCH-PROTOCOL.md` (I-6), `devsteps-R0-coord.agent.md`-Handoffs, `TIER2-PROTOCOL.md` Phase 4
- Aktion: `report_path`/`upstream_paths`/`verdict` durch korrekte Beschreibung ersetzen:
  *"coord liest alle MandateResults via `read_mandate_results(sprint_id)` — kein `report_path` zum Weiterreichen"*

**3. Direct-Pass als REJECTED in AGENT-DISPATCH-PROTOCOL festhalten**
- Owner: exec-doc
- Aufwand: 10 Minuten
- Evidence: Impact-Analyse (<2% Latenzgewinn vs. Verlust von Validierung + Audit-Trail)
- Aktion: Neue Sektion "Architectural Decision Records" in `AGENT-DISPATCH-PROTOCOL.md`

### KURZFRISTIG (KW10, 1 Woche — Schema + Protokoll-Fixes)

**4. Zod-Schema-Erweiterungen in `cbp-mandate.ts`**
- Owner: exec-impl
- Aufwand: 2h (Schema + Tests)
- Evidence: 5/9 Analysten MAJOR; hebt coord Ring-2-Selektion von informeller Konvention auf Schema-Garantie
- Aktion (backward-compatible):
  ```typescript
  t3_recommendations: z.record(z.enum(['impact','constraints','staleness','quality','integration']),
    z.enum(['MUST','SHOULD','COULD'])).optional(),
  n_aspects_recommended: z.number().int().min(1).max(5).optional(),
  failed_approaches: z.array(z.string()).optional(),
  ```

**5. Quorum-Check in coord-Instructions**
- Owner: exec-doc oder exec-impl
- Aufwand: 1h
- Evidence: 4/9 Analysten HIGH (risk B9 + quality GAP-5 + constraints H + impact I)
- Aktion: Regel in `devsteps-R0-coord.agent.md` nach Ring-1-Dispatch-Block:
  *"Nach Ring-1-Fan-out: `read_mandate_results(sprint_id)` gegen dispatched-agent-set prüfen. Bei Delta > 0: `write_escalation`. NEVER silent weiterführen."*

**6. R2-Kanal-Konsolidierung**
- Owner: exec-doc
- Aufwand: 1.5h
- Evidence: staleness-Analyst HIGH; Live-Daten zeigen `write_mandate_result` für R2 (SPIKE-021 selbst)
- Aktion: Alle 5 R2-Agent-Dateien + `AGENT-DISPATCH-PROTOCOL.md` I-5/I-6 auf einheitlich `write_mandate_result` aktualisieren. `write_analysis_report` für R2 offiziell deprecaten.

**7. MandateType-Enum alignment**
- Owner: exec-impl
- Aufwand: 30 Minuten
- Evidence: quality GAP-4; Inkonsistenz in 3 Quellen
- Aktion: `cbp-mandate.ts`: `'quality-review'` → `'quality'`

**8. VS Code-Mindestversion dokumentieren**
- Owner: exec-doc
- Aufwand: 30 Minuten
- Evidence: constraints-Analyst MEDIUM; externally non-changeable but communicable
- Aktion: `README.md`, `INSTALL.md`, Agent-Frontmatter: "Requires VS Code 1.109+"; `/compact` + `/fork` als Context-Budget-Tools (1.110+) in coord-Instructions

### MITTELFRISTIG (KW11–12, 1 Monat)

**9. Contract-Tests Dispatch-Zyklus**
- Owner: exec-test + worker-test
- Aufwand: 2–3 Tage (Vitest-Unit + BATS-Integration)
- Evidence: 4/9 Analysten HIGH; 0% Coverage für kritischsten Pfad
- Szenarien: Silent-Failure / Format-Mismatch / Quorum-Violation / Partial-Write-Recovery simulieren

**10. Extension CBP-Layer (`cbpProvider.ts`)**
- Owner: exec-impl + worker-impl
- Aufwand: MEDIUM (nach bestehendem DataProvider-Muster, kein neues API-Dependency)
- Evidence: integration-Analyst (0.88); Extension blind gegenüber laufenden Spider-Web-Dispatches
- Aktion: `cbpProvider.ts` + `AgentDispatchNode` + file-watch auf `.devsteps/cbp/`; Analyst-Status/Confidence im TreeView

**11. CLI `devsteps cbp status <sprint-id>`**
- Owner: exec-impl
- Aufwand: NIEDRIG (1 Tag)
- Evidence: integration-Analyst; MandateResults nur via direkten Dateizugriff inspizierbar
- Aktion: Liest `*.result.json` via `MandateResultSchema.safeParse`; Coverage-Tabelle (analyst / status / confidence / token_cost)

**12. content.txt TTL-Cleanup nach Sprint-done-gate**
- Owner: exec-impl
- Aufwand: 1h (coord-Instructions + optionaler Cleanup-Call)
- Evidence: risk A4 HIGH; ~27 MB/Monat unbegrenzt wachsend
- Timing-Constraint: Cleanup NUR nach Session-End, NICHT während aktivem Sprint (bricht Session-Resume)

### LANGFRISTIG / EXTERN (Roadmap — nicht implementieren)

**13. Streaming Sub-Agent-Output (VS Code 1.112–1.115, Q3 2026)**
- Extern blockiert: CIS-Architekturgrenze. Copilot SDK Technical Preview Trajectory deutet auf Q3 2026 hin.
- Aktion: Beobachten. In AGENT-DISPATCH-PROTOCOL.md als "extern blockiert" dokumentieren.

**14. Typed `runSubagent` Returns (VS Code API-Änderung nötig)**
- Machbarkeit: 1/5 (extern, hard-coded CIS)
- Aktion: Von Roadmap streichen; stattdessen Zod-Schema im MandateResult-Kanal maximieren.

**15. MCP Push-Notifications für MandateResult (SDK v1.22.0 SSE)**
- Machbarkeit: 3/5 (technisch möglich, aber Bottleneck bei runSubagent, nicht MCP-Transport)
- Aktion: Nach Contract-Tests (KW11–12) evaluieren; kein unmittelbarer Mehrwert vor Testabdeckung.

---

## 11. Framework-Vergleich

| Dimension | LangGraph | CrewAI | AutoGen | VS Code `#runSubagent` + DevSteps |
|-----------|-----------|--------|---------|----------------------------------|
| **Typisierung** | ✅ TypedDict + Reducer | ✅ Pydantic-Schema | ✅ Typed Messages | ⚠️ Zod-Schema (MandateResult), Natural Language (Mandate) |
| **State-Management** | ✅ Automatisch (Graph-State) | ✅ Pydantic-Chaining | ✅ Event-Driven | ⚠️ Manuell (.devsteps/cbp/ Filesystem) |
| **Checkpointing** | ✅ Automatisch | ⚠️ Partiell | ✅ Session-State | ✅ `write_iteration_signal` (manuell) |
| **Retry-Logic** | ✅ Automatisch (Graph-Loops) | ⚠️ Manuell | ✅ Built-in | ✅ `write_escalation` (Loop-Bounds) |
| **Direkte A→B-Kommunikation** | ✅ Graph-Edges | ✅ Task-Output-Chain | ✅ Event-Bus | ❌ CIS-Grenze (unvermeidbar) |
| **Streaming** | ✅ LangStream | ⚠️ Partiell | ✅ Event-Stream | ❌ VS Code 1.110 (Q3 2026 möglich) |
| **Observability** | ✅ LangSmith | ⚠️ Crew-Logs | ✅ Tracing | ❌ Opake Tool-IDs, kein Dispatch-Manifest |
| **Contract-Tests** | ✅ Standard | ✅ Standard | ✅ Standard | ❌ 0% Coverage |
| **IDE-Integration** | ⚠️ Extern | ⚠️ Extern | ⚠️ Extern | ✅ Nativ (VS Code Copilot) |
| **Tool-Ökosystem** | ✅ LangChain | ✅ Custom Tools | ✅ Plugin-System | ✅ MCP (2025-11-25 Standard) |

**Fazit:** VS Code `#runSubagent` + DevSteps-MandateResult-Kanal kompensiert die wichtigsten framework-typischen Features manuell — aber ohne die Testabdeckung und Observability-Infrastruktur, die in LangGraph/AutoGen selbstverständlich sind. Das ist die zentrale Lücke (Testbarkeit 3/10, Observability 4/10).

---

## 12. DevSteps Follow-up Items

Vom exec-planner (conf. 0.91) priorisierter Item-Katalog für Worker-devsteps nach SPIKE-021:

| Typ | Titel | Priorität | Aufwand |
|-----|-------|-----------|---------|
| **TASK** | TIER2-PROTOCOL.md deprecieren + Phantom-Felder aus 4 Dokumenten entfernen | urgent-important | ≤2h |
| **TASK** | cbp-mandate.ts Zod-Erweiterungen: `t3_recommendations`, `n_aspects_recommended`, `failed_approaches[]` + MandateType-Fix | urgent-important | 2h |
| **TASK** | Quorum-Check-Protokoll in coord-Instructions + R2-Kanal-Konsolidierung | urgent-important | 1.5h |
| **TASK** | VS Code 1.109+ Mindestversion + `/compact`/`/fork` in README/INSTALL/Agent-Frontmatter | not-urgent-important | 30min |
| **STORY** | Contract-Tests Dispatch-Zyklus (Vitest-Unit + BATS-Integration): Silent-Failure, Format-Mismatch, Quorum-Violation | not-urgent-important | 2–3 Tage |
| **STORY** | Extension CBP-Layer (`cbpProvider.ts` + `AgentDispatchNode`, file-watch `.devsteps/cbp/`) | not-urgent-important | MEDIUM |
| **TASK** | CLI `devsteps cbp status <sprint-id>`: Coverage-Tabelle via MandateResultSchema | not-urgent-important | 1 Tag |
| **SPIKE** | MCP Push-Notifications für MandateResult (SDK v1.22.0 SSE, nach Contract-Tests) | not-urgent-not-important | ASSESS |

---

## 13. Quellen

### Tier 1: VS Code Platform (Primärquellen)
1. **VS Code Subagents Dokumentation** — `code.visualstudio.com/docs/copilot/agents/subagents` (laufend aktualisiert, zuletzt verifiziert 2026-03-05)
2. **VS Code Custom Agents** — `code.visualstudio.com/docs/copilot/customization/custom-agents`
3. **Visual Studio Magazine: VS Code 1.107** (Dez 2025) — MCP vollständig integriert — `visualstudiomagazine.com/articles/2025/12/12/vs-code-1-107`
4. **Visual Studio Magazine: VS Code 1.110** (Mar 4, 2026) — Session Memory `/compact` + `/fork` — `visualstudiomagazine.com/Articles/2026/03/04/VS-Code-1-110-Ships`

### Tier 2: Community & Best Practices
5. **Imaginet, Dec 12, 2025** — "Mastering Subagents in VS Code Copilot" — `imaginet.com/2025/mastering-subagents-in-vs-code-copilot`
6. **dev.to (Seiwan Maikuma), Dec 11, 2025** — "Deep Dive into the Latest GitHub Copilot Updates" — `dev.to/seiwan-maikuma/deep-dive-into-the-latest-github-copilot-updates-3pba`
7. **LawrenceHwang Gist, Feb 17, 2026** — File-Based Handoff als Community-Best-Practice — `gist.github.com/LawrenceHwang/6194421c3bb4208fff84452b403e191a`
8. **Visual Studio Magazine Hands-On, Feb 9, 2026** — "Hands-on with new multi-agent orchestration" — `visualstudiomagazine.com/articles/2026/02/09/hands-on-with-new-multi-agent-orchestration`
9. **alexop.dev, Jan 24, 2026** — "What's new VS Code Copilot January 2026" — `alexop.dev/posts/whats-new-vscode-copilot-january-2026`
10. **O'Reilly Radar, Feb 25, 2026** — "Why Multi-Agent Systems Need Memory Engineering" — `oreilly.com/radar/why-multi-agent-systems-need-memory-engineering`

### Tier 3: SDK & Protocol
11. **Copilot SDK Changelog, Jan 14, 2026** — `github.blog/changelog/2026-01-14-copilot-sdk`
12. **GitHub Copilot SDK** (Technical Preview, Jan 14, 2026) — `github.com/github/copilot-sdk`
13. **MCP Spezifikation, 2025-11-25** — `modelcontextprotocol.io/spec`
14. **@modelcontextprotocol/sdk v1.22.0** — installiert in `packages/mcp-server`; SSE + StreamableHTTPServerTransport

### Tier 4: Competitive Frameworks
15. **LangGraph Dokumentation** — TypedDict State, Reducer Functions, Checkpointing — `langchain-ai.github.io/langgraph`
16. **CrewAI Framework** — Pydantic Task Output Chain — `docs.crewai.com`
17. **AutoGen (Microsoft)** — Event-Driven Typed Messages — `microsoft.github.io/autogen`

### Tier 5: Interne Codebase (Live-Archäologie, 2026-03-05)
- `packages/shared/src/schemas/cbp-mandate.ts` — MandateResultSchema, MandateSchema, MandateType
- `packages/mcp-server/src/handlers/cbp-mandate.ts` (323 Zeilen, atomare Writes, bidirektionale Zod-Validierung)
- Live-MandateResult-Dateien: TASK-293 (5 Dateien), TASK-296-sprint (6 Dateien), SPIKE-021 (10 Dateien), gpu-research-2026-03-05 (1 Datei)
- workspaceStorage-Analyse: Session `1c2e94bc` (49 Tool-Verzeichnisse, 2026-03-05 09:38–10:28)
- 36 Agent-Dateien (Ring 0–5) + 17 Prompt-Dateien: vollständig analysiert

---

*Research Brief erstellt von `devsteps-R4-exec-doc` | SPIKE-021 | 2026-03-05*
*Basis: 10 MandateResults | Ø Konfidenz: 0.89 | 17+ externe Quellen | 91-Tage-Fenster*
