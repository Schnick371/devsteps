VS Code 1.119 defaults `allowInvocationsFromSubagents: false` — conductors (exec-impl, exec-test, exec-doc) cannot dispatch worker-* subagents unless explicitly enabled. Additionally, VS Code 1.119 adds OpenTelemetry tracing (`github.copilot.chat.otel.enabled`) which produces `invoke_agent` root spans with nested `execute_tool` child spans showing per-agent token usage. Test A: Enable OTel, dispatch coord → exec-impl → worker-coder chain, verify nested `execute_tool` spans appear in OTel trace. Test B: Test with `allowInvocationsFromSubagents: false` (default) vs `true` — confirm whether worker dispatch fires or silently fails. Record findings in AGENT-DISPATCH-PROTOCOL.md §4 with concrete evidence. See also: tmp/vscode-1119-research-brief.md for context.

---
## Test Plan Delivered (2026-05-12, sprint close)

A complete step-by-step empirical test plan has been written to `tmp/spike-064-test-plan.md` (file: `tmp/spike-064-otel-test-plan.md`). It cannot be executed by Copilot agents because it requires VS Code settings flips, window reloads, and reading the OTel output channel during live dispatch — all human-only operations.

**6 steps** documented: baseline collector → enable OTel → Test A (`allowInvocationsFromSubagents:false`) → Test B (`:true`) → diff & synthesize → update `AGENT-DISPATCH-PROTOCOL.md §4` → close.

**Status moved to `review`** (awaiting human empirical run). When you execute the plan and paste the traces, an analyst can synthesize and close.

**Supporting research already in:** SPIKE-032 confirmed VS Code 1.119 OTel (`github.copilot.chat.otel`) is the correct tracer for Copilot dispatch (AITK Agent Inspector cannot see it). Use VS Code 1.119+ before running.