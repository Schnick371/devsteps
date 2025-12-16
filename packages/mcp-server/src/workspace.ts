/**
 * Workspace path resolution utility
 * 
 * MCP servers receive workspace context via process.cwd() set by the spawning process.
 * VS Code sets cwd when spawning the MCP server process.
 */

/**
 * Get the workspace root directory
 * 
 * First checks CLI argument (process.argv[2]) as this is the standard MCP pattern.
 * Falls back to process.cwd() if no argument provided.
 * 
 * @throws {Error} If no workspace path is available
 */
export function getWorkspacePath(): string {
  // CLI argument takes precedence (Standard MCP pattern)
  const workspaceArg = process.argv[2];
  const cwd = process.cwd();
  const workspacePath = workspaceArg || cwd;
  
  if (!workspacePath) {
    throw new Error(
      'No workspace path available. DevSteps requires a workspace folder.\n' +
      'Please open a folder in VS Code or provide a path argument.\n' +
      'Usage: devsteps-mcp <workspace-path>'
    );
  }
  
  return workspacePath;
}
