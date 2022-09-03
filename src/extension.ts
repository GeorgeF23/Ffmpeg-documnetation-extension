import * as vscode from "vscode";
import TreeProvider from "./view/TreeProivder";
import TreeNode from "./view/TreeNode";
import { DocumentationFetcher } from "./data_fetching/DocumentationFetcher";

function openFiltersWebview(html: string, target?: string) {
  const panel = vscode.window.createWebviewPanel(
    "ffmpeg-webview",
    "Ffmpeg documentation" + (target ? `: ${target}` : ''),
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
    }
  );
  if (target) {
    html += `<script>document.getElementById('${target}').scrollIntoView()</script>`;
  }
  panel.webview.html = html;
}

function refreshFetcjers(fetchers: DocumentationFetcher[]) {
  for (const f of fetchers) {
    f.refreshDocumentation();
  }
}

function hookFetchersWebviews(context: vscode.ExtensionContext, fetchers: DocumentationFetcher[]) {
  for (const f of fetchers) {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        `ffmpeg-documentation.open-${f.getId()}-webview`,
        (node?: TreeNode) => openFiltersWebview(f.getProvider().getHtml(), node?.id)
      )
    );
  }
}

export async function activate(context: vscode.ExtensionContext) {
  console.log(
    'Extension "ffmpeg-documentation" is now active!'
  );

  
  const mainFetcher = new DocumentationFetcher('main', 'https://www.ffmpeg.org/ffmpeg.html');
  const filterFetcher = new DocumentationFetcher('filter', 'https://ffmpeg.org/ffmpeg-filters.html');
  const fetchers = [mainFetcher, filterFetcher];

  refreshFetcjers(fetchers);
  context.subscriptions.push(
    vscode.commands.registerCommand("ffmpeg-documentation.refresh-data", () => {
      refreshFetcjers(fetchers);
      vscode.window.showInformationMessage('Refreshing documentation data...');
    })
  );

  hookFetchersWebviews(context, fetchers);
  
}

export function deactivate() {}
