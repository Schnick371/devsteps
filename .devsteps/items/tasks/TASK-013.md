# Welcome View - Onboarding and Quick Start

## Objectives
Create welcome view for new users with onboarding, quick start guides, and getting started content.

## Welcome View Structure

### VS Code Welcome View Contribution
```json
{
  "contributes": {
    "viewsWelcome": [
      {
        "view": "devstepsTreeView",
        "contents": "No DevSteps project found in this workspace.\n[Initialize Project](command:devsteps.init)\n[Open Documentation](command:devsteps.openDocs)",
        "when": "!devsteps.projectExists"
      }
    ]
  }
}
```

### Custom Welcome WebView
```typescript
export class WelcomePanel {
  public static createOrShow(extensionUri: vscode.Uri) {
    const panel = vscode.window.createWebviewPanel(
      'devstepsWelcome',
      'Welcome to DevSteps',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    panel.webview.html = this.getWelcomeHtml();
  }

  private static getWelcomeHtml(): string {
    return `
      <h1>👋 Welcome to DevSteps!</h1>
      
      <h2>Getting Started</h2>
      <ol>
        <li>Initialize a new project</li>
        <li>Choose methodology (Scrum, Waterfall, or Hybrid)</li>
        <li>Create your first Epic/Requirement</li>
        <li>Add Stories/Features and Tasks</li>
      </ol>

      <h2>Quick Actions</h2>
      <button onclick="initProject()">Initialize Project</button>
      <button onclick="viewDocs()">View Documentation</button>
      <button onclick="viewTutorial()">Watch Tutorial</button>

      <h2>Key Features</h2>
      <ul>
        <li>🌲 Hierarchical Work Item Tracking</li>
        <li>📊 Dashboard with Visualizations</li>
        <li>🔗 Traceability and Relationships</li>
        <li>⌨️ Keyboard Shortcuts</li>
      </ul>
    `;
  }
}
```

## Onboarding Flow

### First-Time User Detection
```typescript
export function activate(context: vscode.ExtensionContext) {
  const hasSeenWelcome = context.globalState.get('devsteps.hasSeenWelcome', false);
  
  if (!hasSeenWelcome) {
    WelcomePanel.createOrShow(context.extensionUri);
    context.globalState.update('devsteps.hasSeenWelcome', true);
  }
}
```

### Project Initialization Wizard
```typescript
async function runInitWizard() {
  // Step 1: Project name
  const projectName = await vscode.window.showInputBox({
    prompt: 'Enter project name',
    placeHolder: 'my-awesome-project'
  });

  // Step 2: Methodology
  const methodology = await vscode.window.showQuickPick(
    [
      { label: 'Scrum', description: 'Agile with Epics, Stories, Tasks' },
      { label: 'Waterfall', description: 'Requirements, Features, Tasks' },
      { label: 'Hybrid', description: 'Both Scrum and Waterfall' }
    ],
    { placeHolder: 'Select development methodology' }
  );

  // Step 3: Initialize
  await vscode.commands.executeCommand('devsteps.init', {
    projectName,
    methodology: methodology?.label.toLowerCase()
  });

  vscode.window.showInformationMessage('DevSteps project initialized!');
}
```

## Interactive Tutorials

### Walkthrough Contribution
```json
{
  "contributes": {
    "walkthroughs": [
      {
        "id": "devsteps.gettingStarted",
        "title": "Get Started with DevSteps",
        "description": "Learn how to track work items and visualize project progress",
        "steps": [
          {
            "id": "initialize",
            "title": "Initialize Project",
            "description": "Create your first DevSteps project\n[Initialize Now](command:devsteps.init)",
            "media": {
              "image": "media/walkthrough/init.png",
              "altText": "Initialize DevSteps project"
            }
          },
          {
            "id": "createEpic",
            "title": "Create an Epic",
            "description": "Add your first Epic to organize work\n[Create Epic](command:devsteps.add.epic)",
            "media": {
              "image": "media/walkthrough/epic.png",
              "altText": "Create Epic"
            }
          },
          {
            "id": "addStory",
            "title": "Add Stories",
            "description": "Break down Epics into Stories\n[Add Story](command:devsteps.add.story)"
          },
          {
            "id": "openDashboard",
            "title": "View Dashboard",
            "description": "Visualize project progress\n[Open Dashboard](command:devsteps.openDashboard)"
          }
        ]
      }
    ]
  }
}
```

## Help Commands

### Command Contributions
```json
{
  "commands": [
    {
      "command": "devsteps.showWelcome",
      "title": "DevSteps: Show Welcome Screen"
    },
    {
      "command": "devsteps.openDocs",
      "title": "DevSteps: Open Documentation"
    },
    {
      "command": "devsteps.showTutorial",
      "title": "DevSteps: Show Tutorial"
    },
    {
      "command": "devsteps.reportIssue",
      "title": "DevSteps: Report Issue"
    }
  ]
}
```

### Command Implementations
```typescript
vscode.commands.registerCommand('devsteps.openDocs', () => {
  vscode.env.openExternal(vscode.Uri.parse('https://devsteps.dev/docs'));
});

vscode.commands.registerCommand('devsteps.reportIssue', () => {
  vscode.env.openExternal(vscode.Uri.parse('https://github.com/Schnick371/devsteps/issues/new'));
});
```

## Context-Sensitive Help

### Empty State Messages
```typescript
// In TreeDataProvider
async getChildren(element?: TreeNode): Promise<TreeNode[]> {
  if (!element) {
    const items = await this.getAllItems();
    
    if (items.length === 0) {
      return [new EmptyStateNode('No items yet. Create your first item!')];
    }
    
    return this.buildTree(items);
  }
}
```

## File Structure
```
packages/vscode-extension/
├── media/
│   └── walkthrough/
│       ├── init.png
│       ├── epic.png
│       └── dashboard.png
└── src/
    └── welcomeView.ts
```

## Acceptance Criteria
- ✅ Welcome screen shown on first activation
- ✅ ViewsWelcome contribution for empty TreeView
- ✅ Interactive walkthrough with 4+ steps
- ✅ Project initialization wizard
- ✅ Documentation and tutorial links
- ✅ Help commands in Command Palette
- ✅ Empty state messages in TreeView

## Related Tasks
- **TASK-001**: Extension Scaffolding (first-run detection)
- **TASK-012**: Settings UI (welcome screen preferences)