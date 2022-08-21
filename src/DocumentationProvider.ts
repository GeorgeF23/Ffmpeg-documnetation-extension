import * as vscode from 'vscode';
import DocumentationNode from './DocumentationNode';

export default class DocumentationProvider implements vscode.TreeDataProvider<DocumentationNode> {
  
  private rootNode: DocumentationNode | undefined;
  
  constructor(rootNode?: DocumentationNode) {
    this.rootNode = rootNode;
  }

  setRootNode(newRootNode?: DocumentationNode) {
    this.rootNode = newRootNode;
  }

  getTreeItem(element: DocumentationNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: DocumentationNode | undefined): vscode.ProviderResult<DocumentationNode[]> {
    if (!element) return [this.rootNode as DocumentationNode];
    else return element.getChildren();
  }

  private _onDidChangeTreeData: vscode.EventEmitter<DocumentationNode | undefined> = new vscode.EventEmitter<DocumentationNode | undefined>();

  readonly onDidChangeTreeData: vscode.Event<DocumentationNode | undefined> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }
}