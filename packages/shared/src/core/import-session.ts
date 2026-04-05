/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Import session management — HMAC-SHA256 token enforcement + session CRUD.
 * Used by the 5-tool MCP dialog chain for docs import.
 *
 * @see STORY-238 SPIKE-044
 */

import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { DiataxisType, ScoreVector } from './heuristic-classify.js';

// ── Types ──────────────────────────────────────────────

export type ImportSessionStatus = 'open' | 'classifying' | 'review' | 'committed' | 'aborted';

export interface ImportSessionFile {
	path: string;
	excerpt: string;
	size_bytes: number;
	last_modified: string;
}

export interface SplitEntry {
	new_path: string;
	sections: string[];
	diataxis_type: DiataxisType;
}

export interface ClassifiedEntry {
	path: string;
	decision: 'accept' | 'split' | 'skip' | 'rewrite';
	diataxis_type?: DiataxisType;
	scores: ScoreVector;
	mixed: boolean;
	splits?: SplitEntry[];
}

export interface ImportSession {
	session_id: string;
	token_hash: string;
	created_at: string;
	ttl_seconds: number;
	scanned_path: string;
	files: ImportSessionFile[];
	classified: ClassifiedEntry[];
	pending: string[];
	status: ImportSessionStatus;
}

// ── Token helpers ──────────────────────────────────────

const IMPORT_SECRET = process.env.DEVSTEPS_IMPORT_SECRET ?? 'devsteps-import';

export function generateSessionToken(sessionId: string, createdAt: string): string {
	return createHmac('sha256', IMPORT_SECRET)
		.update(`${sessionId}:${createdAt}`)
		.digest('hex');
}

export function validateSessionToken(session: ImportSession, token: string): boolean {
	const expected = generateSessionToken(session.session_id, session.created_at);
	try {
		return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(token, 'hex'));
	} catch {
		return false;
	}
}

// ── Session CRUD ───────────────────────────────────────

function sessionsDir(devstepsDir: string): string {
	return join(devstepsDir, 'import-sessions');
}

function sessionPath(devstepsDir: string, sessionId: string): string {
	// Prevent path traversal
	const safe = sessionId.replace(/[^a-f0-9-]/gi, '');
	return join(sessionsDir(devstepsDir), `${safe}.json`);
}

export function isSessionExpired(session: ImportSession): boolean {
	return Date.now() - Date.parse(session.created_at) >= session.ttl_seconds * 1000;
}

export async function createSession(
	devstepsDir: string,
	scannedPath: string,
	files: ImportSessionFile[],
): Promise<{ session: ImportSession; token: string }> {
	const dir = sessionsDir(devstepsDir);
	await mkdir(dir, { recursive: true });

	const sessionId = randomUUID();
	const createdAt = new Date().toISOString();
	const token = generateSessionToken(sessionId, createdAt);
	const tokenHash = createHmac('sha256', IMPORT_SECRET).update(token).digest('hex');

	const session: ImportSession = {
		session_id: sessionId,
		token_hash: tokenHash,
		created_at: createdAt,
		ttl_seconds: 3600,
		scanned_path: scannedPath,
		files,
		classified: [],
		pending: files.map((f) => f.path),
		status: 'open',
	};

	await writeFile(sessionPath(devstepsDir, sessionId), JSON.stringify(session, null, 2), 'utf-8');
	return { session, token };
}

export async function readSession(
	devstepsDir: string,
	sessionId: string,
): Promise<ImportSession | null> {
	try {
		const raw = await readFile(sessionPath(devstepsDir, sessionId), 'utf-8');
		return JSON.parse(raw) as ImportSession;
	} catch {
		return null;
	}
}

export async function writeSession(devstepsDir: string, session: ImportSession): Promise<void> {
	await writeFile(
		sessionPath(devstepsDir, session.session_id),
		JSON.stringify(session, null, 2),
		'utf-8',
	);
}

export async function findActiveSession(
	devstepsDir: string,
	scannedPath: string,
): Promise<ImportSession | null> {
	const dir = sessionsDir(devstepsDir);
	let entries: string[];
	try {
		entries = await readdir(dir);
	} catch {
		return null;
	}

	for (const entry of entries) {
		if (!entry.endsWith('.json')) continue;
		try {
			const raw = await readFile(join(dir, entry), 'utf-8');
			const session = JSON.parse(raw) as ImportSession;
			if (
				session.scanned_path === scannedPath &&
				(session.status === 'open' || session.status === 'classifying') &&
				!isSessionExpired(session)
			) {
				return session;
			}
		} catch {
			/* skip corrupted files */
		}
	}
	return null;
}

// ── Session validation helper ──────────────────────────

export interface SessionValidation {
	session: ImportSession;
	error?: never;
}

export interface SessionValidationError {
	session?: never;
	error: string;
}

export async function validateSession(
	devstepsDir: string,
	sessionId: string,
	token: string,
): Promise<SessionValidation | SessionValidationError> {
	const session = await readSession(devstepsDir, sessionId);
	if (!session) {
		return { error: `Session not found: ${sessionId}` };
	}
	if (isSessionExpired(session)) {
		return { error: 'Session expired. Call devsteps_docs_import again to start a new session.' };
	}
	if (!validateSessionToken(session, token)) {
		return { error: 'Invalid or expired session token.' };
	}
	return { session };
}
