/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Project initialization helpers
 * Creates default .devsteps structure, copies GitHub Copilot templates.
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Compute sha256 hex digest of content (UTF-8).
 */
function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Inject (or replace) the devsteps management comment directly after the YAML
 * frontmatter closing `---` line.  The marker is placed in an HTML comment so
 * it is invisible in rendered Markdown and does NOT affect YAML parsing.
 *
 * Format:
 *   <!-- devsteps-managed: true | version: <ver> | hash: sha256:<hex> -->
 *
 * If the file has no frontmatter the comment is prepended to the top.
 */
export function injectDevstepsComment(rawContent: string, hash: string, version: string): string {
  const marker = `<!-- devsteps-managed: true | version: ${version} | hash: sha256:${hash} -->`;
  // Remove old marker if present
  const withoutOld = rawContent.replace(/<!--\s*devsteps-managed:.*?-->\n?/g, '');

  // Find YAML frontmatter (starts and ends with ---)
  const frontmatterEnd = withoutOld.match(/^---\n[\s\S]*?\n---\n/);
  if (frontmatterEnd) {
    const endIdx = (frontmatterEnd.index ?? 0) + frontmatterEnd[0].length;
    return withoutOld.slice(0, endIdx) + marker + '\n' + withoutOld.slice(endIdx);
  }

  // No frontmatter — prepend
  return marker + '\n' + withoutOld;
}

export interface CopiedGithubFiles {
  agents: string[];
  instructions: string[];
  prompts: string[];
}

/**
 * Dynamically copy all devsteps-prefixed agent/instruction/prompt files
 * from a source .github directory into target directories.
 * Creates target directories if they don't exist.
 * Injects a `<!-- devsteps-managed -->` HTML comment after the YAML frontmatter
 * so that the canonical content hash is stored without touching the YAML block.
 * Returns lists of copied filenames for output/reporting.
 */
export function copyGithubFiles(
  sourceGithubDir: string,
  githubAgentsDir: string,
  githubInstructionsDir: string,
  githubPromptsDir: string,
  packageVersion = 'unknown'
): CopiedGithubFiles {
  mkdirSync(githubAgentsDir, { recursive: true });
  mkdirSync(githubInstructionsDir, { recursive: true });
  mkdirSync(githubPromptsDir, { recursive: true });

  const copyDir = (
    sourceDir: string,
    targetDir: string,
    filter: (f: string) => boolean
  ): string[] => {
    if (!existsSync(sourceDir)) return [];
    const files = readdirSync(sourceDir).filter(filter);
    for (const file of files) {
      const rawContent = readFileSync(join(sourceDir, file), 'utf8');
      const hash = sha256(rawContent);
      const annotated = injectDevstepsComment(rawContent, hash, packageVersion);
      writeFileSync(join(targetDir, file), annotated);
    }
    return files;
  };

  return {
    agents: copyDir(
      join(sourceGithubDir, 'agents'),
      githubAgentsDir,
      (f) => f.startsWith('devsteps') && f.endsWith('.agent.md')
    ),
    instructions: copyDir(
      join(sourceGithubDir, 'instructions'),
      githubInstructionsDir,
      (f) => f.startsWith('devsteps') && f.endsWith('.instructions.md')
    ),
    prompts: copyDir(
      join(sourceGithubDir, 'prompts'),
      githubPromptsDir,
      (f) => f.startsWith('devsteps') && f.endsWith('.prompt.md')
    ),
  };
}

/**
 * Copy HIERARCHY.md and AI-GUIDE.md from the package root .devsteps/ dir
 * into the target project's .devsteps/ directory.
 */
export function copyDevstepsDocs(packageRoot: string, devstepsDir: string): void {
  for (const file of ['HIERARCHY.md', 'AI-GUIDE.md']) {
    const source = join(packageRoot, '.devsteps', file);
    if (existsSync(source)) {
      writeFileSync(join(devstepsDir, file), readFileSync(source, 'utf8'));
    }
  }
}

/**
 * Write SETUP.md into the project's .devsteps/ directory.
 * Contains quick-start instructions, command reference, and troubleshooting.
 */
export function writeSetupMd(projectName: string, devstepsDir: string): void {
  const content = `# ${projectName} - Setup Guide

## Prerequisites

- Node.js v18+ (https://nodejs.org)
- Package manager: pnpm (recommended) or npm
- Git (optional, for version control)

## Quick Start

\`\`\`bash
# 1. Install dependencies
pnpm install  # or: npm install

# 2. Verify setup
devsteps doctor

# 3. Check project status
devsteps status

# 4. Add your first item
devsteps add req "Your first requirement"
\`\`\`

## MCP Setup (AI Integration)

\`\`\`bash
# For VS Code or Cursor (auto-detect)
devsteps setup

# Explicit IDE selection
devsteps setup --tool vscode
devsteps setup --tool cursor
\`\`\`

After setup: restart your IDE, then open Copilot/AI Chat.

## Project Structure

\`\`\`
${projectName}/
├── .devsteps/
│   ├── config.json       # Project configuration
│   ├── index/            # Refs-style distributed index
│   ├── items/            # Item files (source of truth)
│   └── archive/          # Archived items
└── .vscode/
    ├── tasks.json        # VS Code tasks
    └── mcp.json          # MCP configuration
\`\`\`

## Common Commands

\`\`\`bash
# Add items
devsteps add story "Implement feature X"
devsteps add bug "Error on page load"

# List & filter
devsteps list --status draft
devsteps list --type story --priority urgent-important

# Update
devsteps update STORY-001 --status in-progress

# Link items
devsteps link TASK-001 implements STORY-005

# Maintenance
devsteps archive STORY-001
devsteps purge --status done
\`\`\`

## Troubleshooting

- **"Project not initialized"** — run \`devsteps init\` in your project directory
- **"Node.js version too old"** — upgrade to v18+ from nodejs.org
- **"MCP server not found"** — run \`devsteps setup\`, then restart your IDE
- **Dependencies missing** — run \`pnpm install\`
`;
  writeFileSync(join(devstepsDir, 'SETUP.md'), content);
}
