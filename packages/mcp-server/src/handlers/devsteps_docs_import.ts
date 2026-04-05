/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP handler: devsteps_docs_import
 * Scans directory for .md files, creates import session with HMAC token.
 *
 * @see STORY-238 SPIKE-044
 */

import { readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import {
	createSession,
	findActiveSession,
	generateSessionToken,
	type ImportSessionFile,
} from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

async function scanMarkdownFiles(
	dir: string,
	workspaceRoot: string,
): Promise<ImportSessionFile[]> {
	const { readdir } = await import('node:fs/promises');
	const results: ImportSessionFile[] = [];

	async function walk(current: string): Promise<void> {
		const entries = await readdir(current, { withFileTypes: true });
		for (const entry of entries) {
			const full = join(current, entry.name);
			// Path traversal guard
			const resolved = resolve(full);
			if (!resolved.startsWith(resolve(workspaceRoot))) continue;

			if (entry.isDirectory()) {
				// Skip node_modules, .devsteps, .git, dist
				if (['node_modules', '.devsteps', '.git', 'dist'].includes(entry.name)) continue;
				if (entry.isSymbolicLink()) continue;
				await walk(full);
			} else if (entry.name.endsWith('.md') && !entry.isSymbolicLink()) {
				const relativePath = full.slice(workspaceRoot.length + 1);
				try {
					const content = await readFile(full, 'utf-8');
					const lines = content.split('\n');
					const excerpt = lines.slice(0, 40).join('\n');
					const stats = await stat(full);
					results.push({
						path: relativePath,
						excerpt,
						size_bytes: stats.size,
						last_modified: stats.mtime.toISOString(),
					});
				} catch {
					/* skip unreadable files */
				}
			}
		}
	}

	await walk(dir);
	return results;
}

export default async function devstepsDocsImportHandler(args: Record<string, unknown>) {
	const workspaceRoot = getWorkspacePath();
	const devstepsDir = join(workspaceRoot, '.devsteps');
	const scanPath = args.path as string;
	const dryRun = (args.dry_run as boolean) ?? false;

	// Resolve and validate path
	const fullPath = resolve(workspaceRoot, scanPath);
	if (!fullPath.startsWith(resolve(workspaceRoot))) {
		return { success: false, error: `Path traversal detected: ${scanPath}` };
	}

	try {
		const stats = await stat(fullPath);
		if (!stats.isDirectory()) {
			return { success: false, error: `Path is not a directory: ${scanPath}` };
		}
	} catch {
		return { success: false, error: `Path not found: ${scanPath}` };
	}

	const files = await scanMarkdownFiles(fullPath, workspaceRoot);

	if (files.length === 0) {
		return {
			success: true,
			files: [],
			summary: { total_files: 0, total_size_bytes: 0, scanned_path: scanPath },
			next_steps: [`No markdown files found at ${scanPath}. Nothing to import.`],
		};
	}

	if (dryRun) {
		return {
			success: true,
			dry_run: true,
			files,
			summary: {
				total_files: files.length,
				total_size_bytes: files.reduce((sum, f) => sum + f.size_bytes, 0),
				scanned_path: scanPath,
			},
			next_steps: ['Dry run complete. Call again without dry_run to create a session.'],
		};
	}

	// Check for existing active session (idempotency)
	const existing = await findActiveSession(devstepsDir, scanPath);
	if (existing) {
		const token = generateSessionToken(existing.session_id, existing.created_at);
		return {
			success: true,
			session_id: existing.session_id,
			token,
			files: existing.files,
			summary: {
				total_files: existing.files.length,
				total_size_bytes: existing.files.reduce((sum, f) => sum + f.size_bytes, 0),
				scanned_path: scanPath,
			},
			next_steps: [
				`Resumed existing session. ${existing.pending.length} files pending. Call devsteps_docs_classify for EACH item in files[] — provide path, excerpt, session_id, and token. After all files are classified, call devsteps_docs_bom_status to review, then devsteps_docs_bom_commit to finalise.`,
			],
		};
	}

	const { session, token } = await createSession(devstepsDir, scanPath, files);

	return {
		success: true,
		session_id: session.session_id,
		token,
		files,
		summary: {
			total_files: files.length,
			total_size_bytes: files.reduce((sum, f) => sum + f.size_bytes, 0),
			scanned_path: scanPath,
		},
		next_steps: [
			`Found ${files.length} files. Call devsteps_docs_classify for EACH item in files[] — provide path, excerpt, session_id, and token. After all files are classified, call devsteps_docs_bom_status to review, then devsteps_docs_bom_commit to finalise.`,
		],
	};
}
