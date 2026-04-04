/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Diataxis heuristic classifier — scoring vector approach (ADR-001)
 * Pure function: no filesystem access, operates on text excerpts.
 */

/** Diataxis document types + extensions for DevSteps-specific content */
export type DiataxisType =
  | 'tutorial'
  | 'how-to'
  | 'reference'
  | 'explanation'
  | 'architecture'
  | 'research';

/** Score vector: one [0.0, 1.0] score per type */
export type ScoreVector = Record<DiataxisType, number>;

/** Classification result for a single document */
export interface ClassificationResult {
  scores: ScoreVector;
  winner: DiataxisType;
  confidence: number;
  mixed: boolean;
  secondType?: DiataxisType;
}

/** Default threshold for mixed-type detection */
export const MIXED_THRESHOLD = 0.4;

/** All Diataxis types */
export const DIATAXIS_TYPES: DiataxisType[] = [
  'tutorial',
  'how-to',
  'reference',
  'explanation',
  'architecture',
  'research',
];

function emptyScores(): ScoreVector {
  return { tutorial: 0, 'how-to': 0, reference: 0, explanation: 0, architecture: 0, research: 0 };
}

/**
 * 9-pattern heuristic classifier from SPIKE-043.
 * Returns a score vector (ADR-001: scoring approach, not binary).
 *
 * @param excerpt - First ~100 lines of the document
 * @param filepath - Optional file path for path-based heuristics
 */
export function heuristicClassify(excerpt: string, filepath?: string): ClassificationResult {
  const scores = emptyScores();
  const lower = excerpt.toLowerCase();
  const pathLower = (filepath || '').toLowerCase();

  // --- Path-based signals (strong) ---

  // Architecture: docs/architecture/, ADR files
  if (/\/architecture\/|\/adr[-_]|^adr[-_]/i.test(pathLower)) {
    scores.architecture += 0.6;
  }

  // Research: analyst-*, aspect-*, *-session*, research/
  if (/analyst[-_]|aspect[-_]|[-_]session\d|\/research\//i.test(pathLower)) {
    scores.research += 0.6;
  }

  // --- Content-based signals ---

  // Tutorial: numbered steps + learning outcomes
  if (/step\s+\d|## step/i.test(lower)) scores.tutorial += 0.3;
  if (/you will learn|by the end of|prerequisites/i.test(lower)) scores.tutorial += 0.3;
  if (/let'?s\s+(start|begin|create|build)/i.test(lower)) scores.tutorial += 0.2;

  // How-to: imperative headings, task-oriented
  if (
    /^##\s+(how to|configure|install|set up|create|add|remove|enable|disable|migrate)/im.test(
      excerpt
    )
  ) {
    scores['how-to'] += 0.4;
  }
  if (/quickstart|getting started|setup guide/i.test(lower)) scores['how-to'] += 0.3;

  // Reference: API docs, tables, options
  if (/^##\s+(api|options|parameters|configuration|properties|methods|endpoints)/im.test(excerpt)) {
    scores.reference += 0.4;
  }
  if (/\|.*\|.*\|/m.test(excerpt) && /type|default|required/i.test(lower)) scores.reference += 0.2;
  if (/```(json|yaml|toml)/i.test(lower)) scores.reference += 0.1;

  // Explanation: conceptual, why-oriented
  if (/^##\s+(overview|understanding|why|concepts|background|theory|motivation)/im.test(excerpt)) {
    scores.explanation += 0.4;
  }
  if (/the reason|this is because|the idea behind|in contrast/i.test(lower))
    scores.explanation += 0.2;

  // Architecture: decision records, ADR patterns in content
  if (/^##\s+(status|decision outcome|considered options|context and problem)/im.test(excerpt)) {
    scores.architecture += 0.5;
  }
  if (/^##\s+(decision drivers|consequences)/im.test(excerpt)) scores.architecture += 0.2;

  // Research: analysis, findings, investigation
  if (/^##\s+(findings|analysis|investigation|results|methodology)/im.test(excerpt)) {
    scores.research += 0.4;
  }
  if (/research question|hypothesis|evidence/i.test(lower)) scores.research += 0.2;

  // --- Normalize scores to [0, 1] ---
  const maxRaw = Math.max(...Object.values(scores), 0.001);
  for (const type of DIATAXIS_TYPES) {
    scores[type] = Math.min(scores[type] / maxRaw, 1.0);
  }

  // --- Determine winner and mixed status ---
  const sorted = DIATAXIS_TYPES.map((t) => ({ type: t, score: scores[t] })).sort(
    (a, b) => b.score - a.score
  );

  const winner = sorted[0];
  const second = sorted[1];
  const mixed = second.score >= MIXED_THRESHOLD;

  return {
    scores,
    winner: winner.type,
    confidence: winner.score,
    mixed,
    secondType: mixed ? second.type : undefined,
  };
}
