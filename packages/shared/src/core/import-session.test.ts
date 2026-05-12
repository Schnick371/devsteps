/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Tests for import-session module (HMAC token + session CRUD).
 * @see STORY-238
 */

import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ImportSessionFile, SessionValidation } from './import-session.js';
import {
  createSession,
  findActiveSession,
  generateSessionToken,
  isSessionExpired,
  readSession,
  validateSession,
  validateSessionToken,
  withSessionLock,
  writeSession,
} from './import-session.js';

const SAMPLE_FILES: ImportSessionFile[] = [
  {
    path: 'docs/README.md',
    excerpt: '# README\nSome content',
    size_bytes: 100,
    last_modified: '2026-01-01T00:00:00Z',
  },
  {
    path: 'docs/guide.md',
    excerpt: '# Guide\nSteps here',
    size_bytes: 200,
    last_modified: '2026-01-02T00:00:00Z',
  },
];

describe('import-session', () => {
  let devstepsDir: string;

  beforeEach(async () => {
    devstepsDir = await mkdtemp(join(tmpdir(), 'devsteps-test-'));
  });

  afterEach(async () => {
    await rm(devstepsDir, { recursive: true, force: true });
  });

  describe('token generation', () => {
    it('generates deterministic HMAC tokens', () => {
      const token1 = generateSessionToken('abc-123', '2026-01-01T00:00:00Z');
      const token2 = generateSessionToken('abc-123', '2026-01-01T00:00:00Z');
      expect(token1).toBe(token2);
      expect(token1).toHaveLength(64); // hex-encoded SHA-256
    });

    it('produces different tokens for different inputs', () => {
      const token1 = generateSessionToken('a', '2026-01-01T00:00:00Z');
      const token2 = generateSessionToken('b', '2026-01-01T00:00:00Z');
      expect(token1).not.toBe(token2);
    });
  });

  describe('createSession', () => {
    it('creates session file and returns token', async () => {
      const { session, token } = await createSession(devstepsDir, 'docs/', SAMPLE_FILES);
      expect(session.session_id).toBeTruthy();
      expect(session.status).toBe('open');
      expect(session.files).toHaveLength(2);
      expect(session.pending).toHaveLength(2);
      expect(session.classified).toHaveLength(0);
      expect(token).toHaveLength(64);

      // Session file should exist
      const entries = await readdir(join(devstepsDir, 'import-sessions'));
      expect(entries).toHaveLength(1);
    });
  });

  describe('readSession', () => {
    it('reads back a created session', async () => {
      const { session } = await createSession(devstepsDir, 'docs/', SAMPLE_FILES);
      const loaded = await readSession(devstepsDir, session.session_id);
      expect(loaded).not.toBeNull();
      expect(loaded?.session_id).toBe(session.session_id);
      expect(loaded?.files).toHaveLength(2);
    });

    it('returns null for missing session', async () => {
      const loaded = await readSession(devstepsDir, 'nonexistent');
      expect(loaded).toBeNull();
    });
  });

  describe('validateSessionToken', () => {
    it('accepts valid token', async () => {
      const { session, token } = await createSession(devstepsDir, 'docs/', SAMPLE_FILES);
      expect(validateSessionToken(session, token)).toBe(true);
    });

    it('rejects invalid token', async () => {
      const { session } = await createSession(devstepsDir, 'docs/', SAMPLE_FILES);
      expect(validateSessionToken(session, 'a'.repeat(64))).toBe(false);
    });

    it('rejects malformed token', async () => {
      const { session } = await createSession(devstepsDir, 'docs/', SAMPLE_FILES);
      expect(validateSessionToken(session, 'too-short')).toBe(false);
    });
  });

  describe('isSessionExpired', () => {
    it('returns false for fresh session', async () => {
      const { session } = await createSession(devstepsDir, 'docs/', SAMPLE_FILES);
      expect(isSessionExpired(session)).toBe(false);
    });

    it('returns true for expired session', async () => {
      const { session } = await createSession(devstepsDir, 'docs/', SAMPLE_FILES);
      session.created_at = new Date(Date.now() - 3601_000).toISOString();
      expect(isSessionExpired(session)).toBe(true);
    });
  });

  describe('writeSession + readSession roundtrip', () => {
    it('persists updates', async () => {
      const { session } = await createSession(devstepsDir, 'docs/', SAMPLE_FILES);
      session.status = 'classifying';
      session.pending = ['docs/guide.md'];
      await writeSession(devstepsDir, session);

      const loaded = await readSession(devstepsDir, session.session_id);
      expect(loaded?.status).toBe('classifying');
      expect(loaded?.pending).toEqual(['docs/guide.md']);
    });
  });

  describe('findActiveSession', () => {
    it('finds existing active session for same path', async () => {
      const { session } = await createSession(devstepsDir, 'docs/', SAMPLE_FILES);
      const found = await findActiveSession(devstepsDir, 'docs/');
      expect(found).not.toBeNull();
      expect(found?.session_id).toBe(session.session_id);
    });

    it('returns null for different path', async () => {
      await createSession(devstepsDir, 'docs/', SAMPLE_FILES);
      const found = await findActiveSession(devstepsDir, 'src/');
      expect(found).toBeNull();
    });

    it('ignores committed sessions', async () => {
      const { session } = await createSession(devstepsDir, 'docs/', SAMPLE_FILES);
      session.status = 'committed';
      await writeSession(devstepsDir, session);
      const found = await findActiveSession(devstepsDir, 'docs/');
      expect(found).toBeNull();
    });

    it('returns null when no sessions dir exists', async () => {
      const found = await findActiveSession(devstepsDir, 'docs/');
      expect(found).toBeNull();
    });
  });

  describe('validateSession', () => {
    it('returns session for valid token', async () => {
      const { session, token } = await createSession(devstepsDir, 'docs/', SAMPLE_FILES);
      const result = await validateSession(devstepsDir, session.session_id, token);
      expect('error' in result && result.error).toBeFalsy();
      const valid = result as SessionValidation;
      expect(valid.session.session_id).toBe(session.session_id);
    });

    it('returns error for missing session', async () => {
      const result = await validateSession(devstepsDir, 'missing-id', 'x'.repeat(64));
      expect('error' in result).toBe(true);
    });

    it('returns error for invalid token', async () => {
      const { session } = await createSession(devstepsDir, 'docs/', SAMPLE_FILES);
      const result = await validateSession(devstepsDir, session.session_id, 'a'.repeat(64));
      expect('error' in result).toBe(true);
    });

    it('returns error for expired session', async () => {
      const { session, token } = await createSession(devstepsDir, 'docs/', SAMPLE_FILES);
      session.created_at = new Date(Date.now() - 3601_000).toISOString();
      await writeSession(devstepsDir, session);
      const result = await validateSession(devstepsDir, session.session_id, token);
      expect('error' in result).toBe(true);
    });
  });

  describe('withSessionLock', () => {
    it('serialises concurrent read-modify-write — all entries survive', async () => {
      const files: ImportSessionFile[] = [
        { path: 'a.md', excerpt: '', size_bytes: 0, last_modified: '' },
        { path: 'b.md', excerpt: '', size_bytes: 0, last_modified: '' },
        { path: 'c.md', excerpt: '', size_bytes: 0, last_modified: '' },
      ];
      const { session, token } = await createSession(devstepsDir, 'docs', files);
      const { session_id } = session;

      // Fire 3 concurrent classify ops on the same session
      await Promise.all(
        files.map((f) =>
          withSessionLock(devstepsDir, session_id, async () => {
            const s = (await readSession(devstepsDir, session_id))!;
            s.classified.push({
              path: f.path,
              decision: 'accept',
              diataxis_type: 'explanation',
              scores: { tutorial: 0, 'how-to': 0, reference: 0, explanation: 1, architecture: 0, research: 0 },
              mixed: false,
            });
            s.pending = s.pending.filter((p) => p !== f.path);
            await writeSession(devstepsDir, s);
          })
        )
      );

      const final = (await readSession(devstepsDir, session_id))!;
      const classifiedPaths = final.classified.map((c) => c.path).sort();
      expect(classifiedPaths).toEqual(['a.md', 'b.md', 'c.md']);
      expect(final.pending).toHaveLength(0);
    });

    it('releases lock even when the callback throws', async () => {
      const { session } = await createSession(devstepsDir, 'docs', []);
      const { session_id } = session;

      await expect(
        withSessionLock(devstepsDir, session_id, async () => {
          throw new Error('callback failure');
        })
      ).rejects.toThrow('callback failure');

      // Lock must be released — a second call must succeed without timing out
      await expect(
        withSessionLock(devstepsDir, session_id, async () => 'ok')
      ).resolves.toBe('ok');
    });
  });
});
