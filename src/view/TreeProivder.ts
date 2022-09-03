import { HTMLElement } from "node-html-parser";
import * as vscode from "vscode";
import TreeNode from "./TreeNode";

export default class TreeProvider
  implements vscode.TreeDataProvider<TreeNode>
{
  private rootNode: TreeNode | undefined;
  private html: string;

  constructor(rootNode?: TreeNode, html?: string) {
    this.rootNode = rootNode;
    this.html = html ?? "";
  }

  setRootNode(newRootNode?: TreeNode) {
    this.rootNode = newRootNode;
  }

  setHtml(html?: string) {
    this.html = html ?? "";
  }

  getHtml() {
    return this.html;
  }

  getTreeItem(element: TreeNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TreeNode | undefined): vscode.ProviderResult<TreeNode[]> {
    if (!element) {
      return [this.rootNode as TreeNode];
    } else {
      return element.getChildren();
    }
  }

  private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined> = new vscode.EventEmitter<TreeNode | undefined>();

  readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }
}
