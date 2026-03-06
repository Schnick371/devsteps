/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
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
  // CLI argument takes highest precedence — explicit path always wins
  // (stdio MCP servers pass workspace as positional arg; this overrides any inherited env)
  const workspaceArg = process.argv[2];
  if (workspaceArg) {
    return workspaceArg;
  }
  // Env var fallback — set by in-process HTTP mode from VS Code extension
  if (process.env.DEVSTEPS_WORKSPACE) {
    return process.env.DEVSTEPS_WORKSPACE;
  }
  const cwd = process.cwd();
  const workspacePath = cwd;

  if (!workspacePath) {
    throw new Error(
      'No workspace path available. DevSteps requires a workspace folder.\n' +
        'Please open a folder in VS Code or provide a path argument.\n' +
        'Usage: devsteps-mcp <workspace-path>'
    );
  }

  return workspacePath;
}
