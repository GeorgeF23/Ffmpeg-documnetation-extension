import * as vscode from "vscode";

export default class TreeNode extends vscode.TreeItem {
  private children: TreeNode[];

  constructor(docId: string, nodeId: string | undefined, label: string) {
    super(label, vscode.TreeItemCollapsibleState.None);

    this.label = label;
    this.children = [];
    super.contextValue = `${docId}-href`;
    super.id = nodeId;
  }

  addChild(child: TreeNode) {
    this.children.push(child);
    super.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
  }

  getChildren(): TreeNode[] {
    return this.children;
  }
}
