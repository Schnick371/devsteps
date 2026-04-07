/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Unit tests for itemLoader — verifies DOC-NNN regex + typeMap resolution (BUG-072 closure)
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock vscode before importing itemLoader
vi.mock('vscode', () => ({
  Uri: {
    joinPath: vi.fn((_base, ..._parts) => ({ fsPath: '/mock/.devsteps/items/docs/DOC-001.json' })),
  },
  workspace: {
    fs: {
      readFile: vi.fn(),
    },
  },
  FileType: { File: 1, Directory: 2 },
}));

// Mock shared package
vi.mock('@schnick371/devsteps-shared', () => ({
  TYPE_TO_DIRECTORY: {
    epic: 'items/epics',
    story: 'items/stories',
    task: 'items/tasks',
    requirement: 'items/requirements',
    feature: 'items/features',
    bug: 'items/bugs',
    spike: 'items/spikes',
    test: 'items/tests',
    doc: 'items/docs',
  },
}));

import * as vscode from 'vscode';
import { loadItemWithLinks } from './itemLoader.js';

function makeItemBuffer(fields: object): Uint8Array {
  return Buffer.from(JSON.stringify(fields));
}

describe('loadItemWithLinks — DOC prefix (BUG-072 closure)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves DOC-001 to type:doc', async () => {
    const mockReadFile = vi.mocked(vscode.workspace.fs.readFile);
    mockReadFile.mockResolvedValueOnce(
      makeItemBuffer({
        id: 'DOC-001',
        type: 'doc',
        title: 'Architecture Overview',
        status: 'draft',
        eisenhower: 'not-urgent-important',
      })
    );

    const result = await loadItemWithLinks({} as vscode.Uri, 'DOC-001');

    expect(result).not.toBeNull();
    expect(result?.type).toBe('doc');
    expect(result?.id).toBe('DOC-001');
    expect(result?.priority).toBe('high'); // mapped from not-urgent-important
  });

  it('returns null for an unrecognised prefix', async () => {
    const result = await loadItemWithLinks({} as vscode.Uri, 'UNKNOWN-001');
    expect(result).toBeNull();
  });

  it('returns null when the file read throws', async () => {
    const mockReadFile = vi.mocked(vscode.workspace.fs.readFile);
    mockReadFile.mockRejectedValueOnce(new Error('File not found'));

    const result = await loadItemWithLinks({} as vscode.Uri, 'DOC-001');
    expect(result).toBeNull();
  });
});
