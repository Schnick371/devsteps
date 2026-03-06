/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * CI Validation Suite: .github/agents/ frontmatter integrity
 *
 * Validates that all devsteps-*.agent.md files satisfy the Spider Web Dispatch
 * protocol requirements:
 *   - Required YAML frontmatter fields present (description, model, tools)
 *   - user-invokable / user-invocable field present on every file
 *   - R0 coordinator files are user-invokable: true; all others are false
 *   - No file exceeds 150 lines (Copilot-Files-Standards-Specification limit)
 *
 * @see .github/instructions/Copilot-Files-Standards-Specification.instructions.md
 * @see TASK-350
 */

import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(__dirname, '../../..');
const agentsDir = join(workspaceRoot, '.github', 'agents');

/**
 * Agents that are user-invokable (true).
 * Includes R0 coordinators and special entry-point agents.
 */
const USER_INVOKABLE_AGENTS = new Set([
  'devsteps-R0-coord.agent.md',
  'devsteps-R0-coord-sprint.agent.md',
  'devsteps-R0-coord-ishikawa.agent.md',
  'devsteps-R0-coord-solo.agent.md',
  'devsteps-backlog-curator.agent.md',
]);

interface Frontmatter {
  description?: string;
  model?: string;
  tools?: string;
  'user-invokable'?: string;
  'user-invocable'?: string;
}

/**
 * Parse YAML frontmatter from a markdown file.
 * Only extracts scalar string values — sufficient for agent file validation.
 */
function parseFrontmatter(content: string): Frontmatter {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yaml = match[1];
  const result: Frontmatter = {};

  // Extract simple key: value pairs (handles quoted and unquoted values)
  const scalarRe = /^([\w-]+):\s*(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = scalarRe.exec(yaml)) !== null) {
    const key = m[1] as keyof Frontmatter;
    const value = m[2].replace(/^["']|["']$/g, '').trim();
    (result as Record<string, string>)[key] = value;
  }

  return result;
}

function getAgentFiles(): string[] {
  return readdirSync(agentsDir)
    .filter((f) => f.startsWith('devsteps-') && f.endsWith('.agent.md'))
    .sort();
}

describe('agent file frontmatter', () => {
  const files = getAgentFiles();

  it('finds at least 30 agent files', () => {
    expect(files.length).toBeGreaterThanOrEqual(30);
  });

  for (const filename of files) {
    const filePath = join(agentsDir, filename);
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const fm = parseFrontmatter(content);
    const isCoord = USER_INVOKABLE_AGENTS.has(filename);

    describe(filename, () => {
      it('has description field', () => {
        expect(fm.description, 'description required').toBeTruthy();
      });

      it('has model field', () => {
        expect(fm.model, 'model required').toBeTruthy();
      });

      it('has tools field', () => {
        expect(fm.tools, 'tools required').toBeTruthy();
      });

      it('has user-invokable or user-invocable field', () => {
        const hasField = 'user-invokable' in fm || 'user-invocable' in fm;
        expect(hasField, 'user-invokable/user-invocable required').toBe(true);
      });

      it(`user-invokable/invocable = ${isCoord ? 'true' : 'false'} for ${isCoord ? 'coordinator' : 'leaf'} agent`, () => {
        const value = fm['user-invokable'] ?? fm['user-invocable'];
        const expectedBool = isCoord;
        expect(value === 'true', `expected ${expectedBool} for ${filename}`).toBe(expectedBool);
      });

      it('does not exceed 150 lines', () => {
        expect(lines.length, `${filename} exceeds 150 lines (${lines.length})`).toBeLessThanOrEqual(150);
      });
    });
  }
});
