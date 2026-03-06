## Task

Expose the `updateCopilotFiles()` shared utility as a registered MCP tool.

## New Handler: `packages/mcp-server/src/handlers/update-copilot-files.ts`

Mirror pattern of [init.ts](packages/mcp-server/src/handlers/init.ts):
```typescript
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { updateCopilotFiles } from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

const __filename = fileURLToPath(import.meta.url);
const packageRoot = join(dirname(__filename), '..', '..');
const sourceGithubDir = join(packageRoot, '.github');

export default async function updateCopilotFilesHandler(args: {
  scope?: string[];
  dry_run?: boolean;
  force?: boolean;
  backup?: boolean;
  project_path?: string;
}): Promise<{ success: boolean; result?: UpdateCopilotFilesResult; error?: string }>
```

Dynamic dispatch in `server.ts` resolves `handlers/${toolName}.js` automatically — **no change to server.ts needed**.

## Modify `packages/mcp-server/src/tools/system.ts`

Add tool definition:
```typescript
export const updateCopilotFilesTool: Tool = {
  name: 'update_copilot_files',
  description:
    'Update DevSteps .github Copilot files (agents, instructions, prompts) to the version ' +
    'bundled with the currently installed devsteps package. Detects user-modified files ' +
    '(via hash comparison) and skips them by default. Creates a timestamped backup at ' +
    '.devsteps/backups/github-<timestamp>/ before overwriting. Use dry_run=true to preview.',
  inputSchema: {
    type: 'object',
    properties: {
      scope: {
        type: 'array',
        items: { type: 'string', enum: ['agents', 'instructions', 'prompts'] },
        description: 'Which file groups to update. Default: all.',
        default: ['agents', 'instructions', 'prompts'],
      },
      dry_run: { type: 'boolean', description: 'Preview without writing. Default: false.', default: false },
      force: { type: 'boolean', description: 'Overwrite user-modified files. Default: false.', default: false },
      backup: { type: 'boolean', description: 'Create backup before overwriting. Default: true.', default: true },
      project_path: { type: 'string', description: 'Workspace root path. Default: cwd.' },
    },
    required: [],
  },
};
```

## Modify `packages/mcp-server/src/tools/index.ts`

Add export for `updateCopilotFilesTool`.