/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP handler: devsteps_docs_classify_confirm
 * Record classification decision for one file (accept/split/skip/rewrite).
 *
 * @see STORY-238 SPIKE-044
 */

import { resolve } from 'node:path';
import { join } from 'node:path';
import {
  type ClassifiedEntry,
  type DiataxisType,
  type SplitEntry,
  validateSession,
  writeSession,
} from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

export default async function devstepsDocsClassifyConfirmHandler(args: Record<string, unknown>) {
  const workspaceRoot = getWorkspacePath();
  const devstepsDir = join(workspaceRoot, '.devsteps');
  const filePath = args.path as string;
  const decision = args.decision as 'accept' | 'split' | 'skip' | 'rewrite';
  const diataxisType = args.diataxis_type as DiataxisType | undefined;
  const splits = args.splits as SplitEntry[] | undefined;
  const sessionId = args.session_id as string;
  const token = args.token as string;

  // Validation
  if (decision === 'accept' && !diataxisType) {
    return { success: false, error: "diataxis_type is required when decision is 'accept'" };
  }
  if (decision === 'split' && (!splits || splits.length === 0)) {
    return { success: false, error: "splits[] is required when decision is 'split'" };
  }

  // Path traversal guard for split paths
  if (splits) {
    for (const split of splits) {
      const resolved = resolve(workspaceRoot, split.new_path);
      if (!resolved.startsWith(resolve(workspaceRoot))) {
        return { success: false, error: `Path traversal detected in split: ${split.new_path}` };
      }
    }
  }

  const validation = await validateSession(devstepsDir, sessionId, token);
  if ('error' in validation) {
    return { success: false, error: validation.error };
  }
  const session = validation.session;

  // Idempotency: if already confirmed, return current state
  const existing = session.classified.find((c) => c.path === filePath);
  if (existing) {
    return {
      success: true,
      path: filePath,
      decision: existing.decision,
      pending_count: session.pending.length,
      classified_count: session.classified.length,
      next_steps:
        session.pending.length > 0
          ? [
              `${session.pending.length} file(s) remaining. Continue with devsteps_docs_classify for the next file: ${session.pending[0]} — use the same session_id and token.`,
            ]
          : [
              'All files classified. Review the session with devsteps_docs_bom_status (session_id, token), then finalise with devsteps_docs_bom_commit.',
            ],
    };
  }

  // Record decision
  const entry: ClassifiedEntry = {
    path: filePath,
    decision,
    diataxis_type: diataxisType,
    scores: {
      tutorial: 0,
      'how-to': 0,
      reference: 0,
      explanation: 0,
      architecture: 0,
      research: 0,
    },
    mixed: false,
    splits,
  };
  session.classified.push(entry);

  // Remove from pending
  session.pending = session.pending.filter((p) => p !== filePath);

  // Update status
  if (session.pending.length === 0) {
    session.status = 'review';
  }

  await writeSession(devstepsDir, session);

  const nextSteps: string[] = [];
  if (session.pending.length > 0) {
    nextSteps.push(
      `${session.pending.length} file(s) remaining. Continue with devsteps_docs_classify for the next file: ${session.pending[0]} — use the same session_id and token.`
    );
  } else {
    nextSteps.push(
      'All files classified. Review the session with devsteps_docs_bom_status (session_id, token), then finalise with devsteps_docs_bom_commit.'
    );
  }

  return {
    success: true,
    path: filePath,
    decision,
    pending_count: session.pending.length,
    classified_count: session.classified.length,
    next_steps: nextSteps,
  };
}
