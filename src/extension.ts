import * as vscode from 'vscode';
import DocumentationProvider from './DocumentationProvider';
import DocumentationNode from './DocumentationNode';
import axios from 'axios';
import {HTMLElement, parse} from 'node-html-parser';

function createTree(root: DocumentationNode, nodes: HTMLElement[] | undefined) {
	if (!nodes) return;
	nodes.forEach(node => {
		const text = node.querySelector('a')?.text as string;
		const id = node.querySelector('a')?.attrs['href'].substring(1);
		const documentationNode = new DocumentationNode(id, text);
		root.addChild(documentationNode);	// Add current node to it's parrent
		
		const children = node.querySelector(":scope > ul")?.querySelectorAll(':scope > li');	// Nodes with children have ul element
		if (children && children.length > 0) {
			createTree(documentationNode, children);
		}
	})
}

async function fetchDocumentation(): Promise<string> {
	try {
		const html = await axios.get('https://ffmpeg.org/ffmpeg-filters.html');
		return html.data;
	} catch (error) {
		console.error(`Got an error while fetching documentation: ${error}`);
		vscode.window.showErrorMessage(`Got an error while fetching documentation: ${error}`)
		return "";
	}
}

async function parseDocumentation(rawHtml: string): Promise<DocumentationNode | undefined> {
	try{
		const root = parse(rawHtml);
	
		const tableOfContents = root.querySelector(".contents")?.querySelector('ul');
		
		const nodes = tableOfContents?.querySelectorAll(":scope > li");

		const rootNode = new DocumentationNode(undefined, 'Ffmpeg filters');
		rootNode.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
		createTree(rootNode, nodes);
		
		return rootNode;
	} catch(error) {
		console.error(`Got an error while parsing documentation: ${error}`);
		vscode.window.showErrorMessage(`Got an error while parsing documentation: ${error}`)
	}
	return undefined;
}

async function refreshDocumentation(provider: DocumentationProvider) {
	console.log('Refreshing documentation.');
	const html = await fetchDocumentation();
	const rootNode = await parseDocumentation(html);
	provider.setRootNode(rootNode);
	provider.setHtml(html);
	provider.refresh();
}

function openFiltersWebview(html: string, target?: string) {
	const panel = vscode.window.createWebviewPanel(
		'filters-webview',
		'Filters documentation',
		vscode.ViewColumn.Beside,
		{
			enableScripts: true
		}
	);
	if (target) {
		html += `<script>document.getElementById('${target}').scrollIntoView()</script>`
	}
	panel.webview.html = html;
	
}

export async function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "ffmpeg-documentation" is now active!');

	const documentationProvider = new DocumentationProvider();
	vscode.window.registerTreeDataProvider('main-view', documentationProvider);
	await refreshDocumentation(documentationProvider);

	context.subscriptions.push(vscode.commands.registerCommand('ffmpeg-documentation.refresh-data', () => refreshDocumentation(documentationProvider)));
	context.subscriptions.push(vscode.commands.registerCommand('ffmpeg-documentation.open-filter-webview', (node?: DocumentationNode) => openFiltersWebview(documentationProvider.getHtml(), node?.id)));
}

export function deactivate() {}
