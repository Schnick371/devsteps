import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { DevStepsConfig } from '@schnick371/devsteps-shared';
import {
  copyDevstepsDocs,
  copyGithubFiles,
  getCurrentTimestamp,
  getMethodologyConfig,
  initializeRefsStyleIndex,
  type Methodology,
  writeSetupMd,
} from '@schnick371/devsteps-shared';
import chalk from 'chalk';
import ora from 'ora';
import packageJson from '../../package.json' with { type: 'json' };

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

    writeSetupMd(name, devstepsDir);

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
        // High Priority list replaced by Eisenhower Q1 filter
        {
          label: 'DevSteps: List Q1 Tasks (Urgent & Important)',
          type: 'shell',
          command:
            'node packages/cli/dist/index.js list --priority urgent-important --status draft',
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

    // Create .github directory structure and copy all devsteps Copilot files
    const githubDir = join(projectPath, '.github');
    const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
    const copied = copyGithubFiles(
      join(packageRoot, '.github'),
      join(githubDir, 'agents'),
      join(githubDir, 'instructions'),
      join(githubDir, 'prompts')
    );

    // Copy HIERARCHY.md and AI-GUIDE.md
    copyDevstepsDocs(packageRoot, devstepsDir);

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
    console.log(
      chalk.green('✓'),
      'Copilot files:',
      chalk.gray(
        `(${copied.agents.length + copied.instructions.length + copied.prompts.length} files)`
      )
    );
    console.log(
      '      ',
      chalk.cyan('.github/agents/'),
      chalk.gray(`(${copied.agents.length} agents)`)
    );
    console.log(
      '      ',
      chalk.cyan('.github/instructions/'),
      chalk.gray(`(${copied.instructions.length} instruction files)`)
    );
    console.log(
      '      ',
      chalk.cyan('.github/prompts/'),
      chalk.gray(`(${copied.prompts.length} prompts)`)
    );
    console.log(chalk.green('✓'), 'Documentation:');
    console.log('      ', chalk.cyan('.devsteps/HIERARCHY.md'));
    console.log('      ', chalk.cyan('.devsteps/AI-GUIDE.md'));

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
