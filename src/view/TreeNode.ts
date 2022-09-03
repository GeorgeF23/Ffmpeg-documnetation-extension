import * as vscode from "vscode";

export default class TreeNode extends vscode.TreeItem {
  private children: TreeNode[];

  constructor(id: string | undefined, label: string) {
    super(label, vscode.TreeItemCollapsibleState.None);

    this.label = label;
    this.children = [];
    super.contextValue = "href";
    super.id = id;
  }

  addChild(child: TreeNode) {
    this.children.push(child);
    super.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
  }

  getChildren(): TreeNode[] {
    return this.children;
  }
}
