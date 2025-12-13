---
applyTo: ".github/prompts/*.prompt.md,.github/instructions/*.instructions.md,.github/chatmodes/*.chatmode.md"
description: "YAML frontmatter headers specification and best practices for GitHub Copilot files"
---

# YAML Frontmatter Headers Specification

## Required Headers

### Instructions Files
```yaml
---
applyTo: "**/*.py"
description: "Brief description"
---
```

### Prompt Files
```yaml
---
mode: 'agent'
model: 'Claude Sonnet 4.5'
tools: ['edit', 'search', 'think', 'usages', 'tavily']  # Variable set based on prompt needs
description: 'Brief description'
---
```

### Chatmode Files
```yaml
---
description: 'Brief description'
model: 'Claude Sonnet 4.5'
tools: ['edit', 'search', 'think', 'usages', 'tavily']  # Variable set based on chatmode needs
---
```

**Tool Selection Guidelines**:
- **Core Tools**: `'think'` (always recommended for analysis)
- **File Operations**: `'edit'`, `'search'`, `'usages'`, `'fileSearch'`, `'readFile'`
- **Development**: `'runCommands'`, `'runTask', 'getTaskOutput'`, `'problems'`
- **Research**: `'tavily'`, `'githubRepo'`
- **Testing**: `'runTests'`, `'testFailure'`
- **Specialized**: Vary by prompt purpose and requirements

## Supported Properties
- `applyTo`: Glob pattern (`"**"`, `"**/*.py"`, `"**/*.ts,**/*.tsx"`)
- `description`: Brief file purpose description
- `mode`: `'agent'`, `'ask'`, or `'edit'`
- `model`: AI model specification (see Model Selection Guidelines below)
- `tools`: Variable array based on prompt requirements (see Tool Selection Guidelines above)

## Model Selection Guidelines

**Progressive Strategy (October 2025):**

- **`'GPT-5 mini'`** - real simple tasks
- **`'Grok Code Fast 1 (Preview) (copilot)'`** - Short files only (<250 lines), speed-critical tasks, general-purpose
- **`'Claude Sonnet 4.5'`** - New/complex prompts, advanced workflows

## Content Guidelines
- **Size matters**: Keep Copilot files short and focused. Avoid lengthy instructions or excessive line counts to prevent overwhelming Copilot and ensure optimal performance.
- **Avoid Redundancy**: After editing, review the file to eliminate repeated or redundant content. Copilot may restate similar guidance in different ways—ensure each rule or guideline appears only once and is clearly expressed.

### No Examples Policy (STRICT)
GitHub Copilot files must NEVER contain:
- ❌ Code examples, sample implementations, or demonstration snippets
- ❌ Decision matrices with concrete values (e.g., "<150 lines", ">200 lines")
- ❌ "Example Flow" or "Example Usage" sections
- ❌ Specific numeric thresholds or file size rules
- ❌ Step-by-step implementation recipes
- ❌ Concrete workflow examples with code blocks

Instead, use:
- ✅ Clear principles and guidelines
- ✅ High-level patterns and architectural decisions
- ✅ References to actual project files for concrete examples
- ✅ Focus on WHY and WHAT, not detailed HOW

### Trust the Model Principle
Each AI model has unique strengths and reasoning capabilities:
- Models should analyze and decide based on principles, not recipes
- Avoid prescriptive rules that limit model judgment
- Provide context and goals, let models determine optimal approach
- Guidelines over rigid procedures

## File Naming Conventions

### Instructions Files
- **Format**: `<Subject>-<Topic>-<Details>.instructions.md`
- **Pattern**: PascalCase with hyphens, descriptive and scope-focused
- **Examples**:
  - `Enterprise-Web-Development.instructions.md`
  - `Systems-Programming-Performance-Safety.instructions.md`
  - `Cloud-Infrastructure-Automation-IaC.instructions.md`
  - `Technical-Writing-Documentation-Standards-Excellence.instructions.md`

### Prompt Files
- **Format**: `<Verb>-<Subject>-<Context>.prompt.md`
- **Pattern**: PascalCase with hyphens, action-oriented task description
- **Common Verbs**: New, Maintain, Assess, Optimize, Repair, Protect, Discover, Analyze, Write, Bootstrap, Deploy
- **Examples**:
  - `New-ReactComponent.prompt.md`
  - `Maintain-Dependencies-Security-Updates.prompt.md`
  - `Assess-Architecture-Maturity-Enterprise.prompt.md`
  - `Optimize-Frontend-Bundle-Performance.prompt.md`
  - `Discover-API-Endpoints-Documentation.prompt.md`

### Chatmode Files
- **Format**: `<Role>-<Specialization>.chatmode.md`
- **Pattern**: PascalCase with hyphens, role and expertise focused (NO verbs - chatmodes are personas, not actions)
- **Common Roles**: Architect, Engineer, Developer, Auditor, Manager, Specialist, Consultant, Analyst
- **Optional Level Prefix**: Can add `Senior-`, `Lead-`, `Principal-` for hierarchy (e.g., `Senior-Architect-Systems.chatmode.md`)
- **Examples**:
  - `Architect-Systems.chatmode.md`
  - `Architect-Enterprise.chatmode.md`
  - `Engineer-Performance.chatmode.md`
  - `Engineer-Security.chatmode.md`
  - `Developer-Electron.chatmode.md`
  - `Developer-React.chatmode.md`
  - `Auditor-Security.chatmode.md`
  - `Auditor-CodeQuality.chatmode.md`
  - `Manager-CopilotFiles.chatmode.md`
  - `Specialist-Database.chatmode.md`
  - `Consultant-CloudMigration.chatmode.md`

### Naming Guidelines
- **Keep Clear and Concise** - Avoid redundant prefixes or unnecessary verbosity
- **Use Descriptive Names** - Reflect scope and purpose accurately
- **Avoid Abbreviations** - Use full words for clarity (e.g., `API` is acceptable, `Perf` is not)
- **Consistency** - Follow established patterns within each file type category

## Common ApplyTo Patterns
- All files: `"**"`
- Python files: `"**/*.py"`
- Multiple extensions: `"**/*.ts,**/*.tsx"`
- Directory-specific: `"**/web/**,**/config/**"`
- File-specific: `"**/arm.yaml,**/simple_media_catalog.py"`