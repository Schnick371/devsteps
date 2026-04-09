Analyse: Brauchen wir einen `research`-ItemType für Spike-Ergebnisse (Forschungsberichte, Research Briefs, ADR-Vorstufen)?

**Kontext:** `research` existiert als `DiataxisType` in `heuristic-classify.ts`, `docs-import.ts`, `devsteps_docs_new.ts` — aber NICHT als `ItemType` im Zod-Enum.

**Hypothese:** Ein `research`-ItemType mit Präfix `RSC-NNN` würde Spike-Ergebnisse von Spike-Prozessen trennen (Spike = Durchführung, Research = Ergebnis-Artefakt).

Research-Items wären cross-cutting wie `doc` und `test` — kein Hierarchie-Element.

**Atomare Änderungen (6 Dateien):**
1. `packages/shared/src/schemas/index.ts` — Zod ItemType Enum erweitern
2. `packages/shared/src/schemas/enum-sync.test.ts` — Snapshot aktualisieren
3. `packages/shared/src/core/config.ts` — allowed ItemTypes + Prefix-Map
4. `packages/shared/src/core/validation.ts` — cross-cutting Guard für `research`
5. `.devsteps/config.json` — `item_type_prefixes` + `allowed_item_types`
6. `packages/cli/src/commands/add.ts` — item-type Options

**Exit Criteria:** Spike-Ergebnis dokumentiert in Research-Item RSC-001.

**RSC-NNN Prefix:** Nicht RES (Konflikt mit REQ/Requirement).