Move all permanent research output files from `tmp/` to the new `docs/research/` archive structure.

**Migration map:**
- `tmp/SPIKE-036-TSD-BOM-Research-Brief.md` → `docs/research/SPIKE-036/brief.md`
- `tmp/SPIKE-039-CodeToDoc-Research-Brief.md` → `docs/research/SPIKE-039/brief.md`
- `tmp/analyst-research-SPIKE-036-session2.md` → `docs/research/SPIKE-036/agents/analyst-research-session2.md`
- `tmp/analyst-internal-SPIKE-039-session1.md` → `docs/research/SPIKE-039/agents/analyst-internal-session1.md`
- `tmp/analyst-research-SPIKE-039-session1.md` → `docs/research/SPIKE-039/agents/analyst-research-session1.md`
- `tmp/analyst-web-SPIKE-039-session1.md` → `docs/research/SPIKE-039/agents/analyst-web-session1.md`
- `tmp/analyst-context-SPIKE-039-session1.md` → `docs/research/SPIKE-039/agents/analyst-context-session1.md`
- `tmp/aspect-constraints-SPIKE-039-session1.md` → `docs/research/SPIKE-039/agents/aspect-constraints-session1.md`
- `tmp/aspect-impact-SPIKE-039-session1.md` → `docs/research/SPIKE-039/agents/aspect-impact-session1.md`
- `tmp/aspect-quality-SPIKE-039-session1.md` → `docs/research/SPIKE-039/agents/aspect-quality-session1.md`
- `tmp/aspect-integration-SPIKE-039-session1.md` → `docs/research/SPIKE-039/agents/aspect-integration-session1.md`
- `tmp/analyst-research-SPIKE-040-session1.md` → `docs/research/SPIKE-040/agents/analyst-research-session1.md`
- `tmp/analyst-internal-SPIKE-040-session1.md` → `docs/research/SPIKE-040/agents/analyst-internal-session1.md`
- `tmp/analyst-context-SPIKE-040-session1.md` → `docs/research/SPIKE-040/agents/analyst-context-session1.md`
- `tmp/aspect-impact-SPIKE-040-session1.md` → `docs/research/SPIKE-040/agents/aspect-impact-session1.md`
- `tmp/aspect-quality-SPIKE-040-session1.md` → `docs/research/SPIKE-040/agents/aspect-quality-session1.md`
- `tmp/aspect-constraints-SPIKE-040-session1.md` → `docs/research/SPIKE-040/agents/aspect-constraints-session1.md`
- `tmp/aspect-staleness-SPIKE-040-session1.md` → `docs/research/SPIKE-040/agents/aspect-staleness-session1.md`
- `tmp/aspect-integration-SPIKE-040-session1.md` → `docs/research/SPIKE-040/agents/aspect-integration-session1.md`
- Any remaining `tmp/analysis-*`, `tmp/aspect-*`, `tmp/analyst-*` files → check and migrate

**Prerequisite:** TASK-382 (docs/research/ structure) must be done first.