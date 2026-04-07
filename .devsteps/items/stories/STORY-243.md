## Problem
13+ Spider Web MCP tools are missing from the HTTP MCP path. Marketplace users only get ~15 of 30+ tools. Missing tools include: writeMandateResult, readMandateResults, writeAnalysisReport, readAnalysisEnvelope, writeDispatchManifest, patchDispatchManifest, writeEscalation, writeIterationSignal, writeRejectionFeedback, writeSprintBrief, writeVerdict, context, updateCopilotFiles.

## Acceptance Criteria
- [ ] All tools from stdio MCP path are also available via HTTP MCP
- [ ] Extension McpServerDefinitionProvider registers complete tool set
- [ ] Tool count matches between stdio and HTTP transports
- [ ] Smoke test: Spider Web dispatch works after Marketplace install