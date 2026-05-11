Research local GPU (12GB VRAM) usage with VS Code AI Toolkit, Agent Inspector, and local inference engines for devsteps Spider Web architecture.

---
## Research Findings (2026-05-12, sprint close)

**Confidence:** 0.93 · **Verdict:** CONDITIONAL_GO (Ring 4) / NO-GO (Rings 0–3, 5)
**Report:** `tmp/spike-032-local-gpu-aik-decision.md` · **MandateResult:** `.devsteps/cbp/SPIKE-032/b7c3a8f2-4e91-4d5a-9f06-2c8e7a1b3d94.result.json`

### Q1 — 12GB VRAM feasibility
**GO for Ring 4 only.**
- `mistral:7b-instruct-v0.3-q4_K_M` (~4.5 GB, ≤7 parallel agents) — simple workers
- `llama3.2:11b-instruct-q4_K_M` (~7.0 GB, single instance) — exec conductors

Rings 0, 1, 2, 3, 5 stay on **Claude Sonnet 4.6** — NO-GO for local. Q4_K_M ~7% accuracy loss is unacceptable for MAP-REDUCE-RESOLVE-SYNTHESIZE and gate-review roles.

### Q2 — VS Code AI Toolkit Agent Inspector
**COMPLEMENT to SPIKE-064 OTel, not alternative.** Inspector traces only Python `agentdev` workflows (e.g. `tmp/visualizer/agent.py` Spider Web radar) — it cannot see Copilot `runSubagent` chains. **VS Code 1.119 OTel** (`github.copilot.chat.otel`) is the correct tracer for Ring 0→4 Copilot dispatch.

### Q3 — Inference engines
- **Ollama: ADOPT** — best DX, CUDA-native, v0.5+ tool calling, BYOM-compatible
- **llama.cpp: ADOPT** — max throughput
- **vLLM: TRIAL** — multi-user only, needs 16 GB+
- **DirectML: HOLD** — Windows/WSL2 only

### Blocker sequence (for follow-up implementation)
1. Complete SPIKE-064 OTel validation (Copilot dispatch tracing)
2. Apply Ollama P0 security patches
3. Add `chat.models` BYOM config to VS Code settings
4. Create `devsteps-local-model.instructions.md`