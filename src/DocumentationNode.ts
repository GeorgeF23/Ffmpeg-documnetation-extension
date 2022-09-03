import * as vscode from "vscode";

export default class DocumentationNode extends vscode.TreeItem {
  private children: DocumentationNode[];

  constructor(id: string | undefined, label: string) {
    super(label, vscode.TreeItemCollapsibleState.None);

    this.label = label;
    this.children = [];
    super.contextValue = "href";
    super.id = id;
  }

  addChild(child: DocumentationNode) {
    this.children.push(child);
    super.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
  }

  getChildren(): DocumentationNode[] {
    return this.children;
  }
}
