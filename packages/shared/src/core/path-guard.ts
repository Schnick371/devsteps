/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Shared path-traversal guard — OWASP A01 defence-in-depth utility.
 * Extracted from devsteps_docs_import.ts scanner.
 *
 * @see TASK-494 EPIC-043
 */

import { resolve } from 'node:path';

/**
 * Validate that `input` (workspace-relative or absolute) resolves to a path
 * that is contained within `workspaceRoot`.
 *
 * Returns the resolved absolute path on success, or `null` if the path
 * escapes the workspace root (path-traversal attempt detected).
 *
 * @example
 * validateWorkspacePath('docs/guide.md', '/project')
 * // → '/project/docs/guide.md'
 *
 * validateWorkspacePath('../etc/passwd', '/project')
 * // → null  (escapes workspace root)
 */
export function validateWorkspacePath(input: string, workspaceRoot: string): string | null {
  const resolvedRoot = resolve(workspaceRoot);
  const resolvedInput = resolve(workspaceRoot, input);
  if (!resolvedInput.startsWith(resolvedRoot + '/') && resolvedInput !== resolvedRoot) {
    return null;
  }
  return resolvedInput;
}
