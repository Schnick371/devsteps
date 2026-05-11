/**
 * Unit Tests for analysis.ts handlers — scope_shard sharding behavior
 *
 * @see STORY-294 scope_shard for write_analysis_report
 */

import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { handleReadAnalysisEnvelope, handleWriteAnalysisReport } from './analysis.js';

let tmpDir: string;
let originalCwd: string;

function buildBriefing(overrides: Record<string, unknown> = {}) {
  return {
    task_id: 'STORY-294',
    aspect: 'impact',
    analyst: 'devsteps-R2-aspect-impact',
    created: '2026-05-11T10:00:00.000Z',
    envelope: {
      aspect: 'impact',
      verdict: 'PROCEED',
      confidence: 0.9,
      top3_findings: ['finding-1'],
      report_path: '.devsteps/analysis/STORY-294/impact-report.json',
      timestamp: '2026-05-11T10:00:00.000Z',
    },
    full_analysis: '## Test\nBody',
    affected_files: [],
    recommendations: [],
    ...overrides,
  };
}

beforeEach(() => {
  originalCwd = process.cwd();
  tmpDir = mkdtempSync(join(tmpdir(), 'devsteps-analysis-test-'));
  process.chdir(tmpDir);
  process.env.DEVSTEPS_WORKSPACE = tmpDir;
});

afterEach(() => {
  process.chdir(originalCwd);
  delete process.env.DEVSTEPS_WORKSPACE;
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('handleWriteAnalysisReport — scope_shard', () => {
  it('writes to aspect-report.json when scope_shard absent (backward compat)', async () => {
    const briefing = buildBriefing();
    const result = await handleWriteAnalysisReport({ briefing });

    const expectedPath = join(tmpDir, '.devsteps/analysis/STORY-294/impact-report.json');
    expect(existsSync(expectedPath)).toBe(true);
    expect(result.content[0].text).toContain('impact-report.json');
    expect(result.content[0].text).not.toContain('-shard');
  });

  it('writes to aspect-shard-report.json when scope_shard present', async () => {
    const briefing = buildBriefing({ scope_shard: 'packages-shared' });
    const result = await handleWriteAnalysisReport({ briefing });

    const expectedPath = join(
      tmpDir,
      '.devsteps/analysis/STORY-294/impact-packages-shared-report.json'
    );
    expect(existsSync(expectedPath)).toBe(true);
    expect(result.content[0].text).toContain('impact-packages-shared-report.json');

    const fileContents = JSON.parse(readFileSync(expectedPath, 'utf-8'));
    expect(fileContents.scope_shard).toBe('packages-shared');
  });

  it('does not collide when two sharded writes use different shards', async () => {
    await handleWriteAnalysisReport({ briefing: buildBriefing({ scope_shard: 'pkg-a' }) });
    await handleWriteAnalysisReport({ briefing: buildBriefing({ scope_shard: 'pkg-b' }) });

    const dir = join(tmpDir, '.devsteps/analysis/STORY-294');
    expect(existsSync(join(dir, 'impact-pkg-a-report.json'))).toBe(true);
    expect(existsSync(join(dir, 'impact-pkg-b-report.json'))).toBe(true);
  });

  it('rejects briefing with invalid scope_shard chars', async () => {
    const briefing = buildBriefing({ scope_shard: 'pkg/sub' });
    await expect(handleWriteAnalysisReport({ briefing })).rejects.toThrow(/scope_shard/);
  });
});

describe('handleReadAnalysisEnvelope — scope_shard', () => {
  it('reads non-sharded path when scope_shard absent (backward compat)', async () => {
    await handleWriteAnalysisReport({ briefing: buildBriefing() });

    const result = await handleReadAnalysisEnvelope({
      task_id: 'STORY-294',
      aspect: 'impact',
    });
    const env = JSON.parse(result.content[0].text);
    expect(env.verdict).toBe('PROCEED');
  });

  it('reads sharded path when scope_shard supplied', async () => {
    await handleWriteAnalysisReport({
      briefing: buildBriefing({ scope_shard: 'packages-shared' }),
    });

    const result = await handleReadAnalysisEnvelope({
      task_id: 'STORY-294',
      aspect: 'impact',
      scope_shard: 'packages-shared',
    });
    const env = JSON.parse(result.content[0].text);
    expect(env.verdict).toBe('PROCEED');
  });

  it('throws when sharded report missing', async () => {
    await expect(
      handleReadAnalysisEnvelope({
        task_id: 'STORY-294',
        aspect: 'impact',
        scope_shard: 'missing',
      })
    ).rejects.toThrow(/not found.*impact-missing-report/);
  });

  it('rejects invalid scope_shard format', async () => {
    await expect(
      handleReadAnalysisEnvelope({
        task_id: 'STORY-294',
        aspect: 'impact',
        scope_shard: 'pkg/sub',
      })
    ).rejects.toThrow(/scope_shard/);
  });
});
