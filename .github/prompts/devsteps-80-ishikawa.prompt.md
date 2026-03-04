---
agent: "devsteps-R0-coord-ishikawa"
model: "Claude Sonnet 4.6"
description: "Workspace health analysis — Ishikawa root cause analysis, coord dispatches bone analysts + aspect agents across 6 dimensions"
tools:
  [
    "agent",
    "vscode",
    "execute",
    "read",
    "edit",
    "search",
    "devsteps/*",
    "bright-data/*",
    "ms-windows-ai-studio.windows-ai-studio/aitk_get_ai_model_guidance",
    "ms-windows-ai-studio.windows-ai-studio/aitk_get_agent_model_code_sample",
    "ms-windows-ai-studio.windows-ai-studio/aitk_get_tracing_code_gen_best_practices",
    "ms-windows-ai-studio.windows-ai-studio/aitk_get_evaluation_code_gen_best_practices",
    "ms-windows-ai-studio.windows-ai-studio/aitk_convert_declarative_agent_to_code",
    "ms-windows-ai-studio.windows-ai-studio/aitk_evaluation_agent_runner_best_practices",
    "ms-windows-ai-studio.windows-ai-studio/aitk_evaluation_planner",
    "ms-windows-ai-studio.windows-ai-studio/aitk_get_custom_evaluator_guidance",
    "ms-windows-ai-studio.windows-ai-studio/check_panel_open",
    "ms-windows-ai-studio.windows-ai-studio/get_table_schema",
    "ms-windows-ai-studio.windows-ai-studio/data_analysis_best_practice",
    "ms-windows-ai-studio.windows-ai-studio/read_rows",
    "ms-windows-ai-studio.windows-ai-studio/read_cell",
    "ms-windows-ai-studio.windows-ai-studio/export_panel_data",
    "ms-windows-ai-studio.windows-ai-studio/get_trend_data",
    "ms-windows-ai-studio.windows-ai-studio/aitk_list_foundry_models",
    "ms-windows-ai-studio.windows-ai-studio/aitk_agent_as_server",
    "ms-windows-ai-studio.windows-ai-studio/aitk_add_agent_debug",
    "ms-windows-ai-studio.windows-ai-studio/aitk_gen_windows_ml_web_demo",
    "todo",
  ]
---

# 🐟 Ishikawa — Workspace Health Analysis

## ⚠️ Read your agent file first

#file:../agents/devsteps-R0-coord-ishikawa.agent.md

Read it **in full** before doing anything else. It contains the 2-round dispatch protocol and bone mandates.

---

## Architecture

```
coord-ishikawa (center)
│
├── Round 1 — Bone Analysts (parallel fan-out)
│   ├── devsteps-R1-analyst-archaeology  →  Bones: Code + Structure
│   ├── devsteps-R1-analyst-quality      →  Bone:  Tests
│   └── devsteps-R1-analyst-risk         →  Bone:  Environment
│
├── Round 2 — Aspect Agents + Process Analyst (all parallel)
│   ├── devsteps-R2-aspect-staleness     →  Bone: Docs
│   ├── devsteps-R2-aspect-constraints   →  Cross-cutting: constraints
│   ├── devsteps-R2-aspect-impact        →  Cross-cutting: impact radius
│   ├── devsteps-R2-aspect-integration   →  Cross-cutting: integration seams
│   ├── devsteps-R2-aspect-quality       →  Cross-cutting: quality signals
│   └── devsteps-R1-analyst-context      →  Bone: Process
│
└── Synthesis → Fishbone Report + Action Plan
```

---

## What this session produces

1. **Fishbone report** — all 6 bones with signal strength (`🔴 HIGH` / `🟡 MEDIUM` / `🟢 LOW`) and evidence (file:line)
2. **Root cause weighting** — which bone explains the most
3. **Prioritized action plan** — Impact × Effort matrix, quick wins marked
4. **DevSteps items** — created on confirmation (Story per bone, Task per finding)
5. **Quick-win fixes** — auto-applied on approval (dead code, doc updates, commit hygiene)

---

## How to start

Describe what you want:

- **Full scan:** "Give me a complete health picture of this workspace"
- **Symptom-first:** "Tests have been unstable for weeks — find the root causes"
- **Dimension-focused:** "I suspect the architecture is the real problem — focus there"
- **Pre-sprint:** "We're about to start a big refactor — what should we fix first?"
- **Post-release:** "What health issues accumulated during the last sprint?"
