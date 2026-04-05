/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP handler: devsteps_docs_new
 * Create a new documentation file with Diataxis type enforcement.
 *
 * @see STORY-238 SPIKE-044
 */

import { writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';
import type { DiataxisType } from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

function generateSkeleton(title: string, type: DiataxisType): string {
	switch (type) {
		case 'tutorial':
			return [
				`# Tutorial: ${title}`,
				'',
				'> In this tutorial, you will learn how to …',
				'',
				'## Prerequisites',
				'',
				'- …',
				'',
				'## Step 1: …',
				'',
				'Expected output:',
				'```',
				'…',
				'```',
				'',
				'## Step 2: …',
				'',
				'## Next Steps',
				'',
				'- …',
				'',
			].join('\n');

		case 'how-to':
			return [
				`# How to ${title}`,
				'',
				'> Goal: …',
				'',
				'## Prerequisites',
				'',
				'- …',
				'',
				'## Steps',
				'',
				'1. …',
				'2. …',
				'3. …',
				'',
				'## Next Steps',
				'',
				'- …',
				'',
			].join('\n');

		case 'reference':
			return [
				`# Reference: ${title}`,
				'',
				'## Overview',
				'',
				'…',
				'',
				'## Parameters',
				'',
				'| Name | Type | Default | Description |',
				'|------|------|---------|-------------|',
				'| … | … | … | … |',
				'',
				'## See Also',
				'',
				'- …',
				'',
			].join('\n');

		case 'explanation':
			return [
				`# ${title}`,
				'',
				'## Background',
				'',
				'…',
				'',
				'## How It Works',
				'',
				'…',
				'',
				'## Trade-offs',
				'',
				'…',
				'',
				'## Further Reading',
				'',
				'- …',
				'',
			].join('\n');

		case 'architecture':
			return [
				`# ADR: ${title}`,
				'',
				'## Status',
				'',
				'Proposed',
				'',
				'## Context',
				'',
				'…',
				'',
				'## Decision',
				'',
				'…',
				'',
				'## Consequences',
				'',
				'### Positive',
				'',
				'- …',
				'',
				'### Negative',
				'',
				'- …',
				'',
			].join('\n');

		case 'research':
			return [
				`# Research: ${title}`,
				'',
				'## Question',
				'',
				'…',
				'',
				'## Methodology',
				'',
				'…',
				'',
				'## Findings',
				'',
				'…',
				'',
				'## Recommendations',
				'',
				'…',
				'',
				'## Sources',
				'',
				'- …',
				'',
			].join('\n');
	}
}

export default async function devstepsDocsNewHandler(args: Record<string, unknown>) {
	const workspaceRoot = getWorkspacePath();
	const title = args.title as string;
	const type = args.diataxis_type as DiataxisType;
	const outputPath = args.output_path as string;

	// Path traversal guard
	const fullPath = resolve(workspaceRoot, outputPath);
	if (!fullPath.startsWith(resolve(workspaceRoot))) {
		return { success: false, error: `Path traversal detected: ${outputPath}` };
	}

	const content = generateSkeleton(title, type);

	await mkdir(dirname(fullPath), { recursive: true });
	await writeFile(fullPath, content, 'utf-8');

	return {
		success: true,
		path: outputPath,
		diataxis_type: type,
		lines: content.split('\n').length,
		next_steps: [`Created ${type} skeleton at ${outputPath}. Edit the placeholders to complete the document.`],
	};
}
