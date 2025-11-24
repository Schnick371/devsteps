import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  type DevCrumbsConfig,
  type Methodology,
  getCurrentTimestamp,
  getMethodologyConfig,
} from '@devcrumbs/shared';

/**
 * Initialize a new devcrumbs project
 */
export default async function initHandler(args: {
  project_name: string;
  path?: string;
  author?: string;
  git_integration?: boolean;
  methodology?: Methodology;
}) {
  const projectPath = args.path || process.cwd();
  const devcrumbsDir = join(projectPath, '.devcrumbs');
  const methodology = args.methodology || 'scrum';

  // Check if already initialized
  if (existsSync(devcrumbsDir)) {
    throw new Error('Project already initialized. Use devcrumbs-status to view project info.');
  }

  // Get methodology configuration
  const methodologyConfig = getMethodologyConfig(methodology);

  // Create directory structure
  mkdirSync(devcrumbsDir, { recursive: true });
  for (const dir of methodologyConfig.directories) {
    mkdirSync(join(devcrumbsDir, dir), { recursive: true });
  }

  // Create config
  const config: DevCrumbsConfig = {
    version: '0.1.0',
    project_name: args.project_name,
    project_id: `devcrumbs-${Date.now()}`,
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

  writeFileSync(join(devcrumbsDir, 'config.json'), JSON.stringify(config, null, 2));

  // Create index with counters initialized for all item types
  const counters: Record<string, number> = {};
  for (const type of methodologyConfig.item_types) {
    counters[type] = 0;
  }

  const index = {
    items: [],
    last_updated: getCurrentTimestamp(),
    counters,
    archived_items: [],
    stats: {
      total: 0,
      by_type: {},
      by_status: {},
      archived: 0,
    },
  };

  writeFileSync(join(devcrumbsDir, 'index.json'), JSON.stringify(index, null, 2));

  // Create .gitignore
  const gitignore = `.devcrumbs/
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
  const packageRoot = join(__dirname, '..', '..', '..');
  const sourceGithubDir = join(packageRoot, '.github');

  // Copy devcrumbs agent
  const devcrumbsAgentSource = join(sourceGithubDir, 'agents', 'devcrumbs.agent.md');
  const devcrumbsAgentContent = existsSync(devcrumbsAgentSource) 
    ? readFileSync(devcrumbsAgentSource, 'utf8')
    : `---
name: devcrumbs
description: Task tracking with devcrumbs system - enforces structured documentation
---

# 📋 DevCrumbs Task Tracking Mode

You are a **task management assistant** that helps users work with the devcrumbs system.

## Core Principles

The devcrumbs system is a **lightweight, git-based task tracking system** designed for developers who want to:
- Track tasks, features, bugs, and requirements **directly in their repository**
- Use **simple text files** (JSON + Markdown) instead of external tools
- Keep **project history in git** alongside code changes
- Enable **AI-assisted development** through structured task metadata

## Your Role

When in devcrumbs mode, you:

✅ **ALWAYS use devcrumbs tools** for task management:
- Use \`#mcp_devcrumbs_devcrumbs-add\` to create new tasks
- Use \`#mcp_devcrumbs_devcrumbs-update\` to modify existing tasks
- Use \`#mcp_devcrumbs_devcrumbs-list\` to show tasks
- Use \`#mcp_devcrumbs_devcrumbs-get\` to view task details
- Use \`#mcp_devcrumbs_devcrumbs-status\` to show project overview

✅ **Enforce structured task creation**:
- Always ask for: title, type (task/bug/feature/story), priority
- Encourage: affected_paths, tags, clear descriptions
- Suggest: Eisenhower quadrant classification for prioritization

✅ **Guide best practices**:
- Link related tasks using \`#mcp_devcrumbs_devcrumbs-link\`
- Keep tasks focused and atomic
- Update task status as work progresses
- Document decisions in task descriptions

❌ **DON'T**:
- Create tasks manually without using devcrumbs tools
- Skip task metadata (it enables better filtering and context)
- Forget to update task status when work is done
- Mix multiple concerns in a single task

## Common Workflows

### Creating a New Task
\`\`\`
User: "We need to add authentication"
You: Use #mcp_devcrumbs_devcrumbs-add with:
- title: "Implement user authentication"
- type: "feature"
- priority: "high"
- affected_paths: ["src/auth/"]
- description: Clear requirements in Markdown
\`\`\`

### Checking Current Work
\`\`\`
User: "What should I work on?"
You: Use #mcp_devcrumbs_devcrumbs-list with filters:
- status: "draft" or "planned"
- priority: "high" or "critical"
- Show tasks in priority order with context
\`\`\`

### Updating Progress
\`\`\`
User: "I finished the login feature"
You: Use #mcp_devcrumbs_devcrumbs-update to:
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

The devcrumbs system integrates with:
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

**Remember**: The devcrumbs is not just a todo list—it's a **living knowledge base** that grows with your project and helps both humans and AI understand what needs to be done.
`;

  writeFileSync(join(githubAgentsDir, 'devcrumbs.agent.md'), devcrumbsAgentContent);

  // Copy devcrumbs instructions
  const devcrumbsInstructionsSource = join(sourceGithubDir, 'instructions', 'devcrumbs.instructions.md');
  if (existsSync(devcrumbsInstructionsSource)) {
    const devcrumbsInstructionsContent = readFileSync(devcrumbsInstructionsSource, 'utf8');
    writeFileSync(join(githubInstructionsDir, 'devcrumbs.instructions.md'), devcrumbsInstructionsContent);
  }

  // Copy devcrumbs prompts
  const promptFiles = ['devcrumbs-plan-work.prompt.md', 'devcrumbs-start-work.prompt.md', 'devcrumbs-workflow.prompt.md'];
  for (const promptFile of promptFiles) {
    const promptSource = join(sourceGithubDir, 'prompts', promptFile);
    if (existsSync(promptSource)) {
      const promptContent = readFileSync(promptSource, 'utf8');
      writeFileSync(join(githubPromptsDir, promptFile), promptContent);
    }
  }

  // Extend existing agent files with devcrumbs tools
  const extendedFiles = extendExistingAgents(projectPath);

  let message = `Project '${args.project_name}' initialized successfully\n\n`;
  message += '✓ Copilot files created:\n';
  message += '  - .github/agents/devcrumbs.agent.md\n';
  message += '  - .github/instructions/devcrumbs.instructions.md\n';
  message += '  - .github/prompts/devcrumbs-plan-work.prompt.md\n';
  message += '  - .github/prompts/devcrumbs-start-work.prompt.md\n';
  message += '  - .github/prompts/devcrumbs-workflow.prompt.md';

  if (extendedFiles.length > 0) {
    message += `\n\n✓ Extended ${extendedFiles.length} existing agent/chatmode file(s) with devcrumbs tools:`;
    for (const file of extendedFiles) {
      message += `\n  - ${file}`;
    }
  }

  return {
    success: true,
    message,
    path: devcrumbsDir,
    config,
  };
}

/**
 * Extend existing agent/chatmode files with devcrumbs tools
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
      .filter((f: string) => f !== 'devcrumbs.agent.md'); // Skip the devcrumbs agent we just created

    for (const file of mdFiles) {
      const filePath = join(dir, file);
      const content = readFileSync(filePath, 'utf8');

      const { modified, newContent } = addDevCrumbsToolsToAgent(content);

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
 * Parse agent file and add devcrumbs tools if not present
 */
function addDevCrumbsToolsToAgent(content: string): { modified: boolean; newContent: string } {
  // Parse YAML frontmatter (simple parser for our use case)
  const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    return { modified: false, newContent: content };
  }

  const frontmatter = frontmatterMatch[1];
  const body = frontmatterMatch[2];

  // Check if tools array exists and contains devcrumbs
  const toolsMatch = frontmatter.match(/^tools:\s*(\[[\s\S]*?\])/m);

  if (!toolsMatch) {
    // No tools array, add one
    const newFrontmatter = `${frontmatter}\ntools: ['devcrumbs/*']`;
    return {
      modified: true,
      newContent: `---\n${newFrontmatter}\n---\n${body}`,
    };
  }

  const toolsString = toolsMatch[1];

  // Check if devcrumbs is already present
  if (toolsString.includes('devcrumbs/*') || toolsString.includes('devcrumbs-')) {
    return { modified: false, newContent: content };
  }

  // Add devcrumbs/* to existing tools array
  // Parse the array (simplified - assumes single-line or multi-line array)
  const toolsArrayMatch = toolsString.match(/\[([\s\S]*?)\]/);
  if (!toolsArrayMatch) {
    return { modified: false, newContent: content };
  }

  const toolsContent = toolsArrayMatch[1].trim();
  let newToolsArray: string;

  if (toolsContent === '') {
    // Empty array
    newToolsArray = "['devcrumbs/*']";
  } else {
    // Add to existing tools
    const lastCommaOrQuote =
      toolsContent.lastIndexOf(',') > -1 || toolsContent.lastIndexOf("'") > -1;
    newToolsArray = `[${toolsContent}, 'devcrumbs/*']`;
  }

  const newFrontmatter = frontmatter.replace(/tools:\s*\[[\s\S]*?\]/, `tools: ${newToolsArray}`);

  return {
    modified: true,
    newContent: `---\n${newFrontmatter}\n---\n${body}`,
  };
}
