import * as vscode from 'vscode';

export enum ViewMode {
  List = 'list',
  Tree = 'tree',
}

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
}

interface TreeNode {
  _children?: Record<string, TreeNode>;
  name?: string;
  path?: string;
  type?: 'file' | 'folder';
}

class TreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly item: FileItem | undefined,
    public readonly children?: TreeItem[]
  ) {
    super(label, collapsibleState);

    if (item?.type === 'file') {
      this.iconPath = new vscode.ThemeIcon('file');
      this.contextValue = 'file';
      this.tooltip = item.path;
    } else if (item?.type === 'folder') {
      this.iconPath = new vscode.ThemeIcon('folder');
      this.contextValue = 'folder';
      this.tooltip = item.path;
    }
  }
}

export class ViewToggleProvider implements vscode.TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | undefined> =
    new vscode.EventEmitter<TreeItem | undefined | null | undefined>();
  readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | undefined> =
    this._onDidChangeTreeData.event;

  private _viewMode: ViewMode = ViewMode.List;

  private items: FileItem[] = [
    { name: 'app.ts', path: 'src/app.ts', type: 'file' },
    { name: 'controller.ts', path: 'src/controllers/controller.ts', type: 'file' },
    { name: 'service.ts', path: 'src/services/service.ts', type: 'file' },
    { name: 'utils.ts', path: 'src/utils/utils.ts', type: 'file' },
    { name: 'helper.ts', path: 'src/utils/helper.ts', type: 'file' },
    { name: 'test.ts', path: 'test/test.ts', type: 'file' },
    { name: 'main.spec.ts', path: 'test/unit/main.spec.ts', type: 'file' },
    { name: 'integration.spec.ts', path: 'test/integration/integration.spec.ts', type: 'file' },
  ];

  get viewMode(): ViewMode {
    return this._viewMode;
  }

  set viewMode(mode: ViewMode) {
    if (this._viewMode === mode) {
      return;
    }

    this._viewMode = mode;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TreeItem): Thenable<TreeItem[]> {
    if (!element) {
      if (this._viewMode === ViewMode.List) {
        return Promise.resolve(this.getListView());
      } else {
        return Promise.resolve(this.getTreeView());
      }
    } else {
      return Promise.resolve(element.children || []);
    }
  }

  private getListView(): TreeItem[] {
    return this.items.map(
      (item) => new TreeItem(item.path, vscode.TreeItemCollapsibleState.None, item)
    );
  }

  private getTreeView(): TreeItem[] {
    const tree: Record<string, TreeNode> = {};

    this.items.forEach((item) => {
      const parts = item.path.split('/');
      let current = tree;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = { _children: {} };
        }
        current = current[part]._children;
      }

      const fileName = parts[parts.length - 1];
      current[fileName] = item;
    });

    const buildTreeItems = (node: Record<string, TreeNode>, prefix = ''): TreeItem[] => {
      const items: TreeItem[] = [];

      for (const key in node) {
        const value = node[key];
        const fullPath = prefix ? `${prefix}/${key}` : key;

        if (value.type === 'file') {
          items.push(new TreeItem(key, vscode.TreeItemCollapsibleState.None, value));
        } else if (value._children) {
          const children = buildTreeItems(value._children, fullPath);
          items.push(
            new TreeItem(
              key,
              vscode.TreeItemCollapsibleState.Expanded,
              { name: key, path: fullPath, type: 'folder' },
              children
            )
          );
        }
      }

      return items;
    };

    return buildTreeItems(tree);
  }
}
