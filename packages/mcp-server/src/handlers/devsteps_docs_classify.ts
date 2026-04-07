/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP handler: devsteps_docs_classify
 * Classify a single file using heuristicClassify. Returns ScoreVector + signals.
 *
 * @see STORY-238 SPIKE-044
 */

import { join } from 'node:path';
import { heuristicClassify, validateSession, writeSession } from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

export default async function devstepsDocsClassifyHandler(args: Record<string, unknown>) {
  const workspaceRoot = getWorkspacePath();
  const devstepsDir = join(workspaceRoot, '.devsteps');
  const filePath = args.path as string;
  const excerpt = args.excerpt as string;
  const sessionId = args.session_id as string;
  const token = args.token as string;

  const validation = await validateSession(devstepsDir, sessionId, token);
  if ('error' in validation) {
    return { success: false, error: validation.error };
  }
  const session = validation.session;

  // Verify path is in session files
  if (!session.files.some((f) => f.path === filePath)) {
    return {
      success: false,
      error: `Path ${filePath} was not part of this import session.`,
    };
  }

  // Classify
  const result = heuristicClassify(excerpt, filePath);
  const { scores, winner, confidence, mixed, secondType } = result;

  // Build signals list
  const signals: string[] = [];
  if (scores[winner] > 0)
    signals.push(`Primary: ${winner} (${(scores[winner] * 100).toFixed(0)}%)`);
  if (secondType && mixed) {
    signals.push(
      `Runner-up: ${secondType} (${(scores[secondType as keyof typeof scores] * 100).toFixed(0)}%)`
    );
  }

  // Suggest splits for mixed documents
  const suggestedSplits =
    mixed && secondType
      ? [
          {
            new_path: filePath.replace('.md', `-${winner}.md`),
            sections: [`Sections matching ${winner} pattern`],
            diataxis_type: winner,
            rationale: `Primary content is ${winner}`,
          },
          {
            new_path: filePath.replace('.md', `-${secondType}.md`),
            sections: [`Sections matching ${secondType} pattern`],
            diataxis_type: secondType,
            rationale: `Secondary content is ${secondType}`,
          },
        ]
      : undefined;

  // Update session status
  if (session.status === 'open') {
    session.status = 'classifying';
    await writeSession(devstepsDir, session);
  }

  const requiresDecision = mixed;

  const nextSteps: string[] = [];
  if (mixed) {
    nextSteps.push(
      `This file is mixed-type (winner: ${winner}, runner-up: ${secondType} at ${confidence}). Present the user with this choice: (A) Accept as ${winner} — ignore mixed signal. (B) Split into ${suggestedSplits?.length ?? 2} files per suggested_splits. (C) Skip this file. (D) Mark for full rewrite. Then call devsteps_docs_classify_confirm with your decision.`
    );
  } else {
    nextSteps.push(
      `Classification clear: ${winner} (${confidence}). Call devsteps_docs_classify_confirm with decision='accept' and diataxis_type='${winner}'.`
    );
  }

  return {
    success: true,
    path: filePath,
    scores,
    winner,
    mixed,
    signals,
    suggested_splits: suggestedSplits,
    requires_decision: requiresDecision,
    next_steps: nextSteps,
  };
}
