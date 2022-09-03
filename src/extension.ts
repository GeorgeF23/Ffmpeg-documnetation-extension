import * as vscode from "vscode";
import TreeProvider from "./view/TreeProivder";
import TreeNode from "./view/TreeNode";
import { DocumentationFetcher } from "./data_fetching/DocumentationFetcher";

function openFiltersWebview(html: string, target?: string) {
  const panel = vscode.window.createWebviewPanel(
    "filters-webview",
    "Filters documentation",
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

export async function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "ffmpeg-documentation" is now active!'
  );

  const mainFetcher = new DocumentationFetcher('https://www.ffmpeg.org/ffmpeg.html', 'main-view');
  mainFetcher.refreshDocumentation();
  context.subscriptions.push(
    vscode.commands.registerCommand("ffmpeg-documentation.refresh-data", () =>
      mainFetcher.refreshDocumentation()
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "ffmpeg-documentation.open-filter-webview",
      (node?: TreeNode) =>
        openFiltersWebview(mainFetcher.getProvider().getHtml(), node?.id)
    )
  );
}

export function deactivate() {}
