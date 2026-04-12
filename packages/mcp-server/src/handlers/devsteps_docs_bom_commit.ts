/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * MCP handler: devsteps_docs_bom_commit
 * Materialise import session: create DOC items + update docs-map.json.
 *
 * @see STORY-238 SPIKE-044
 */

import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import {
  addItem,
  appendDocsMapNode,
  type DocsMapNode,
  extractFrontmatter,
  getItem,
  linkItem,
  validateSession,
  writeSession,
} from '@schnick371/devsteps-shared';
import { getWorkspacePath } from '../workspace.js';

/**
 * Extract related_items from file frontmatter and create `implements` links.
 * Warn-and-continue: unresolved IDs produce warnings, never abort.
 *
 * @returns Array of warning strings for unresolved item IDs
 */
async function autoLinkRelatedItems(
  devstepsDir: string,
  workspaceRoot: string,
  filePath: string,
  docItemId: string
): Promise<string[]> {
  const absolutePath = join(workspaceRoot, filePath);
  if (!existsSync(absolutePath)) return [];

  let content: string;
  try {
    content = await readFile(absolutePath, 'utf-8');
  } catch {
    return [];
  }

  let relatedItems: string[] = [];
  try {
    const { frontmatter } = extractFrontmatter(content);
    relatedItems = frontmatter?.related_items ?? [];
  } catch {
    // Frontmatter parse error — skip auto-linking for this file silently
    return [];
  }

  if (relatedItems.length === 0) return [];

  const warnings: string[] = [];
  for (const relatedId of relatedItems) {
    try {
      await getItem(devstepsDir, relatedId);
    } catch {
      warnings.push(`related_items entry '${relatedId}' not found — link skipped`);
      continue;
    }
    try {
      await linkItem(devstepsDir, {
        sourceId: docItemId,
        relationType: 'documents',
        targetId: relatedId,
      });
    } catch (err) {
      warnings.push(
        `Failed to link '${docItemId}' → '${relatedId}': ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
  return warnings;
}

export default async function devstepsDocsBomCommitHandler(args: Record<string, unknown>) {
  const workspaceRoot = getWorkspacePath();
  const devstepsDir = join(workspaceRoot, '.devsteps');
  const sessionId = args.session_id as string;
  const token = args.token as string;
  const dryRun = (args.dry_run as boolean) ?? false;

  const validation = await validateSession(devstepsDir, sessionId, token);
  if ('error' in validation) {
    return { success: false, error: validation.error };
  }
  const session = validation.session;

  if (session.pending.length > 0) {
    return {
      success: false,
      error: `Session has ${session.pending.length} pending files. Complete classification first.`,
    };
  }

  if (session.status === 'committed') {
    return {
      success: false,
      error: `Session already committed.`,
    };
  }

  const toCreate = session.classified.filter((c) => c.decision !== 'skip');
  const docItems: string[] = [];
  const errors: Array<{ path: string; reason: string }> = [];
  const warnings: string[] = [];
  let bomNodesAdded = 0;

  if (dryRun) {
    return {
      success: true,
      dry_run: true,
      items_would_create: toCreate.length,
      skipped: session.classified.length - toCreate.length,
      files: toCreate.map((c) => ({
        path: c.path,
        decision: c.decision,
        diataxis_type: c.diataxis_type,
      })),
      next_steps: [
        `Would create ${toCreate.length} DOC items. Call again without dry_run to commit.`,
      ],
    };
  }

  for (const entry of toCreate) {
    try {
      if (entry.decision === 'split' && entry.splits) {
        // Create one DOC item per split
        for (const split of entry.splits) {
          const slug = split.new_path
            .replace(/\.md$/, '')
            .replace(/[^a-z0-9-]/gi, '-')
            .toLowerCase();
          const title = `${split.diataxis_type}: ${slug}`;
          const result = await addItem(devstepsDir, {
            type: 'doc',
            title,
            description: `Split from ${entry.path}. Sections: ${split.sections.join(', ')}`,
            tags: ['diataxis', split.diataxis_type, 'import'],
            affected_paths: [split.new_path],
          });
          docItems.push(result.itemId);

          // Auto-link related_items from split source file frontmatter
          const splitWarnings = await autoLinkRelatedItems(
            devstepsDir,
            workspaceRoot,
            entry.path,
            result.itemId
          );
          warnings.push(...splitWarnings);

          const node: DocsMapNode = {
            id: slug,
            doc_id: result.itemId,
            parent_id: null,
            order: bomNodesAdded * 10,
            title,
            devsteps_items: [result.itemId],
          };
          appendDocsMapNode(devstepsDir, null, node);
          bomNodesAdded++;
        }
      } else if (entry.decision === 'accept' && entry.diataxis_type) {
        const slug = entry.path
          .replace(/\.md$/, '')
          .replace(/[^a-z0-9-]/gi, '-')
          .toLowerCase();
        const title = `${entry.diataxis_type}: ${slug}`;
        const result = await addItem(devstepsDir, {
          type: 'doc',
          title,
          description: `Imported from ${entry.path}. Type: ${entry.diataxis_type}`,
          tags: ['diataxis', entry.diataxis_type, 'import'],
          affected_paths: [entry.path],
        });
        docItems.push(result.itemId);

        // Auto-link related_items from file frontmatter
        const acceptWarnings = await autoLinkRelatedItems(
          devstepsDir,
          workspaceRoot,
          entry.path,
          result.itemId
        );
        warnings.push(...acceptWarnings);

        const node: DocsMapNode = {
          id: slug,
          doc_id: result.itemId,
          parent_id: null,
          order: bomNodesAdded * 10,
          title,
          devsteps_items: [result.itemId],
        };
        appendDocsMapNode(devstepsDir, null, node);
        bomNodesAdded++;
      } else if (entry.decision === 'rewrite') {
        // Create a DOC item for rewrite tracking
        const slug = entry.path
          .replace(/\.md$/, '')
          .replace(/[^a-z0-9-]/gi, '-')
          .toLowerCase();
        const title = `rewrite: ${slug}`;
        const result = await addItem(devstepsDir, {
          type: 'doc',
          title,
          description: `Marked for full rewrite. Original: ${entry.path}`,
          tags: ['diataxis', 'rewrite', 'import'],
          affected_paths: [entry.path],
        });
        docItems.push(result.itemId);

        // Auto-link related_items from file frontmatter
        const rewriteWarnings = await autoLinkRelatedItems(
          devstepsDir,
          workspaceRoot,
          entry.path,
          result.itemId
        );
        warnings.push(...rewriteWarnings);
      }
    } catch (err) {
      errors.push({
        path: entry.path,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Mark session committed
  session.status = 'committed';
  await writeSession(devstepsDir, session);

  return {
    success: true,
    items_created: docItems.length,
    bom_nodes_added: bomNodesAdded,
    skipped: session.classified.length - toCreate.length,
    errors,
    warnings,
    doc_items: docItems,
    dry_run: false,
    next_steps: [
      `Created ${docItems.length} DOC items: ${docItems.join(', ')}. Updated docs-map.json with ${bomNodesAdded} nodes. Import session complete.`,
    ],
  };
}
