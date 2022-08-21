import * as vscode from 'vscode';

export default class DocumentationNode extends vscode.TreeItem {
    private children: DocumentationNode[];

    constructor(label: string) {
        super(label, vscode.TreeItemCollapsibleState.None);

        this.label = label;
        this.children = [];
    }

    addChild(child: DocumentationNode) {
        this.children.push(child);
        super.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    }

    getChildren(): DocumentationNode[] {
        return this.children;
    }
}