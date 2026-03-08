/**
 * Copyright © 2025 Thomas Hertel (the@devsteps.dev)
 * Licensed under the Apache License, Version 2.0
 *
 * Spider Events watcher — watches .devsteps/events/spider_events.jsonl for
 * new ring events written by VS Code 1.110 Copilot Hooks. Fires a callback
 * with parsed SpiderEvent objects for each new line appended.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { SpiderEvent } from '@schnick371/devsteps-shared';
import { SpiderEventSchema } from '@schnick371/devsteps-shared';
import * as vscode from 'vscode';
import { logger } from '../outputChannel.js';

const EVENTS_FILENAME = 'spider_events.jsonl';
const EVENTS_SUBDIR = '.devsteps/events';

export class SpiderEventsWatcher implements vscode.Disposable {
  private readonly _disposables: vscode.Disposable[] = [];
  private _lastSize = 0;
  private readonly _eventsFilePath: string;
  private readonly _onEvent: (event: SpiderEvent) => void;

  constructor(workspaceRoot: string, onEvent: (event: SpiderEvent) => void) {
    this._eventsFilePath = path.join(workspaceRoot, EVENTS_SUBDIR, EVENTS_FILENAME);
    this._onEvent = onEvent;
    this._startWatching();
  }

  private _startWatching(): void {
    const eventsDir = path.dirname(this._eventsFilePath);

    // Ensure directory exists
    if (!fs.existsSync(eventsDir)) {
      fs.mkdirSync(eventsDir, { recursive: true });
    }

    // Record initial file size to only read new content
    if (fs.existsSync(this._eventsFilePath)) {
      this._lastSize = fs.statSync(this._eventsFilePath).size;
    }

    // Use VS Code RelativePattern watcher for the events file
    const pattern = new vscode.RelativePattern(vscode.Uri.file(eventsDir), EVENTS_FILENAME);
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);

    watcher.onDidChange(() => this._readNewLines());
    watcher.onDidCreate(() => {
      this._lastSize = 0;
      this._readNewLines();
    });

    this._disposables.push(watcher);
    logger.info(`Spider events watcher active: ${this._eventsFilePath}`);
  }

  private _readNewLines(): void {
    try {
      if (!fs.existsSync(this._eventsFilePath)) return;

      const stat = fs.statSync(this._eventsFilePath);
      if (stat.size <= this._lastSize) return;

      // Read only new bytes since last read
      const fd = fs.openSync(this._eventsFilePath, 'r');
      const buffer = Buffer.alloc(stat.size - this._lastSize);
      fs.readSync(fd, buffer, 0, buffer.length, this._lastSize);
      fs.closeSync(fd);

      this._lastSize = stat.size;

      const newContent = buffer.toString('utf-8');
      const lines = newContent.split('\n').filter((line) => line.trim().length > 0);

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          const result = SpiderEventSchema.safeParse(parsed);
          if (result.success) {
            this._onEvent(result.data);
          } else {
            logger.warn(`Invalid spider event: ${result.error.message}`);
          }
        } catch {
          logger.warn(`Failed to parse spider event line: ${line.substring(0, 100)}`);
        }
      }
    } catch (error) {
      logger.warn(
        `Spider events read error: ${error instanceof Error ? error.message : 'Unknown'}`
      );
    }
  }

  dispose(): void {
    for (const d of this._disposables) {
      d.dispose();
    }
    this._disposables.length = 0;
  }
}
