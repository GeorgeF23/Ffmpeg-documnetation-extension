import * as vscode from 'vscode';
import DocumentationProvider from './DocumentationProvider';
import DocumentationNode from './DocumentationNode';
import axios from 'axios';
import {HTMLElement, parse} from 'node-html-parser';

function createTree(root: DocumentationNode, nodes: HTMLElement[] | undefined) {
	if (!nodes) return;
	nodes.forEach(node => {
		const text = node.querySelector('a')?.text as string;
		const documentationNode = new DocumentationNode(text);
		root.addChild(documentationNode);	// Add current node to it's parrent
		
		const children = node.querySelector(":scope > ul")?.querySelectorAll(':scope > li');	// Nodes with children have ul element
		if (children && children.length > 0) {
			createTree(documentationNode, children);
		}
	})
}

async function parseDocumentation(): Promise<DocumentationNode | undefined> {
	try{
		const rawHtml = await axios.get('https://ffmpeg.org/ffmpeg-filters.html');
		const root = parse(rawHtml.data);
	
		const tableOfContents = root.querySelector(".contents")?.querySelector('ul');
		
		const nodes = tableOfContents?.querySelectorAll(":scope > li");

		const rootNode = new DocumentationNode('Ffmpeg filters');
		rootNode.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
		createTree(rootNode, nodes);
		
		return rootNode;
	} catch(error) {
		console.error(`Got an error while parsing documentation: ${error}`);
		vscode.window.showErrorMessage(`Got an error while parsing documentation: ${error}`)
	}
	return undefined;
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "ffmpeg-documentation" is now active!');

	const documentationProvider = new DocumentationProvider();
	vscode.window.registerTreeDataProvider('main-view', documentationProvider);

	context.subscriptions.push(vscode.commands.registerCommand('ffmpeg-documentation.refresh-data', async () => {
		const rootNode = await parseDocumentation();
		documentationProvider.setRootNode(rootNode);
		documentationProvider.refresh();
	}));
}

export function deactivate() {}
