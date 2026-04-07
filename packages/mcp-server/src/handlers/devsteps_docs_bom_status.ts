/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP handler: devsteps_docs_bom_status
 * Read-only progress check on an import session.
 *
 * @see STORY-238 SPIKE-044
 */

import { join } from 'node:path';
import { validateSession } from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

export default async function devstepsDocsBomStatusHandler(args: Record<string, unknown>) {
  const workspaceRoot = getWorkspacePath();
  const devstepsDir = join(workspaceRoot, '.devsteps');
  const sessionId = args.session_id as string;
  const token = args.token as string;

  const validation = await validateSession(devstepsDir, sessionId, token);
  if ('error' in validation) {
    return { success: false, error: validation.error };
  }
  const session = validation.session;

  const skipped = session.classified.filter((c) => c.decision === 'skip').length;
  const mixedFlagged = session.classified.filter((c) => c.mixed).length;

  // Build summary table
  const rows = session.files.map((f) => {
    const entry = session.classified.find((c) => c.path === f.path);
    const type = entry?.diataxis_type ?? '-';
    const decision = entry?.decision ?? 'pending';
    const mixed = entry?.mixed ? '⚠️' : '';
    return `| ${f.path} | ${type} | ${decision} | ${mixed} |`;
  });

  const summaryTable = [
    '| Path | Type | Decision | Mixed |',
    '|------|------|----------|-------|',
    ...rows,
  ].join('\n');

  const nextSteps: string[] = [];
  if (session.pending.length > 0) {
    nextSteps.push(
      `${session.pending.length} file(s) still pending classification. Call devsteps_docs_classify for: ${session.pending.slice(0, 5).join(', ')}${session.pending.length > 5 ? ` (and ${session.pending.length - 5} more)` : ''}`
    );
  } else {
    nextSteps.push(
      `All ${session.classified.length} files resolved. Call devsteps_docs_bom_commit to create DOC items and update the BOM. Pass dry_run: true to preview without writing.`
    );
  }

  return {
    success: true,
    session_id: session.session_id,
    status: session.status,
    files_total: session.files.length,
    classified: session.classified.length,
    skipped,
    pending: session.pending.length,
    mixed_flagged: mixedFlagged,
    summary_table: summaryTable,
    next_steps: nextSteps,
  };
}
