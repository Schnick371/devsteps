import type { EisenhowerQuadrant, ItemType, Priority } from '../schemas/index.js';

/**
 * Central type shortcuts mapping
 */
export const TYPE_SHORTCUTS: Record<string, ItemType> = {
  epic: 'epic',
  story: 'story',
  task: 'task',
  req: 'requirement',
  feat: 'feature',
  bug: 'bug',
  spike: 'spike',
  test: 'test',
} as const;

/**
 * Command argument types - central source of truth
 */

export interface AddItemCommandArgs {
  type: string; // Will be mapped via TYPE_SHORTCUTS
  title: string;
  description?: string;
  category?: string;
  priority?: string;
  eisenhower?: string;
  tags?: string[];
  assignee?: string;
  paths?: string[];
}

export interface UpdateItemCommandArgs {
  id: string;
  status?: string;
  priority?: string;
  eisenhower?: string;
  superseded_by?: string;
  title?: string;
  description?: string;
  assignee?: string;
  tags?: string[];
  paths?: string[];
}

export interface ListItemsCommandArgs {
  type?: string;
  status?: string;
  priority?: string;
  eisenhower?: string;
  assignee?: string;
  tags?: string[];
  archived?: boolean;
  limit?: string;
}

export interface SearchItemsCommandArgs {
  query: string;
  type?: string;
  limit?: string;
}

export interface StatusCommandArgs {
  detailed?: boolean;
}

export interface TraceCommandArgs {
  id: string;
  depth?: string;
}

export interface ExportCommandArgs {
  format?: string;
  output?: string;
  types?: string[];
}

export interface ArchiveCommandArgs {
  id: string;
}

export interface PurgeCommandArgs {
  status?: string[];
  type?: string;
}

/**
 * Response types
 */

export interface CommandSuccessResponse {
  success: true;
  message: string;
  [key: string]: unknown;
}

export interface CommandErrorResponse {
  success: false;
  error: string;
}

export type CommandResponse = CommandSuccessResponse | CommandErrorResponse;

/**
 * Index item summary type (from index.json)
 */
export interface IndexItem {
  id: string;
  type: ItemType;
  title: string;
  status: string;
  priority: Priority;
  updated: string;
  tags?: string[];
  category?: string;
}
