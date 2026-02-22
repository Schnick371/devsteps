import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  AnalysisBriefingSchema,
  CompressedVerdictSchema,
  SprintVerdictSchema,
} from '@schnick371/devsteps-shared';
import type { ZodIssue } from 'zod';
import { getWorkspacePath } from '../workspace.js';

/**
 * Context Budget Protocol (CBP) — MCP Tool Handlers
 *
 * These tools allow aspect agents to persist analysis briefings to disk
 * and the coordinator to read compressed envelopes without loading full reports.
 *
 * Atomic write pattern: write to .tmp file, then rename — prevents stale reads.
 *
 * @see EPIC-027 Context Budget Protocol Infrastructure
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAnalysisDir(taskId: string): string {
  const workspaceRoot = getWorkspacePath();
  return join(workspaceRoot, '.devsteps', 'analysis', taskId);
}

function getSprintDir(sprintDate: string): string {
  const workspaceRoot = getWorkspacePath();
  return join(workspaceRoot, '.devsteps', 'analysis', `sprint-${sprintDate}`);
}

function atomicWriteJson(filePath: string, data: unknown): void {
  const tmpPath = `${filePath}.tmp`;
  writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  renameSync(tmpPath, filePath);
}

// ─── write_analysis_report ───────────────────────────────────────────────────

/**
 * Write a structured AnalysisBriefing JSON to `.devsteps/analysis/[taskId]/[aspect]-report.json`
 * Called by aspect agent subagents after completing their analysis.
 */
export async function handleWriteAnalysisReport(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const parsed = AnalysisBriefingSchema.safeParse(args.briefing);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i: ZodIssue) => `${i.path.join('.')}: ${i.message}`)
      .join(', ');
    throw new Error(`Invalid AnalysisBriefing: ${issues}`);
  }

  const briefing = parsed.data;
  const analysisDir = getAnalysisDir(briefing.task_id);
  mkdirSync(analysisDir, { recursive: true });

  const fileName = `${briefing.aspect}-report.json`;
  const filePath = join(analysisDir, fileName);
  atomicWriteJson(filePath, briefing);

  const relativePath = `.devsteps/analysis/${briefing.task_id}/${fileName}`;
  return {
    content: [
      {
        type: 'text',
        text: `Analysis briefing written: ${relativePath}\nAspect: ${briefing.aspect} | Verdict: ${briefing.envelope.verdict} | Confidence: ${briefing.envelope.confidence}`,
      },
    ],
  };
}

// ─── read_analysis_envelope ──────────────────────────────────────────────────

/**
 * Read the CompressedVerdict envelope from an analysis report.
 * Returns only the ~150-token envelope — never the full report body.
 * Called by the coordinator after dispatching aspect agents.
 */
export async function handleReadAnalysisEnvelope(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const taskId = args.task_id as string;
  const aspect = args.aspect as string;

  if (!taskId || !aspect) {
    throw new Error('task_id and aspect are required');
  }

  const filePath = join(getAnalysisDir(taskId), `${aspect}-report.json`);
  if (!existsSync(filePath)) {
    throw new Error(
      `Analysis report not found: .devsteps/analysis/${taskId}/${aspect}-report.json`
    );
  }

  const raw = JSON.parse(readFileSync(filePath, 'utf-8'));
  const briefing = AnalysisBriefingSchema.parse(raw);

  // Extract only the envelope — coordinator never reads the full report body
  const envelopeParsed = CompressedVerdictSchema.parse(briefing.envelope);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(envelopeParsed, null, 2),
      },
    ],
  };
}

// ─── write_verdict ───────────────────────────────────────────────────────────

/**
 * Write the coordinator's competitive mode meta.json verdict.
 * Called by the coordinator judge after comparing analyst-internal vs analyst-web.
 * Path: `.devsteps/analysis/[taskId]/meta.json`
 */
export async function handleWriteVerdict(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const parsed = SprintVerdictSchema.safeParse(args.verdict);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i: ZodIssue) => `${i.path.join('.')}: ${i.message}`)
      .join(', ');
    throw new Error(`Invalid SprintVerdict: ${issues}`);
  }

  const verdict = parsed.data;
  const analysisDir = getAnalysisDir(verdict.task_id);
  mkdirSync(analysisDir, { recursive: true });

  const filePath = join(analysisDir, 'meta.json');
  atomicWriteJson(filePath, verdict);

  return {
    content: [
      {
        type: 'text',
        text: `Competitive verdict written: .devsteps/analysis/${verdict.task_id}/meta.json\nWinner: ${verdict.winner} | Rule: ${verdict.rule_applied}\nImplementation briefing: ${verdict.implementation_briefing}`,
      },
    ],
  };
}

// ─── write_sprint_brief ──────────────────────────────────────────────────────

/**
 * Write the Enriched Sprint Brief produced by devsteps-planner at sprint start.
 * Path: `.devsteps/analysis/sprint-[DATE]/enriched-sprint-brief.json`
 */
export async function handleWriteSprintBrief(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const sprintDate = args.sprint_date as string;
  const brief = args.brief as Record<string, unknown>;

  if (!sprintDate || !brief) {
    throw new Error('sprint_date and brief are required');
  }

  const sprintDir = getSprintDir(sprintDate);
  mkdirSync(sprintDir, { recursive: true });

  const filePath = join(sprintDir, 'enriched-sprint-brief.json');
  atomicWriteJson(filePath, { ...brief, sprint_date: sprintDate });

  return {
    content: [
      {
        type: 'text',
        text: `Sprint brief written: .devsteps/analysis/sprint-${sprintDate}/enriched-sprint-brief.json`,
      },
    ],
  };
}
