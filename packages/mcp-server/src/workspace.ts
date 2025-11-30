/**
 * Workspace path resolution utility
 * 
 * Resolves workspace path from CLI argument or falls back to process.cwd()
 * This ensures MCP server operates in correct workspace directory.
 */

/**
 * Get the workspace root directory
 * Priority: CLI argument (process.argv[2]) > process.cwd()
 * 
 * Usage: devsteps-mcp [workspace-path]
 */
export function getWorkspacePath(): string {
  // First argument after script name is workspace path
  const workspaceArg = process.argv[2];
  return workspaceArg || process.cwd();
}
