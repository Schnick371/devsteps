Read https://code.visualstudio.com/api/extension-guides/language-model and proposed APIs. Document: (1) what events fire when Copilot calls a model, (2) whether extension can subscribe passively, (3) what metadata is available (agent name, model, tokens). Write findings to .devsteps/traces/spike-lm-api.md

## Research Pre-Findings (2026-03-05) — Passive LM API Observation

**Confirmed: Passive observation of Copilot/Copilot-agent LM calls is NOT possible from a third-party extension.**

Evidence:
- `vscode.lm.onDidChangeChatModels` → fires on model registry changes only, not per-call
- `LanguageModelChat.sendRequest()` → caller must be the extension making the call
- `vscode.chat.createChatParticipant()` → only fires for YOUR participant @-mentions
- VS Code proposed APIs (chatParticipantAdditions.d.ts, March 2026) → all scoped to own extension

**Spike Task Resolution:** The investigation should CONFIRM this + document the exact proposed-API landscape for future awareness. Architecture is confirmed: TypeScript TraceLogger (active write by coord agents) is the only reliable path. Spike timebox may be reduced to 0.5d.