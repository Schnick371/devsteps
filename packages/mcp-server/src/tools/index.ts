/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP Tool definitions barrel — re-exports all tools from domain-specific modules.
 *
 * Domain split:
 *   crud.ts         — init, add, get, list, update
 *   relationships.ts — link, unlink, trace
 *   system.ts       — search, status, export, archive, purge, context, health, metrics
 *   analysis.ts     — write_analysis_report, read_analysis_envelope, write_verdict, write_sprint_brief
 *   cbp.ts          — write_mandate_result, read_mandate_results, write_rejection_feedback,
 *                     write_iteration_signal, write_escalation
 */

export { addTool, getTool, initTool, listTool, updateTool } from './crud.js';
export {
  linkTool,
  traceTool,
  unlinkTool,
} from './relationships.js';
export {
  archiveTool,
  contextTool,
  exportTool,
  healthCheckTool,
  metricsTool,
  purgeTool,
  searchTool,
  statusTool,
  updateCopilotFilesTool,
} from './system.js';
export {
  readAnalysisEnvelopeTool,
  writeAnalysisReportTool,
  writeSprintBriefTool,
  writeVerdictTool,
} from './analysis.js';
export {
  readMandateResultsTool,
  writeEscalationTool,
  writeIterationSignalTool,
  writeMandateResultTool,
  writeRejectionFeedbackTool,
} from './cbp.js';
