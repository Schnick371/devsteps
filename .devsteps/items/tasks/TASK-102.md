## Problem

Missing or corrupted Copilot instruction files break AI-assisted development:
- `.github/copilot-instructions.md` - Main Copilot entry point
- `.github/agents/*.agent.md` - Persona definitions
- `.github/instructions/*.instructions.md` - Context-specific rules
- `.github/prompts/*.prompt.md` - Workflow templates

**Impact:** Copilot gives generic advice, makes systematic mistakes, ignores project patterns.

## Solution

Add doctor check for Copilot file infrastructure:

### Check Categories

**1. Core Files (Critical):**
- `.github/copilot-instructions.md` - Main instructions
- `.github/agents/devsteps.agent.md` - Primary agent persona

**2. Instruction Files (High Priority):**
- `.github/instructions/devsteps.instructions.md` - Workflow rules
- `.github/instructions/general-development-standards.instructions.md`
- `.github/instructions/devsteps-code-standards.instructions.md`

**3. Workflow Prompts (Medium Priority):**
- `.github/prompts/devsteps-plan-work.prompt.md`
- `.github/prompts/devsteps-start-work.prompt.md`
- `.github/prompts/devsteps-workflow.prompt.md`

### Output Format

```bash
$ devsteps doctor

🏥 DevSteps Health Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Environment checks passed
✓ DevSteps project structure valid

━━━ Copilot Infrastructure ━━━

✓ Core instructions found (2/2)
  ✓ .github/copilot-instructions.md
  ✓ .github/agents/devsteps.agent.md

⚠ Instruction files incomplete (4/5)
  ✓ .github/instructions/devsteps.instructions.md
  ✓ .github/instructions/general-development-standards.instructions.md
  ✗ .github/instructions/testing.instructions.md (missing)
  ✓ .github/instructions/devsteps-code-standards.instructions.md
  ✓ .github/instructions/implement-standards.instructions.md

✓ Workflow prompts found (3/3)
  ✓ .github/prompts/devsteps-plan-work.prompt.md
  ✓ .github/prompts/devsteps-start-work.prompt.md
  ✓ .github/prompts/devsteps-workflow.prompt.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary: 1 warning found
Run 'devsteps doctor --fix' to restore missing files from templates
```

### Auto-Fix Behavior

```bash
$ devsteps doctor --fix

🔧 Restoring Copilot infrastructure...

✓ Restored .github/instructions/testing.instructions.md from template
✓ Copilot files complete

💡 Review restored files and customize for your project needs
```

## Implementation

**File:** `packages/cli/src/commands/doctor.ts`

```typescript
interface CopilotFile {
  path: string;
  category: 'core' | 'instruction' | 'prompt';
  priority: 'critical' | 'high' | 'medium';
}

const COPILOT_FILES: CopilotFile[] = [
  // Core (Critical)
  { path: '.github/copilot-instructions.md', category: 'core', priority: 'critical' },
  { path: '.github/agents/devsteps.agent.md', category: 'core', priority: 'critical' },
  
  // Instructions (High Priority)
  { path: '.github/instructions/devsteps.instructions.md', category: 'instruction', priority: 'high' },
  { path: '.github/instructions/general-development-standards.instructions.md', category: 'instruction', priority: 'high' },
  { path: '.github/instructions/devsteps-code-standards.instructions.md', category: 'instruction', priority: 'high' },
  
  // Prompts (Medium Priority)
  { path: '.github/prompts/devsteps-plan-work.prompt.md', category: 'prompt', priority: 'medium' },
  { path: '.github/prompts/devsteps-start-work.prompt.md', category: 'prompt', priority: 'medium' },
  { path: '.github/prompts/devsteps-workflow.prompt.md', category: 'prompt', priority: 'medium' },
];

function checkCopilotFiles(): CheckResult {
  const missing: CopilotFile[] = [];
  const found: CopilotFile[] = [];
  
  for (const file of COPILOT_FILES) {
    const fullPath = join(process.cwd(), file.path);
    if (existsSync(fullPath)) {
      found.push(file);
    } else {
      missing.push(file);
    }
  }
  
  if (missing.length === 0) {
    return {
      name: 'Copilot Infrastructure',
      status: 'pass',
      message: `All ${COPILOT_FILES.length} files present`,
    };
  }
  
  const criticalMissing = missing.filter(f => f.priority === 'critical');
  if (criticalMissing.length > 0) {
    return {
      name: 'Copilot Infrastructure',
      status: 'fail',
      message: `${criticalMissing.length} critical files missing`,
      details: criticalMissing.map(f => `  ✗ ${f.path}`).join('\n'),
      fix: 'Run: devsteps doctor --fix',
    };
  }
  
  return {
    name: 'Copilot Infrastructure',
    status: 'warn',
    message: `${missing.length}/${COPILOT_FILES.length} files missing`,
    details: missing.map(f => `  ✗ ${f.path}`).join('\n'),
    fix: 'Run: devsteps doctor --fix',
  };
}
```

### Auto-Fix Implementation

```typescript
async function fixCopilotFiles(missingFiles: CopilotFile[]): Promise<void> {
  const shared = await import('@schnick371/devsteps-shared');
  
  for (const file of missingFiles) {
    // Get template from shared package
    const template = shared.getTemplate(file.path);
    if (template) {
      const fullPath = join(process.cwd(), file.path);
      const dir = dirname(fullPath);
      
      // Create directory if needed
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      
      // Write template
      writeFileSync(fullPath, template, 'utf-8');
      console.log(chalk.green('✓'), `Restored ${file.path}`);
    }
  }
}
```

## Testing

**Test cases:**
1. ✅ All files present → Pass
2. ⚠️ 1 instruction file missing → Warning
3. ❌ Core file missing → Fail (critical)
4. ✅ `--fix` restores from templates
5. ✅ User can customize restored files

## Acceptance Criteria

- [ ] Doctor checks all 8+ Copilot files
- [ ] Critical failures block (core files)
- [ ] Warnings for optional files
- [ ] `--fix` restores from templates
- [ ] Clear output with file paths
- [ ] Templates stored in shared package