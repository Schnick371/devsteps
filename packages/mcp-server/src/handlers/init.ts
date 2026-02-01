import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type DevStepsConfig,
  getCurrentTimestamp,
  getMethodologyConfig,
  initializeRefsStyleIndex,
  type Methodology,
} from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

    // Create config
    const config: DevStepsConfig = {
      version: '0.1.0',
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

    // Create .gitignore
    const gitignore = `.devsteps/
node_modules/
dist/
*.log
.env
.DS_Store
`;
    writeFileSync(join(projectPath, '.gitignore'), gitignore);

    // Create .github directory structure
    const githubAgentsDir = join(projectPath, '.github', 'agents');
    const githubInstructionsDir = join(projectPath, '.github', 'instructions');
    const githubPromptsDir = join(projectPath, '.github', 'prompts');

    mkdirSync(githubAgentsDir, { recursive: true });
    mkdirSync(githubInstructionsDir, { recursive: true });
    mkdirSync(githubPromptsDir, { recursive: true });

    // Read source Copilot files from package
    // In development: 3 levels up to repo root
    // After npm install: 2 levels up to package root (where .github was copied)
    const packageRoot = join(__dirname, '..', '..');
    const sourceGithubDir = join(packageRoot, '.github');

    // Copy devsteps agent
    const devstepsAgentSource = join(sourceGithubDir, 'agents', 'devsteps.agent.md');
    const devstepsAgentContent = existsSync(devstepsAgentSource)
      ? readFileSync(devstepsAgentSource, 'utf8')
      : `---
name: devsteps
description: Task tracking with devsteps system - enforces structured documentation
---

# 📋 DevSteps Task Tracking Mode

You are a **task management assistant** that helps users work with the devsteps system.

## Core Principles

The devsteps system is a **lightweight, git-based task tracking system** designed for developers who want to:
- Track tasks, features, bugs, and requirements **directly in their repository**
- Use **simple text files** (JSON + Markdown) instead of external tools
- Keep **project history in git** alongside code changes
- Enable **AI-assisted development** through structured task metadata

## Your Role

When in devsteps mode, you:

✅ **ALWAYS use devsteps tools** for task management:
- Use \`#mcp_devsteps_add\` to create new tasks
- Use \`#mcp_devsteps_update\` to modify existing tasks
- Use \`#mcp_devsteps_list\` to show tasks
- Use \`#mcp_devsteps_get\` to view task details
- Use \`#mcp_devsteps_status\` to show project overview

✅ **Enforce structured task creation**:
- Always ask for: title, type (task/bug/feature/story)
- Encourage: affected_paths, tags, clear descriptions
- Suggest: priority (Eisenhower Matrix: urgent-important, not-urgent-important, urgent-not-important, not-urgent-not-important)

✅ **Guide best practices**:
- Link related tasks using \`#mcp_devsteps_link\`
- Keep tasks focused and atomic
- Update task status as work progresses
- Document decisions in task descriptions

❌ **DON'T**:
- Create tasks manually without using devsteps tools
- Skip task metadata (it enables better filtering and context)
- Forget to update task status when work is done
- Mix multiple concerns in a single task

## Common Workflows

### Creating a New Task
\`\`\`
User: "We need to add authentication"
You: Use #mcp_devsteps_add with:
- title: "Implement user authentication"
- type: "feature"
- priority: "urgent-important"
- affected_paths: ["src/auth/"]
- description: Clear requirements in Markdown
\`\`\`

### Checking Current Work
\`\`\`
User: "What should I work on?"
You: Use #mcp_devsteps_list with filters:
- status: "draft" or "planned"
- Filter by eisenhower field in metadata (internal storage)
- Show tasks in priority order with context
\`\`\`

### Updating Progress
\`\`\`
User: "I finished the login feature"
You: Use #mcp_devsteps_update to:
- Change status to "done"
- Add completion notes
- Suggest linking to related tasks
\`\`\`

## Task Lifecycle

\`\`\`
draft → planned → in-progress → review → done
                              ↓
                           blocked
\`\`\`

- **draft**: Initial idea, needs refinement
- **planned**: Ready to work on, fully specified
- **in-progress**: Currently being worked on
- **review**: Implementation complete, needs review
- **blocked**: Cannot proceed (document blocker)
- **done**: Completed and verified

## Integration with Development

The devsteps system integrates with:
- **Git commits**: Reference task IDs in commit messages
- **MCP/AI tools**: Provide context for AI-assisted development
- **VS Code**: Extension for visual task management
- **CLI**: Command-line interface for quick operations

## Tips for Users

1. **Start small**: Create a task even for small changes
2. **Link everything**: Use relationships to track dependencies
3. **Write good descriptions**: Future-you will thank you
4. **Use tags**: They make filtering and searching easier
5. **Commit often**: Keep task files in sync with code

---

**Remember**: The devsteps is not just a todo list—it's a **living knowledge base** that grows with your project and helps both humans and AI understand what needs to be done.
`;

    writeFileSync(join(githubAgentsDir, 'devsteps.agent.md'), devstepsAgentContent);

    // Copy ALL devsteps agent files dynamically
    const sourceAgentsDir = join(sourceGithubDir, 'agents');
    if (existsSync(sourceAgentsDir)) {
      const agentFiles = readdirSync(sourceAgentsDir).filter(
        (f) => f.startsWith('devsteps') && f.endsWith('.agent.md')
      );
      for (const agentFile of agentFiles) {
        const agentSource = join(sourceAgentsDir, agentFile);
        const agentContent = readFileSync(agentSource, 'utf8');
        writeFileSync(join(githubAgentsDir, agentFile), agentContent);
      }
    }

    // Copy ALL devsteps instruction files dynamically
    const sourceInstructionsDir = join(sourceGithubDir, 'instructions');
    if (existsSync(sourceInstructionsDir)) {
      const instructionFiles = readdirSync(sourceInstructionsDir).filter(
        (f) => f.startsWith('devsteps') && f.endsWith('.instructions.md')
      );
      for (const instructionFile of instructionFiles) {
        const instructionSource = join(sourceInstructionsDir, instructionFile);
        const instructionContent = readFileSync(instructionSource, 'utf8');
        writeFileSync(join(githubInstructionsDir, instructionFile), instructionContent);
      }
    }

    // Copy ALL devsteps prompt files dynamically
    const sourcePromptsDir = join(sourceGithubDir, 'prompts');
    if (existsSync(sourcePromptsDir)) {
      const promptFiles = readdirSync(sourcePromptsDir).filter(
        (f) => f.startsWith('devsteps') && f.endsWith('.prompt.md')
      );
      for (const promptFile of promptFiles) {
        const promptSource = join(sourcePromptsDir, promptFile);
        const promptContent = readFileSync(promptSource, 'utf8');
        writeFileSync(join(githubPromptsDir, promptFile), promptContent);
      }
    }

    // Copy HIERARCHY.md
    const hierarchySource = join(packageRoot, '.devsteps', 'HIERARCHY.md');
    if (existsSync(hierarchySource)) {
      const hierarchyContent = readFileSync(hierarchySource, 'utf8');
      writeFileSync(join(devstepsDir, 'HIERARCHY.md'), hierarchyContent);
    }

    // Copy AI-GUIDE.md
    const aiGuideSource = join(packageRoot, '.devsteps', 'AI-GUIDE.md');
    if (existsSync(aiGuideSource)) {
      const aiGuideContent = readFileSync(aiGuideSource, 'utf8');
      writeFileSync(join(devstepsDir, 'AI-GUIDE.md'), aiGuideContent);
    }

    // Extend existing agent files with devsteps tools
    const extendedFiles = extendExistingAgents(projectPath);

    // Collect copied files for message
    const copiedAgents: string[] = [];
    const copiedInstructions: string[] = [];
    const copiedPrompts: string[] = [];

    if (existsSync(sourceAgentsDir)) {
      copiedAgents.push(
        ...readdirSync(sourceAgentsDir).filter(
          (f) => f.startsWith('devsteps') && f.endsWith('.agent.md')
        )
      );
    }
    if (existsSync(sourceInstructionsDir)) {
      copiedInstructions.push(
        ...readdirSync(sourceInstructionsDir).filter(
          (f) => f.startsWith('devsteps') && f.endsWith('.instructions.md')
        )
      );
    }
    if (existsSync(sourcePromptsDir)) {
      copiedPrompts.push(
        ...readdirSync(sourcePromptsDir).filter(
          (f) => f.startsWith('devsteps') && f.endsWith('.prompt.md')
        )
      );
    }

    let message = `Project '${args.project_name}' initialized successfully\n\n`;
    message += `✓ Copilot files created (${copiedAgents.length + copiedInstructions.length + copiedPrompts.length} files):\n`;
    for (const file of copiedAgents) {
      message += `  - .github/agents/${file}\n`;
    }
    for (const file of copiedInstructions) {
      message += `  - .github/instructions/${file}\n`;
    }
    for (const file of copiedPrompts) {
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
      .filter((f: string) => f !== 'devsteps.agent.md'); // Skip the devsteps agent we just created

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
