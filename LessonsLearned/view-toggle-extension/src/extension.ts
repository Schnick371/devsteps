import * as vscode from 'vscode';
import { ViewMode, ViewToggleProvider } from './viewPane';

const ContextKeys = {
  ViewMode: 'viewToggle.viewMode',
};

export function activate(context: vscode.ExtensionContext) {
  const provider = new ViewToggleProvider(context);

  const treeView = vscode.window.createTreeView('viewToggleExplorer', {
    treeDataProvider: provider,
    showCollapseAll: true,
  });

  // Initialen ViewMode laden
  const initialMode = context.workspaceState.get<ViewMode>('viewMode', ViewMode.List);
  provider.viewMode = initialMode;
  setViewModeContext(initialMode);

  // ===== Toolbar Toggle Commands =====

  // Toggle List View (zeigt List-Icon, wechselt zu Tree)
  context.subscriptions.push(
    vscode.commands.registerCommand('viewToggle.toggleListView', () => {
      // Aktuell in List Mode, wechsle zu Tree
      provider.viewMode = ViewMode.Tree;
      context.workspaceState.update('viewMode', ViewMode.Tree);
      setViewModeContext(ViewMode.Tree);
    })
  );

  // Toggle Tree View (zeigt Tree-Icon, wechselt zu List)
  context.subscriptions.push(
    vscode.commands.registerCommand('viewToggle.toggleTreeView', () => {
      // Aktuell in Tree Mode, wechsle zu List
      provider.viewMode = ViewMode.List;
      context.workspaceState.update('viewMode', ViewMode.List);
      setViewModeContext(ViewMode.List);
    })
  );

  // ===== Menu Commands mit Checkmark =====

  // List View Commands (active ist disabled, inactive führt Aktion aus)
  context.subscriptions.push(
    vscode.commands.registerCommand('viewToggle.setListView.active', () => {
      // Noop - bereits aktiv
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('viewToggle.setListView.inactive', () => {
      provider.viewMode = ViewMode.List;
      context.workspaceState.update('viewMode', ViewMode.List);
      setViewModeContext(ViewMode.List);
    })
  );

  // Tree View Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('viewToggle.setTreeView.active', () => {
      // Noop - bereits aktiv
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('viewToggle.setTreeView.inactive', () => {
      provider.viewMode = ViewMode.Tree;
      context.workspaceState.update('viewMode', ViewMode.Tree);
      setViewModeContext(ViewMode.Tree);
    })
  );

  context.subscriptions.push(treeView);
}

function setViewModeContext(mode: ViewMode) {
  vscode.commands.executeCommand('setContext', ContextKeys.ViewMode, mode);
}

export function deactivate() {}
