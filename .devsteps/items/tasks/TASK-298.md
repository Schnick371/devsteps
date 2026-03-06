Investigate AI Toolkit extension tracing APIs and evaluation runner. Check if AITK exposes agent execution events that a third-party extension can subscribe to. Document results.

## Research Pre-Findings (2026-03-05) — AI Toolkit AITK Tracing

**Confirmed: AI Toolkit does NOT expose a tracing observer API for cross-extension use.**

Evidence:
- AITK runs a local OTLP collector at `http://localhost:4318` — accepts spans from AI apps (Azure AI Inference SDK, OpenAI Agents, LangChain), NOT from VS Code extension intercepts
- `vscode.extensions.getExtension('ms-windows-ai-studio.windows-ai-studio').exports` → no tracing observer or registration hook exposed
- AITK tracing is for application-level instrumentation of AI apps the user writes, not for Copilot's internal calls
- `vscode.env.createTelemetryLogger()` is completely scoped to the creating extension — no cross-extension span correlation

**Spike Task Resolution:** Spike should check if AITK EXPORTS ANY public interface usable for active (non-passive) tracing of agent runs. The OTLP collector at localhost:4318 could theoretically receive spans if our coord agents are instrumented with OpenTelemetry — this is a viable FUTURE enhancement option. Document for roadmap.