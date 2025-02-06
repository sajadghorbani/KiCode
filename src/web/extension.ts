import * as vscode from 'vscode';

class PreViewProvider implements vscode.CustomTextEditorProvider {
	constructor(private readonly context: vscode.ExtensionContext) {}
  
	public async resolveCustomTextEditor(
	  document: vscode.TextDocument,
	  webviewPanel: vscode.WebviewPanel,
	  _token: vscode.CancellationToken
	): Promise<void> {
	  webviewPanel.webview.options = {
		enableScripts: true,
		enableCommandUris: true,
		localResourceRoots: [
			this.context.extensionUri,
			vscode.Uri.joinPath(vscode.Uri.file(document.uri.fsPath), '..')
		]
	  };
  
	  const updateWebview = () => {
		webviewPanel.webview.html = this.getWebviewContent(document, webviewPanel);
	  };
  
	  updateWebview();
  
	  const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
		if (e.document.uri.toString() === document.uri.toString()) {
		  updateWebview();
		}
	  });
  
	  webviewPanel.onDidDispose(() => {
		changeDocumentSubscription.dispose();
	  });
	}
  
	private getWebviewContent(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel): string {
		const scriptUri = webviewPanel.webview.asWebviewUri(
			vscode.Uri.joinPath(this.context.extensionUri, 'media', 'kicanvas.js')
		);

		const fileUri = webviewPanel.webview.asWebviewUri(document.uri);
		
		return `<!DOCTYPE html>
			<html>
			<head>
			</head>
			<body style="height: 100vh;">
				<script type="module" src="${scriptUri}"></script>
				<kicanvas-embed src="${fileUri}" controls="full" ></kicanvas-embed>
			</body>
			</html>`;
	}
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.window.registerCustomEditorProvider(
		  'KiCode.preview',
		  new PreViewProvider(context),
		  { webviewOptions: { retainContextWhenHidden: true } }
		)
	  );
}

export function deactivate() {}