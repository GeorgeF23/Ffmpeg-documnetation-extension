import * as vscode from "vscode";
import TreeProvider from "../view/TreeProivder";
import TreeNode from "../view/TreeNode";
import axios from "axios";
import { HTMLElement, parse } from "node-html-parser";

export class DocumentationFetcher {
  private url: string;
  private treeProvider: TreeProvider;
  private id: string;

  constructor(id: string, url: string) {
    this.id = id;
    this.url = url;
    this.treeProvider = new TreeProvider();

    vscode.window.registerTreeDataProvider(`${this.id}-view`, this.treeProvider);
  }

  createTree(root: TreeNode, nodes: HTMLElement[] | undefined) {
    if (!nodes) {
      return;
    }
    nodes.forEach((node) => {
      const text = node.querySelector("a")?.text as string;
      const nodeId = node.querySelector("a")?.attrs["href"].substring(1);
      const documentationNode = new TreeNode(this.id, nodeId, text);
      root.addChild(documentationNode); // Add current node to it's parrent
  
      const children = node
        .querySelector(":scope > ul")
        ?.querySelectorAll(":scope > li"); // Nodes with children have ul element
      if (children && children.length > 0) {
        this.createTree(documentationNode, children);
      }
    });
  }
  
  async fetchDocumentation(): Promise<string> {
    try {
      const html = await axios.get(this.url);
      return html.data;
    } catch (error) {
      console.error(`Got an error while fetching documentation: ${error}`);
      vscode.window.showErrorMessage(
        `Got an error while fetching documentation: ${error}`
      );
      return "";
    }
  }
  
  async parseDocumentation(
    rawHtml: string
  ): Promise<TreeNode | undefined> {
    try {
      const root = parse(rawHtml);
  
      const tableOfContents = root
        .querySelector(".contents")
        ?.querySelector("ul");
  
      const nodes = tableOfContents?.querySelectorAll(":scope > li");
  
      const rootNode = new TreeNode(this.id, undefined, "Root node");
      rootNode.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
      this.createTree(rootNode, nodes);
  
      return rootNode;
    } catch (error) {
      console.error(`Got an error while parsing documentation: ${error}`);
      vscode.window.showErrorMessage(
        `Got an error while parsing documentation: ${error}`
      );
    }
    return undefined;
  }
  
  async refreshDocumentation() {
    console.log("Refreshing documentation.");
    const html = await this.fetchDocumentation();
    const rootNode = await this.parseDocumentation(html);
    this.treeProvider.setRootNode(rootNode);
    this.treeProvider.setHtml(html);
    this.treeProvider.refresh();
  }

  getProvider(): TreeProvider {
    return this.treeProvider;
  }

  getId(): string {
    return this.id;
  }
}