/**
 * Workspace path resolution utility
 * 
 * MCP servers receive workspace context via process.cwd() set by the spawning process.
 * VS Code sets cwd when spawning the MCP server process.
 */

/**
 * Get the workspace root directory
 * 
 * Returns process.cwd() which is set by VS Code when spawning the MCP server.
 * The 'cwd' option in McpStdioServerDefinition ensures correct working directory.
 */
export function getWorkspacePath(): string {
  return process.cwd();
}
