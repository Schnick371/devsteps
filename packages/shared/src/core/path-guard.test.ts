/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Tests for validateWorkspacePath (OWASP A01 path-traversal guard)
 *
 * @see TASK-494
 */

import { describe, expect, it } from 'vitest';
import { validateWorkspacePath } from './path-guard.js';

const ROOT = '/workspace/project';

describe('validateWorkspacePath', () => {
  it('returns resolved path for a simple relative path', () => {
    const result = validateWorkspacePath('docs/guide.md', ROOT);
    expect(result).toBe(`${ROOT}/docs/guide.md`);
  });

  it('returns resolved path for a path with redundant segments', () => {
    const result = validateWorkspacePath('docs/../docs/guide.md', ROOT);
    expect(result).toBe(`${ROOT}/docs/guide.md`);
  });

  it('returns null for a path that escapes the workspace root with ../', () => {
    const result = validateWorkspacePath('../etc/passwd', ROOT);
    expect(result).toBeNull();
  });

  it('returns null for an absolute path outside the workspace root', () => {
    const result = validateWorkspacePath('/etc/passwd', ROOT);
    expect(result).toBeNull();
  });

  it('returns null for a deeply nested escape attempt', () => {
    const result = validateWorkspacePath('a/b/../../../../etc/secret', ROOT);
    expect(result).toBeNull();
  });

  it('returns resolved path for an absolute path inside the workspace root', () => {
    const result = validateWorkspacePath(`${ROOT}/docs/guide.md`, ROOT);
    expect(result).toBe(`${ROOT}/docs/guide.md`);
  });

  it('returns the workspace root itself when input resolves to root', () => {
    const result = validateWorkspacePath('.', ROOT);
    expect(result).toBe(ROOT);
  });

  it('rejects path that would match a prefix of the root but is outside it', () => {
    // /workspace/project vs /workspace/project-evil
    const result = validateWorkspacePath('../project-evil/secret.md', ROOT);
    expect(result).toBeNull();
  });
});
