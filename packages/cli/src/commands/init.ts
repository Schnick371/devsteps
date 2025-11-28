import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { type Methodology, getCurrentTimestamp, getMethodologyConfig } from '@schnick371/devsteps-shared';
import type { DevStepsConfig } from '@schnick371/devsteps-shared';
import chalk from 'chalk';
import ora from 'ora';

export async function initCommand(
  projectName: string | undefined,
  options: {
    path?: string;
    author?: string;
    git: boolean;
    methodology?: Methodology;
  }
) {
  const spinner = ora('Initializing devsteps project...').start();

  try {
    const projectPath = options.path || process.cwd();
    const name = projectName || 'devsteps-project';
    const devstepsDir = join(projectPath, '.devsteps');
    const methodology = options.methodology || 'scrum';

    // Check if already initialized
    if (existsSync(devstepsDir)) {
      spinner.fail('Project already initialized');
      console.log(
        chalk.yellow('\nUse'),
        chalk.cyan('devsteps status'),
        chalk.yellow('to view project info')
      );
      return;
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
      project_name: name,
      project_id: `devsteps-${Date.now()}`,
      created: getCurrentTimestamp(),
      updated: getCurrentTimestamp(),
      settings: {
        methodology: methodology,
        auto_increment: true,
        git_integration: options.git,
        default_author: options.author,
        item_types: methodologyConfig.item_types,
        item_prefixes: methodologyConfig.item_prefixes,
      },
    };

    writeFileSync(join(devstepsDir, 'config.json'), JSON.stringify(config, null, 2));

    // Create index
    const index = {
      items: [],
      last_updated: getCurrentTimestamp(),
      stats: {
        total: 0,
        by_type: {},
        by_status: {},
      },
    };

    writeFileSync(join(devstepsDir, 'index.json'), JSON.stringify(index, null, 2));

    // Create .gitignore
    const gitignore = `.devsteps/
node_modules/
dist/
*.log
.env
.DS_Store
`;
    writeFileSync(join(projectPath, '.gitignore'), gitignore);

    // Create SETUP.md
    const setupMd = `# ${name} - Setup Guide

## Prerequisites

- Node.js v18+ ([https://nodejs.org](https://nodejs.org))
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

## Development Environment

### Health Check

Run diagnostics to verify your setup:

\`\`\`bash
devsteps doctor
\`\`\`

This checks:
- Node.js version (v18+)
- Package manager installation
- Git availability
- TypeScript (if used)
- Dependencies installation
- DevSteps project structure
- MCP configuration

### MCP Setup (AI Integration)

Configure devsteps for your IDE:

\`\`\`bash
# For VS Code or Cursor (auto-detect)
devsteps setup

# Explicit IDE selection
devsteps setup --tool vscode
devsteps setup --tool cursor

# Global installation (all projects)
devsteps setup --global
\`\`\`

After setup:
1. Restart your IDE completely
2. Open Copilot/AI Chat
3. Use devsteps tools: \`#devsteps-init\`, \`#devsteps-add\`, etc.

## Project Structure

\`\`\`
${name}/
├── .devsteps/          # DevSteps data directory
│   ├── config.json   # Project configuration
│   ├── index.json    # Master index
│   ├── epics/        # Epic items
│   ├── stories/      # Story items
│   ├── tasks/        # Task items
│   ├── requirements/ # Requirements
│   ├── features/     # Features
│   ├── bugs/         # Bug reports
│   ├── tests/        # Test items
│   └── archive/      # Archived items
└── .vscode/
    ├── tasks.json    # VS Code tasks
    └── mcp.json      # MCP configuration
\`\`\`

## Common Commands

### Item Management

\`\`\`bash
# Add items
devsteps add story "Implement feature X"
devsteps add task "Fix bug in component Y"
devsteps add bug "Error on page load"

# List items
devsteps list --status draft
devsteps list --type story --priority high

# Update items
devsteps update STORY-001 --status in-progress
devsteps update TASK-005 --priority high

# Get item details
devsteps get STORY-001
\`\`\`

### Project Status

\`\`\`bash
# Show overview
devsteps status

# Full details
devsteps status --detailed
\`\`\`

### Search & Filter

\`\`\`bash
# Search across all items
devsteps search "authentication"

# List with filters
devsteps list --assignee user@example.com
devsteps list --tags feature,urgent
\`\`\`

### Relationships

\`\`\`bash
# Link items
devsteps link TASK-001 implements STORY-005
devsteps link TEST-003 tests FEAT-010

# Show traceability
devsteps trace STORY-005
\`\`\`

### Maintenance

\`\`\`bash
# Archive single item
devsteps archive STORY-001

# Bulk archive (done/cancelled)
devsteps purge

# Bulk archive by filter
devsteps purge --status done --type story
\`\`\`

## Troubleshooting

### "Project not initialized"
Run \`devsteps init\` in your project directory.

### "Node.js version too old"
Upgrade to Node.js v18 or higher from [nodejs.org](https://nodejs.org).

### "MCP server not found"
1. Run \`devsteps setup\` to configure
2. Restart your IDE completely
3. Check the configuration file exists

### Dependencies missing
Run \`pnpm install\` (or \`npm install\`) to install dependencies.

## Next Steps

1. Run \`devsteps doctor\` to verify setup
2. Add your first items: \`devsteps add req "Your requirement"\`
3. Configure MCP for AI assistance: \`devsteps setup\`
4. Check out the documentation in \`docs/\` (if available)

## Support

For issues and questions:
- Check documentation: [GitHub Repository]
- Run health check: \`devsteps doctor\`
- Review project status: \`devsteps status\`
`;

    writeFileSync(join(devstepsDir, 'SETUP.md'), setupMd);

    // Create VS Code tasks
    const vscodeDir = join(projectPath, '.vscode');
    mkdirSync(vscodeDir, { recursive: true });

    const tasks = {
      version: '2.0.0',
      tasks: [
        {
          label: 'Build All',
          type: 'shell',
          command: 'pnpm build',
          group: {
            kind: 'build',
            isDefault: true,
          },
          presentation: {
            reveal: 'always',
            panel: 'shared',
          },
        },
        {
          label: 'DevSteps: List Open Items',
          type: 'shell',
          command: 'node packages/cli/dist/index.js list --status draft,in-progress',
          presentation: {
            reveal: 'always',
            panel: 'dedicated',
          },
        },
        {
          label: 'DevSteps: List High Priority Items',
          type: 'shell',
          command: 'node packages/cli/dist/index.js list --priority high',
          presentation: {
            reveal: 'always',
            panel: 'dedicated',
          },
        },
        {
          label: 'DevSteps: List Q1 Tasks (Urgent & Important)',
          type: 'shell',
          command:
            'node packages/cli/dist/index.js list --eisenhower urgent-important --status draft',
          presentation: {
            reveal: 'always',
            panel: 'dedicated',
          },
        },
        {
          label: 'DevSteps: Full Status Report',
          type: 'shell',
          command: 'node packages/cli/dist/index.js status',
          presentation: {
            reveal: 'always',
            panel: 'dedicated',
          },
        },
      ],
    };

    writeFileSync(join(vscodeDir, 'tasks.json'), JSON.stringify(tasks, null, 2));

    // Create .github directory structure
    const githubAgentsDir = join(projectPath, '.github', 'agents');
    const githubInstructionsDir = join(projectPath, '.github', 'instructions');
    const githubPromptsDir = join(projectPath, '.github', 'prompts');
    
    mkdirSync(githubAgentsDir, { recursive: true });
    mkdirSync(githubInstructionsDir, { recursive: true });
    mkdirSync(githubPromptsDir, { recursive: true });

    // Determine monorepo root to access source files
    // Read source Copilot files from package
    // In development: 4 levels up to repo root
    // After npm install: 2 levels up to package root (where .github was copied)
    const currentFileUrl = import.meta.url;
    const currentFilePath = fileURLToPath(currentFileUrl);
    const currentDir = dirname(currentFilePath);
    const packageRoot = join(currentDir, '..', '..');
    const sourceGithubDir = join(packageRoot, '.github');

    const devstepsAgent = `---
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
- Always ask for: title, type (task/bug/feature/story), priority
- Encourage: affected_paths, tags, clear descriptions
- Suggest: Eisenhower quadrant classification for prioritization

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
- priority: "high"
- affected_paths: ["src/auth/"]
- description: Clear requirements in Markdown
\`\`\`

### Checking Current Work
\`\`\`
User: "What should I work on?"
You: Use #mcp_devsteps_list with filters:
- status: "draft" or "planned"
- priority: "high" or "critical"
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

    writeFileSync(join(githubAgentsDir, 'devsteps.agent.md'), devstepsAgent);

    // Copy devsteps instructions
    const instructionFiles = ['devsteps.instructions.md', 'devsteps-code-standards.instructions.md'];
    for (const instructionFile of instructionFiles) {
      const instructionSource = join(sourceGithubDir, 'instructions', instructionFile);
      if (existsSync(instructionSource)) {
        const instructionContent = readFileSync(instructionSource, 'utf8');
        writeFileSync(join(githubInstructionsDir, instructionFile), instructionContent);
      }
    }

    // Copy devsteps prompts
    const promptFiles = ['devsteps-plan-work.prompt.md', 'devsteps-start-work.prompt.md', 'devsteps-workflow.prompt.md'];
    for (const promptFile of promptFiles) {
      const promptSource = join(sourceGithubDir, 'prompts', promptFile);
      if (existsSync(promptSource)) {
        const promptContent = readFileSync(promptSource, 'utf8');
        writeFileSync(join(githubPromptsDir, promptFile), promptContent);
      }
    }

    spinner.succeed('Project initialized successfully!');

    console.log();
    console.log(chalk.green('✓'), 'Project:', chalk.cyan(name));
    console.log(chalk.green('✓'), 'Location:', chalk.cyan(devstepsDir));
    console.log(
      chalk.green('✓'),
      'Git integration:',
      chalk.cyan(options.git ? 'enabled' : 'disabled')
    );
    console.log(chalk.green('✓'), 'VS Code tasks:', chalk.cyan('.vscode/tasks.json'));
    console.log(chalk.green('✓'), 'Copilot files:');
    console.log('      ', chalk.cyan('.github/agents/devsteps.agent.md'));
    console.log('      ', chalk.cyan('.github/instructions/devsteps.instructions.md'));
    console.log('      ', chalk.cyan('.github/instructions/devsteps-code-standards.instructions.md'));
    console.log('      ', chalk.cyan('.github/prompts/devsteps-plan-work.prompt.md'));
    console.log('      ', chalk.cyan('.github/prompts/devsteps-start-work.prompt.md'));
    console.log('      ', chalk.cyan('.github/prompts/devsteps-workflow.prompt.md'));

    if (options.author) {
      console.log(chalk.green('✓'), 'Default author:', chalk.cyan(options.author));
    }

    console.log();
    console.log(chalk.yellow('Next steps:'));
    console.log('  ', chalk.cyan('devsteps add req "Your first requirement"'));
    console.log('  ', chalk.cyan('devsteps status'));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    spinner.fail('Initialization failed');
    console.error(chalk.red('Error:'), message);
    process.exit(1);
  }
}
