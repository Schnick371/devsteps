# SPIKE-048 — BOM-Index: MD-Revisions-Dokumentation

<!-- bom-node: ARCH-SPIKE048 | parent: ARCH-RESEARCH | doc_subtype: research | status: approved -->
<!-- devsteps_items: SPIKE-048 | created_at: 2026-04-04 | classification: research/spike/library-eval -->

**Item:** SPIKE-048  
**Typ:** BOM-Root-Knoten (L1 — Index-Dokument)  
**Datum:** 2026-04-04  
**Status:** approved — Gate PASS 0.87

Dieser Index beschreibt die dokumenten-Hierarchie (BOM / Bill of Materials) für SPIKE-048: "Revisionssystem für DevSteps Work-Item-Markdown-Dateien".

---

## Dokument-Hierarchie (BOM)

```
docs/research/SPIKE-048/
│
├── README.md  (dieser Datei — L1 Index)
│   bom-node: ARCH-SPIKE048 | doc_subtype: research | status: approved
│
├── SPIKE-048-RevisionMD-Research-Brief.md   (L1 — Hauptdokument)
│   bom-node: ARCH-SPIKE048-BRIEF | doc_subtype: research | status: approved
│   → Vollständiger Research Brief, Gate PASS 0.87
│
├── SPIKE-048-Option-Comparison.md           (L2 — Entscheidungsmatrix)
│   bom-node: ARCH-SPIKE048-OPT | doc_subtype: reference | status: approved
│   → Options A/B/C/D mit Pros/Cons/Aufwand; Entscheidungs-Flowchart
│
├── SPIKE-048-Schema-Spec-STORY240.md        (L2 — Technische Spezifikation)
│   bom-node: ARCH-SPIKE048-SCHEMA | doc_subtype: reference | status: approved
│   → description_hash, description_updated, description_edit_count
│   → Implementierungsplan für STORY-240
│
├── SPIKE-048-GitMCP-Setup-Guide.md          (L2 — How-To)
│   bom-node: ARCH-SPIKE048-GITCFG | doc_subtype: how-to | status: approved
│   → Git-MCP-Server Einrichtung (TASK-415)
│   → MCP-Tools für AI-Agenten
│
└── SPIKE-048-AIAgent-Staleness-Protocol.md  (L2 — Protokoll / Referenz)
    bom-node: ARCH-SPIKE048-STALE | doc_subtype: reference | status: draft
    → Staleness-Detection mit description_hash
    → aspect-staleness Protokoll-Update
    → Implementierbar nach STORY-240
```

---

## BOM-Node-Tabelle

| Node-ID | Titel (Kurzform) | doc_subtype | status | devsteps_items | file_path |
|---------|-----------------|-------------|--------|----------------|-----------|
| ARCH-SPIKE048 | MD-Revisions BOM-Index | research | approved | SPIKE-048 | `docs/research/SPIKE-048/README.md` |
| ARCH-SPIKE048-BRIEF | Research Brief | research | approved | SPIKE-048 | `docs/research/SPIKE-048/SPIKE-048-RevisionMD-Research-Brief.md` |
| ARCH-SPIKE048-OPT | Entscheidungsmatrix | reference | approved | SPIKE-048 | `docs/research/SPIKE-048/SPIKE-048-Option-Comparison.md` |
| ARCH-SPIKE048-SCHEMA | Schema-Spec STORY-240 | reference | approved | SPIKE-048, STORY-240 | `docs/research/SPIKE-048/SPIKE-048-Schema-Spec-STORY240.md` |
| ARCH-SPIKE048-GITCFG | Git-MCP Setup Guide | how-to | approved | SPIKE-048, TASK-415 | `docs/research/SPIKE-048/SPIKE-048-GitMCP-Setup-Guide.md` |
| ARCH-SPIKE048-STALE | AI Staleness Protocol | reference | draft | SPIKE-048, STORY-240, TASK-416, TASK-417 | `docs/research/SPIKE-048/SPIKE-048-AIAgent-Staleness-Protocol.md` |

---

## Verknüpfte DevSteps-Items

| Item | Typ | Status | Beschreibung |
|------|-----|--------|-------------|
| **SPIKE-048** | spike | done | Research-Spike: Revisionssystem für MD-Dateien |
| **SPIKE-049** | spike | planned | Klärung: ItemMetadata.commits[] — implement oder entfernen? |
| **BUG-079** | bug | done | ✅ Write-Order-Fix in update.ts (MD before JSON) |
| **STORY-240** | story | planned | 3 JSON-Felder: description_hash, description_updated, description_edit_count |
| **TASK-415** | task | planned | Git-MCP Konfigurationsdoku für Copilot-Agenten |
| **TASK-416** | task | planned | AI-GUIDE.md: Staleness-Guidance aktualisieren |
| **TASK-417** | task | planned | aspect-staleness Protokoll-Update |
| **TASK-418** | task | planned | CLI getCommand() — neue Revision-Felder anzeigen |

---

## Klassifikation

| Attribut | Wert |
|----------|------|
| **domain** | `research` |
| **subdomain** | `spike` |
| **topic** | `library-eval` |
| **concerns** | `reliability`, `dx` |
| **scope** | `platform` |
| **cluster** | `revision-md-001` |

---

## Forschungs-Ergebnis (Zusammenfassung)

**Empfehlung: REJECT Custom CoW-Store, ADOPT Git-MCP + 3 JSON-Felder**

1. Git ist bereits vorhanden und vollständig — Custom-Implementation würde History duplizieren (Two-Source-of-Truth)
2. Git-MCP-Server: Kein Code-Change im Monorepo nötig, nur Konfiguration
3. 3 JSON-Felder (Option C): Fallback für Non-Git-Environments; schließt AI-Staleness-Gap, den Git alleine nicht schließt
4. Custom CoW (Option D): 4–6 Wochen Aufwand für 0.4 Revisionen/Story Durchschnitt — unverhältnismäßig

**Gate:** PASS 0.87 (3 Runden, exec-doc + gate-reviewer)
