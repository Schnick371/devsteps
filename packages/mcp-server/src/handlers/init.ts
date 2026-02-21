import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  copyDevstepsDocs,
  copyGithubFiles,
  type DevStepsConfig,
  getCurrentTimestamp,
  getMethodologyConfig,
  initializeRefsStyleIndex,
  type Methodology,
  writeSetupMd,
} from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = join(__dirname, '..', '..');
const packageJson = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')) as {
  version: string;
};

/**
 * Initialize a new devsteps project
 */
export default async function initHandler(args: {
  project_name: string;
  path?: string;
  author?: string;
  git_integration?: boolean;
  methodology?: Methodology;
}) {
  try {
    const projectPath = args.path || getWorkspacePath();
    const devstepsDir = join(projectPath, '.devsteps');
    const methodology = args.methodology || 'scrum';

    // Check if already initialized
    if (existsSync(devstepsDir)) {
      throw new Error('Project already initialized. Use devsteps-status to view project info.');
    }

    // Get methodology configuration
    const methodologyConfig = getMethodologyConfig(methodology);

    // Create directory structure
    mkdirSync(devstepsDir, { recursive: true });
    for (const dir of methodologyConfig.directories) {
      mkdirSync(join(devstepsDir, dir), { recursive: true });
    }

    // Create Context Budget Protocol analysis directory with gitignore
    const analysisDir = join(devstepsDir, 'analysis');
    mkdirSync(analysisDir, { recursive: true });
    writeFileSync(
      join(analysisDir, '.gitignore'),
      '# Analysis envelopes are ephemeral — not versioned\n*.json\n'
    );

    // Create config
    const config: DevStepsConfig = {
      version: packageJson.version,
      project_name: args.project_name,
      project_id: `devsteps-${Date.now()}`,
      created: getCurrentTimestamp(),
      updated: getCurrentTimestamp(),
      settings: {
        methodology: methodology,
        auto_increment: true,
        git_integration: args.git_integration ?? true,
        default_author: args.author,
        item_types: methodologyConfig.item_types,
        item_prefixes: methodologyConfig.item_prefixes,
      },
    };

    writeFileSync(join(devstepsDir, 'config.json'), JSON.stringify(config, null, 2));

    // Initialize refs-style index structure with counters for all item types
    const counters: Record<string, number> = {};
    for (const type of methodologyConfig.item_types) {
      counters[type] = 0;
    }

    initializeRefsStyleIndex(devstepsDir, counters);

    // Create or update .gitignore (append-only — preserve existing rules)
    const gitignorePath = join(projectPath, '.gitignore');
    const devstepsEntries = ['.devsteps/', 'node_modules/', 'dist/', '*.log', '.env', '.DS_Store'];
    if (existsSync(gitignorePath)) {
      const existing = readFileSync(gitignorePath, 'utf-8');
      const missing = devstepsEntries.filter((entry) => !existing.includes(entry));
      if (missing.length > 0) {
        const appendBlock = `\n# DevSteps\n${missing.join('\n')}\n`;
        writeFileSync(gitignorePath, existing + appendBlock);
      }
    } else {
      writeFileSync(gitignorePath, `${devstepsEntries.join('\n')}\n`);
    }

    writeSetupMd(args.project_name, devstepsDir);

    // Create .github directory structure and copy all devsteps Copilot files
    const githubDir = join(projectPath, '.github');
    const copied = copyGithubFiles(
      join(packageRoot, '.github'),
      join(githubDir, 'agents'),
      join(githubDir, 'instructions'),
      join(githubDir, 'prompts')
    );

    // Copy HIERARCHY.md and AI-GUIDE.md
    copyDevstepsDocs(packageRoot, devstepsDir);

    // Extend existing agent files with devsteps tools
    const extendedFiles = extendExistingAgents(projectPath);

    const totalCopied = copied.agents.length + copied.instructions.length + copied.prompts.length;
    let message = `Project '${args.project_name}' initialized successfully\n\n`;
    message += `✓ Copilot files created (${totalCopied} files):\n`;
    for (const file of copied.agents) {
      message += `  - .github/agents/${file}\n`;
    }
    for (const file of copied.instructions) {
      message += `  - .github/instructions/${file}\n`;
    }
    for (const file of copied.prompts) {
      message += `  - .github/prompts/${file}\n`;
    }
    message += '\n✓ Documentation:\n';
    message += '  - .devsteps/HIERARCHY.md\n';
    message += '  - .devsteps/AI-GUIDE.md';

    if (extendedFiles.length > 0) {
      message += `\n\n✓ Extended ${extendedFiles.length} existing agent/chatmode file(s) with devsteps tools:`;
      for (const file of extendedFiles) {
        message += `\n  - ${file}`;
      }
    }

    return {
      success: true,
      message,
      path: devstepsDir,
      config,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Extend existing agent/chatmode files with devsteps tools
 */
function extendExistingAgents(projectPath: string): string[] {
  const extendedFiles: string[] = [];

  // Scan .github/agents and .github/chatmodes directories
  const agentsDir = join(projectPath, '.github', 'agents');
  const chatmodesDir = join(projectPath, '.github', 'chatmodes');

  const scanAndExtend = (dir: string, type: 'agent' | 'chatmode') => {
    if (!existsSync(dir)) return;

    const files = readdirSync(dir) as string[];
    const mdFiles = files
      .filter((f: string) => f.endsWith('.agent.md') || f.endsWith('.chatmode.md'))
      .filter((f: string) => !f.startsWith('devsteps-')); // Skip devsteps-managed agents

    for (const file of mdFiles) {
      const filePath = join(dir, file);
      const content = readFileSync(filePath, 'utf8');

      const { modified, newContent } = addDevStepsToolsToAgent(content);

      if (modified) {
        writeFileSync(filePath, newContent, 'utf8');
        extendedFiles.push(`.github/${type}s/${file}`);
      }
    }
  };

  scanAndExtend(agentsDir, 'agent');
  scanAndExtend(chatmodesDir, 'chatmode');

  return extendedFiles;
}

/**
 * Parse agent file and add devsteps tools if not present
 */
function addDevStepsToolsToAgent(content: string): { modified: boolean; newContent: string } {
  // Parse YAML frontmatter (simple parser for our use case)
  const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    return { modified: false, newContent: content };
  }

  const frontmatter = frontmatterMatch[1];
  const body = frontmatterMatch[2];

  // Check if tools array exists and contains devsteps
  const toolsMatch = frontmatter.match(/^tools:\s*(\[[\s\S]*?\])/m);

  if (!toolsMatch) {
    // No tools array, add one
    const newFrontmatter = `${frontmatter}\ntools: ['devsteps/*']`;
    return {
      modified: true,
      newContent: `---\n${newFrontmatter}\n---\n${body}`,
    };
  }

  const toolsString = toolsMatch[1];

  // Check if devsteps is already present
  if (toolsString.includes('devsteps/*') || toolsString.includes('devsteps-')) {
    return { modified: false, newContent: content };
  }

  // Add devsteps/* to existing tools array
  // Parse the array (simplified - assumes single-line or multi-line array)
  const toolsArrayMatch = toolsString.match(/\[([\s\S]*?)\]/);
  if (!toolsArrayMatch) {
    return { modified: false, newContent: content };
  }

  const toolsContent = toolsArrayMatch[1].trim();
  let newToolsArray: string;

  if (toolsContent === '') {
    // Empty array
    newToolsArray = "['devsteps/*']";
  } else {
    // Add to existing tools
    newToolsArray = `[${toolsContent}, 'devsteps/*']`;
  }

  const newFrontmatter = frontmatter.replace(/tools:\s*\[[\s\S]*?\]/, `tools: ${newToolsArray}`);

  return {
    modified: true,
    newContent: `---\n${newFrontmatter}\n---\n${body}`,
  };
}
