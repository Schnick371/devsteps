/**
 * Workspace path resolution utility
 * 
 * Resolves workspace path from environment variable or falls back to process.cwd()
 * This ensures MCP server operates in correct workspace directory.
 */

/**
 * Get the workspace root directory
 * Priority: DEVSTEPS_WORKSPACE env var > process.cwd()
 */
export function getWorkspacePath(): string {
  return process.env.DEVSTEPS_WORKSPACE || process.cwd();
}
