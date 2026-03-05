/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP handlers: CBP Tier-2 mandate operations
 * write_mandate_result, read_mandate_results, write_rejection_feedback,
 * write_iteration_signal, write_escalation
 *
 * @see EPIC-028 CBP Tier-2 Mandate Tools
 */

import { randomUUID } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import {
  CBP_LOOP,
  DispatchManifestSchema,
  EscalationSignalSchema,
  IterationSignalSchema,
  ReadMandateResultSchema,
  RejectionFeedbackSchema,
  WriteMandateResultSchema,
} from '@schnick371/devsteps-shared';
import type { ZodIssue } from 'zod';
import { createDispatchLogger } from '../logger.js';
import { getWorkspacePath } from '../workspace.js';

/**
 * Context Budget Protocol (CBP) — Tier-2 Mandate Tool Handlers
 *
 * These tools enable structured Tier-1 ↔ Tier-2 communication and loop control.
 * Tier-2 Deep Analysts write MandateResults; Tier-1 reads them via read_mandate_results.
 * Loop control tools (rejection_feedback, iteration_signal, escalation) support
 * bounded Review-Fix, TDD, and Clarification loops.
 *
 * Atomic write pattern: write to .tmp file, then rename — prevents stale reads.
 *
 * @see EPIC-028 N-Tier Agent Hierarchy
 * @see STORY-108 MandateResult CBP Extension
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCbpDir(sprintId: string): string {
  const workspaceRoot = getWorkspacePath();
  return join(workspaceRoot, '.devsteps', 'cbp', sprintId);
}

function getEscalationDir(sprintId: string): string {
  return join(getCbpDir(sprintId), 'escalations');
}

function atomicWriteJson(filePath: string, data: unknown): void {
  const dir = filePath.substring(0, filePath.lastIndexOf('/'));
  mkdirSync(dir, { recursive: true });
  const tmpPath = `${filePath}.tmp`;
  writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  renameSync(tmpPath, filePath);
}

// ─── write_mandate_result ─────────────────────────────────────────────────────

/**
 * Write a validated MandateResult to .devsteps/cbp/[sprint_id]/[mandate_id].result.json
 * Called by Tier-2 Deep Analysts after synthesizing all T3 sub-question answers.
 * Tier-1 reads via read_mandate_results().
 */
export async function handleWriteMandateResult(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const parsed = WriteMandateResultSchema.safeParse(args.mandate_result);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i: ZodIssue) => `${i.path.join('.')}: ${i.message}`)
      .join(', ');
    throw new Error(`Invalid MandateResult: ${issues}`);
  }

  const result = parsed.data;
  const cbpDir = getCbpDir(result.sprint_id);
  const filePath = join(cbpDir, `${result.mandate_id}.result.json`);
  atomicWriteJson(filePath, result);

  const relativePath = `.devsteps/cbp/${result.sprint_id}/${result.mandate_id}.result.json`;
  return {
    content: [
      {
        type: 'text',
        text: [
          `MandateResult written: ${relativePath}`,
          `Analyst: ${result.analyst} | Status: ${result.status} | Confidence: ${result.confidence}`,
          `Items: ${result.item_ids.join(', ')} | Recommendations: ${result.recommendations.length}`,
        ].join('\n'),
      },
    ],
  };
}

// ─── read_mandate_results ─────────────────────────────────────────────────────

/**
 * Read all MandateResult files for a sprint_id.
 * Called by Tier-1 after dispatching Tier-2 analysts.
 * Returns an array of MandateResult objects sorted by completed_at.
 */
export async function handleReadMandateResults(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const sprintId = args.sprint_id as string;
  const mandateIds = args.mandate_ids as string[] | undefined;
  const statusFilter = (args.status_filter as string) || 'all';
  const expectedAgentNames = args.expected_agent_names as string[] | undefined;
  const dispatchId = args.dispatch_id as string | undefined;
  const log = createDispatchLogger(dispatchId);

  if (!sprintId) {
    throw new Error('sprint_id is required');
  }

  log.debug(
    { sprint_id: sprintId, expected_agent_names: expectedAgentNames },
    'read_mandate_results invoked'
  );

  const cbpDir = getCbpDir(sprintId);
  if (!existsSync(cbpDir)) {
    const emptyEnvelope = buildEnvelope([], expectedAgentNames);
    return {
      content: [{ type: 'text', text: JSON.stringify(emptyEnvelope, null, 2) }],
    };
  }

  const files = readdirSync(cbpDir).filter((f) => f.endsWith('.result.json'));
  const results: unknown[] = [];

  for (const file of files) {
    const mandateId = file.replace('.result.json', '');

    // Apply mandate_ids filter if provided
    if (mandateIds && !mandateIds.includes(mandateId)) {
      continue;
    }

    const filePath = join(cbpDir, file);
    try {
      const raw = JSON.parse(readFileSync(filePath, 'utf-8'));
      const parsed = ReadMandateResultSchema.safeParse(raw);
      if (!parsed.success) continue; // Skip corrupted files

      // Apply status filter
      if (statusFilter !== 'all' && parsed.data.status !== statusFilter) {
        continue;
      }

      results.push(parsed.data);
    } catch {
      // Skip unreadable files
    }
  }

  // Sort by completed_at ascending
  (results as Array<{ completed_at: string }>).sort(
    (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
  );

  const envelope = buildEnvelope(results as Array<{ analyst: string }>, expectedAgentNames);
  log.debug(
    { count: envelope.count, quorum_ok: envelope.quorum_ok, missing: envelope.missing_analysts },
    'read_mandate_results complete'
  );

  return {
    content: [{ type: 'text', text: JSON.stringify(envelope, null, 2) }],
  };
}

// ─── Quorum helpers ───────────────────────────────────────────────────────────

function buildEnvelope(
  results: Array<{ analyst: string }>,
  expectedAgentNames?: string[]
): {
  results: Array<{ analyst: string }>;
  count: number;
  quorum_ok: boolean | undefined;
  missing_analysts: string[] | undefined;
  dispatched: number | undefined;
  received: number;
  threshold: number | undefined;
  status: 'quorum_met' | 'quorum_failed' | undefined;
} {
  const received = results.length;
  if (!expectedAgentNames) {
    return {
      results,
      count: received,
      quorum_ok: undefined,
      missing_analysts: undefined,
      dispatched: undefined,
      received,
      threshold: undefined,
      status: undefined,
    };
  }
  const receivedAgents = results.map((r) => r.analyst);
  const missing_analysts = expectedAgentNames.filter((n) => !receivedAgents.includes(n));
  const quorum_ok = missing_analysts.length === 0;
  return {
    results,
    count: received,
    quorum_ok,
    missing_analysts,
    dispatched: expectedAgentNames.length,
    received,
    threshold: expectedAgentNames.length,
    status: quorum_ok ? 'quorum_met' : 'quorum_failed',
  };
}

// ─── write_rejection_feedback ─────────────────────────────────────────────────

/**
 * Write structured rejection feedback from Tier-2 quality gate to disk.
 * Tier-1 reads this and re-dispatches the Tier-3 impl agent with rejection context.
 * Files are append-only: .devsteps/cbp/[sprint_id]/[item_id].rejection-[iteration].json
 *
 * Hard limit: iteration must be <= CBP_LOOP.MAX_REVIEW_FIX_ITERATIONS
 */
export async function handleWriteRejectionFeedback(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const parsed = RejectionFeedbackSchema.safeParse(args.rejection);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i: ZodIssue) => `${i.path.join('.')}: ${i.message}`)
      .join(', ');
    throw new Error(`Invalid RejectionFeedback: ${issues}`);
  }

  const rejection = parsed.data;

  // Enforce hard iteration bound
  if (rejection.iteration > CBP_LOOP.MAX_REVIEW_FIX_ITERATIONS) {
    throw new Error(
      `Iteration ${rejection.iteration} exceeds max review-fix iterations (${CBP_LOOP.MAX_REVIEW_FIX_ITERATIONS}). ` +
        `Call write_escalation instead.`
    );
  }

  const cbpDir = getCbpDir(rejection.sprint_id);
  const fileName = `${rejection.item_id}.rejection-${rejection.iteration}.json`;
  const filePath = join(cbpDir, fileName);
  atomicWriteJson(filePath, rejection);

  const relativePath = `.devsteps/cbp/${rejection.sprint_id}/${fileName}`;
  return {
    content: [
      {
        type: 'text',
        text: [
          `Rejection feedback written: ${relativePath}`,
          `Target: ${rejection.target_subagent} | Type: ${rejection.rejection_type}`,
          `Iteration: ${rejection.iteration} | Remaining: ${rejection.max_iterations_remaining}`,
          `Issues: ${rejection.specific_issues.length} | Criteria violated: ${rejection.violated_criteria.length}`,
        ].join('\n'),
      },
    ],
  };
}

// ─── write_iteration_signal ───────────────────────────────────────────────────

/**
 * Write the current loop state for Tier-1 to read before each iteration.
 * OVERWRITES previous signal — represents CURRENT state (last-write-wins).
 * Storage: .devsteps/cbp/[sprint_id]/[item_id].loop-signal.json
 *
 * Hard limit: iteration must be <= max_iterations AND max_iterations <= CBP_LOOP.MAX_TDD_ITERATIONS
 */
export async function handleWriteIterationSignal(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const parsed = IterationSignalSchema.safeParse(args.signal);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i: ZodIssue) => `${i.path.join('.')}: ${i.message}`)
      .join(', ');
    throw new Error(`Invalid IterationSignal: ${issues}`);
  }

  const signal = parsed.data;

  // Enforce global max bound across loop types
  const absoluteMax = Math.max(
    CBP_LOOP.MAX_REVIEW_FIX_ITERATIONS,
    CBP_LOOP.MAX_TDD_ITERATIONS,
    CBP_LOOP.MAX_CLARIFICATION_ROUNDS
  );
  if (signal.max_iterations > absoluteMax) {
    throw new Error(
      `max_iterations ${signal.max_iterations} exceeds absolute maximum (${absoluteMax}). ` +
        `Check CBP_LOOP constants in @schnick371/devsteps-shared.`
    );
  }

  const cbpDir = getCbpDir(signal.sprint_id);
  const fileName = `${signal.item_id}.loop-signal.json`;
  const filePath = join(cbpDir, fileName);
  // Intentional overwrite — Tier-1 reads the CURRENT state
  atomicWriteJson(filePath, signal);

  const relativePath = `.devsteps/cbp/${signal.sprint_id}/${fileName}`;
  return {
    content: [
      {
        type: 'text',
        text: [
          `Iteration signal written: ${relativePath}`,
          `Loop: ${signal.loop_type} | Status: ${signal.status}`,
          `Iteration: ${signal.iteration}/${signal.max_iterations}`,
        ].join('\n'),
      },
    ],
  };
}

// ─── write_dispatch_manifest ─────────────────────────────────────────────────

/**
 * Write a new DispatchManifest at coord fan-out time.
 * All dispatch entries are written with status='pending'.
 * Patched later by patch_dispatch_manifest as MandateResults arrive.
 *
 * UUID-named file: dispatch-manifest-{dispatch_id}.json (no race conditions).
 * Storage: .devsteps/cbp/[sprint_id]/dispatch-manifest-[dispatch_id].json
 *
 * @see TASK-331 Dispatch Manifest per sprint run
 */
export async function handleWriteDispatchManifest(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const parsed = DispatchManifestSchema.safeParse(args);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i: ZodIssue) => `${i.path.join('.')}: ${i.message}`)
      .join(', ');
    throw new Error(`Invalid DispatchManifest: ${issues}`);
  }

  const manifest = parsed.data;
  const cbpDir = getCbpDir(manifest.sprint_id);
  const fileName = `dispatch-manifest-${manifest.dispatch_id}.json`;
  const filePath = join(cbpDir, fileName);
  atomicWriteJson(filePath, manifest);

  const relativePath = `.devsteps/cbp/${manifest.sprint_id}/${fileName}`;
  return {
    content: [
      {
        type: 'text',
        text: [
          `DispatchManifest written: ${relativePath}`,
          `Dispatch ID: ${manifest.dispatch_id} | Sprint: ${manifest.sprint_id}`,
          `Tier: ${manifest.triage_tier} | Agents: ${manifest.dispatches.length}`,
        ].join('\n'),
      },
    ],
  };
}

// ─── patch_dispatch_manifest ──────────────────────────────────────────────────

/**
 * Patch a single dispatch entry in an existing DispatchManifest.
 * Called by coord when a MandateResult arrives — updates completed_at,
 * duration_ms, status, confidence, and output_tokens_approx.
 *
 * Reads manifest from disk, merges patch into the matching entry (by mandate_id),
 * and rewrites atomically.
 *
 * @see TASK-331 Dispatch Manifest per sprint run
 */
export async function handlePatchDispatchManifest(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const manifestPath = args.manifest_path as string | undefined;
  const mandateId = args.mandate_id as string | undefined;
  const completedAt = args.completed_at as string | undefined;
  const durationMs = args.duration_ms as number | undefined | null;
  const status = args.status as 'complete' | 'failed' | 'timeout' | undefined;
  const confidence = args.confidence as number | undefined | null;
  const outputTokensApprox = args.output_tokens_approx as number | undefined | null;

  if (!manifestPath) throw new Error('manifest_path is required');
  if (!mandateId) throw new Error('mandate_id is required');
  if (!status) throw new Error('status is required');

  const workspaceRoot = getWorkspacePath();
  const absolutePath = manifestPath.startsWith('/')
    ? manifestPath
    : join(workspaceRoot, manifestPath);

  if (!existsSync(absolutePath)) {
    throw new Error(`DispatchManifest not found: ${manifestPath}`);
  }

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(absolutePath, 'utf-8'));
  } catch {
    throw new Error(`Failed to read DispatchManifest: ${manifestPath}`);
  }

  const parsed = DispatchManifestSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i: ZodIssue) => `${i.path.join('.')}: ${i.message}`)
      .join(', ');
    throw new Error(`Corrupt DispatchManifest at ${manifestPath}: ${issues}`);
  }

  const manifest = parsed.data;
  const entryIndex = manifest.dispatches.findIndex((d) => d.mandate_id === mandateId);
  if (entryIndex === -1) {
    throw new Error(`mandate_id ${mandateId} not found in manifest ${manifestPath}`);
  }

  manifest.dispatches[entryIndex] = {
    ...manifest.dispatches[entryIndex],
    status,
    completed_at: completedAt ?? null,
    duration_ms: durationMs ?? null,
    confidence: confidence ?? null,
    output_tokens_approx: outputTokensApprox ?? null,
  };

  atomicWriteJson(absolutePath, manifest);

  return {
    content: [
      {
        type: 'text',
        text: [
          `DispatchManifest patched: ${manifestPath}`,
          `Entry: ${mandateId} | Status: ${status}`,
          `Duration: ${durationMs ?? 'n/a'} ms | Confidence: ${confidence ?? 'n/a'}`,
        ].join('\n'),
      },
    ],
  };
}

// ─── write_escalation ─────────────────────────────────────────────────────────

/**
 * Write an escalation signal when an agent cannot proceed without external input.
 * Tier-1 checks for pending escalations before each phase.
 * Escalations PAUSE execution — Tier-1 must surface to user before continuing.
 * Storage: .devsteps/cbp/[sprint_id]/escalations/[escalation_id].json
 */
export async function handleWriteEscalation(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  // Generate escalation_id if not provided
  const escalationId = (args.escalation_id as string) || randomUUID();
  const inputData = { escalation_id: escalationId, ...args };

  const parsed = EscalationSignalSchema.safeParse(inputData);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i: ZodIssue) => `${i.path.join('.')}: ${i.message}`)
      .join(', ');
    throw new Error(`Invalid EscalationSignal: ${issues}`);
  }

  const escalation = parsed.data;
  const escalationDir = getEscalationDir(escalation.sprint_id);
  const filePath = join(escalationDir, `${escalation.escalation_id}.json`);

  // Check for duplicate escalation_id to prevent overwrites
  if (existsSync(filePath)) {
    throw new Error(`Escalation ${escalation.escalation_id} already exists. Use a new UUID.`);
  }

  atomicWriteJson(filePath, escalation);

  const relativePath = `.devsteps/cbp/${escalation.sprint_id}/escalations/${escalation.escalation_id}.json`;
  return {
    content: [
      {
        type: 'text',
        text: [
          `Escalation written: ${relativePath}`,
          `ID: ${escalation.escalation_id}`,
          `Source: ${escalation.source_agent} | Type: ${escalation.escalation_type}`,
          `Blocking: ${escalation.blocking_items.join(', ')}`,
          `Decision needed: ${escalation.decision_needed}`,
        ].join('\n'),
      },
    ],
  };
}
