## Follow-up Forschungsfragen zu SPIKE-021

### zu 3. Parent-Context Injection — wie genau?
Wie wird das LLM-Text-Ergebnis eines subagents in den Parent-Context "injiziert"? Technisch: Was passiert mit dem Text zwischen runSubagent und nächstem LLM-Call?

### zu 4. CBP-Datei-Audit
Analysiere .devsteps/cbp/ ob die Dateien tatsächlich so genutzt werden wie erwartet.

### zu 5. Coord Agent — was genau passiert?
Liest coord das Ergebnis und übergibt Dateipfad direkt weiter? Oder synthetisiert er es intern bevor er es an nächsten subagent gibt?

### zu 6.a. Phantom-Felder — aufnehmen oder entfernen?
report_path, upstream_paths, verdict — brauchen wir sie wirklich?

### zu 6.b. TIER2-PROTOCOL.md LÖSCHEN
Nicht nur deprecieren — vollständig löschen!

### zu 6.c. Quorum-Check als Flag?
War das als Flag-Mechanismus gedacht?

### zu 6.d. VS Code 1.109+ Requirement dokumentieren + in Abhängigkeiten aufnehmen
User Onboarding + package.json engines field + Warnung im CLI?

### zu 6.e. Tracing verbessern
Wie können wir Tracing des Spider Web Dispatch konkret verbessern?## Research Findings & Outcomes (commit ca315f8)

**zu 3 — Parent-Context injection:** Each #runSubagent = fresh context window. Output injected as tool_result block into parent history. Direct A→B pass is physically impossible (CIS architecture). 10 parallel agents ≈ 8–20K tokens injected into coord. Documented in AGENT-DISPATCH-PROTOCOL.md § Context Propagation Model.

**zu 4 — CBP audit:** 80–100% compliance. Issues: item_ids:[] in some files, short analyst names, fabricated timestamps. → TASK-335.

**zu 5 — coord handoff:** coord synthesizes from MandateResult prose and passes file paths only. Never forwards raw findings JSON. Formalized as Invariant I-12 in AGENT-DISPATCH-PROTOCOL.md.

**zu 6.a — Phantom fields:** Option C selected — prose-only annotations added at 2 locations in AGENT-DISPATCH-PROTOCOL.md. I-6 note added. No schema changes.

**zu 6.b — TIER2-PROTOCOL.md:** DELETED from all 3 locations (root + cli + mcp-server).

**zu 6.c — Quorum-check:** Mechanism C — extend read_mandate_results with optional expected_agent_names parameter → quorum_ok + missing_analysts in response. → TASK-330.

**zu 6.d — VS Code 1.109.0:** engines.vscode updated ^1.99.0→^1.109.0 in extension/package.json. INSTALL.md System Requirements section added. README.md Prerequisites table added. Runtime guard → TASK-333.

**zu 6.e — Tracing:** pino child-logger with dispatch_id UUID per sprint-run → TASK-332. Dispatch-manifest.json → TASK-331.

**Follow-up items:** TASK-330 (quorum_ok) · TASK-331 (dispatch-manifest) · TASK-332 (dispatch_id tracing) · TASK-333 (vscode runtime guard) · TASK-334 (Zod validation) · TASK-335 (CBP audit)