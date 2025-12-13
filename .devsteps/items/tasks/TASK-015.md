# Output Channel Logging - Debugging and Diagnostics

## Objectives
Implement output channel for extension logging, error reporting, and debugging information.

## Output Channel Implementation

### Logger Class
```typescript
export class DevStepsLogger {
  private outputChannel: vscode.OutputChannel;
  private logLevel: 'error' | 'warn' | 'info' | 'debug';

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('DevSteps');
    this.logLevel = SettingsManager.getLoggingLevel();
  }

  error(message: string, error?: Error): void {
    this.log('ERROR', message, error);
    this.outputChannel.show(true); // Show on error
  }

  warn(message: string): void {
    if (this.shouldLog('warn')) {
      this.log('WARN', message);
    }
  }

  info(message: string): void {
    if (this.shouldLog('info')) {
      this.log('INFO', message);
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      this.log('DEBUG', message, data);
    }
  }

  private log(level: string, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      if (data instanceof Error) {
        logMessage += `\n${data.stack}`;
      } else {
        logMessage += `\n${JSON.stringify(data, null, 2)}`;
      }
    }
    
    this.outputChannel.appendLine(logMessage);
  }

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  updateLoggingLevel(): void {
    this.logLevel = SettingsManager.getLoggingLevel();
  }

  show(): void {
    this.outputChannel.show();
  }

  clear(): void {
    this.outputChannel.clear();
  }
}
```

## Usage Throughout Extension

### Extension Activation
```typescript
export function activate(context: vscode.ExtensionContext) {
  const logger = new DevStepsLogger();
  logger.info('DevSteps extension activated');

  try {
    // ... activation logic
  } catch (error) {
    logger.error('Failed to activate extension', error as Error);
  }
}
```

### TreeView Operations
```typescript
async getChildren(element?: TreeNode): Promise<TreeNode[]> {
  logger.debug('getChildren called', { element: element?.id });
  
  try {
    const children = await this.fetchChildren(element);
    logger.info(`Loaded ${children.length} children`);
    return children;
  } catch (error) {
    logger.error('Failed to load children', error as Error);
    return [];
  }
}
```

### MCP Server Communication
```typescript
async callMcpTool(tool: string, params: any): Promise<any> {
  logger.debug(`Calling MCP tool: ${tool}`, params);
  
  try {
    const result = await mcpClient.call(tool, params);
    logger.info(`MCP tool ${tool} completed successfully`);
    return result;
  } catch (error) {
    logger.error(`MCP tool ${tool} failed`, error as Error);
    throw error;
  }
}
```

## Commands

### Output Channel Commands
```json
{
  "commands": [
    {
      "command": "devsteps.showOutput",
      "title": "DevSteps: Show Output Channel"
    },
    {
      "command": "devsteps.clearOutput",
      "title": "DevSteps: Clear Output Channel"
    }
  ]
}
```

```typescript
vscode.commands.registerCommand('devsteps.showOutput', () => {
  logger.show();
});

vscode.commands.registerCommand('devsteps.clearOutput', () => {
  logger.clear();
  logger.info('Output channel cleared');
});
```

## Automatic Output Display

### Show on Error
```typescript
// In settings: devsteps.logging.showOutputOnError
if (SettingsManager.get('logging.showOutputOnError', true)) {
  logger.error('Critical error occurred', error);
  // Output channel automatically shows
}
```

## File Structure
```
packages/vscode-extension/
└── src/
    └── outputChannel.ts
```

## Acceptance Criteria
- ✅ Output channel created with 'DevSteps' name
- ✅ Log levels: error, warn, info, debug
- ✅ Timestamps on all log entries
- ✅ Error stack traces included
- ✅ Auto-show on errors (configurable)
- ✅ Commands to show/clear output
- ✅ Respects logging level setting

## Related Tasks
- **TASK-012**: Settings UI (logging configuration)
- **TASK-004**: MCP Server Manager (logs server communication)