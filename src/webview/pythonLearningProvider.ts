import * as vscode from 'vscode';
import * as path from 'path';

export class PythonLearningProvider {
  public static readonly viewType = 'pythonLearningView';
  private _panel: vscode.WebviewPanel | undefined;
  private _context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
  }

  public open() {
    // If we already have a panel, show it
    if (this._panel) {
      this._panel.reveal(vscode.ViewColumn.One);
      return;
    }

    // Otherwise, create a new panel
    this._panel = vscode.window.createWebviewPanel(
      PythonLearningProvider.viewType,
      'Python Learning',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(this._context.extensionPath, 'media'))
        ]
      }
    );

    // Set the webview's html content
    this._panel.webview.html = this._getHtmlForWebview();

    // Reset panel when disposed
    this._panel.onDidDispose(() => {
      this._panel = undefined;
    });

    // Set up message handling
    this._setupMessageListeners();
  }

  private _setupMessageListeners() {
    if (!this._panel) {return};

    this._panel.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'runCode':
          await this._runCode(message.code);
          break;
      }
    });
  }

  private async _runCode(code: string) {
    // For now, we'll just simulate running the code
    const output = `Running Python code:\n${code}\n\nSimulated output: Hello, Python!`;
    
    this._panel?.webview.postMessage({
      command: 'executionResult',
      output: output
    });
  }

  private _getHtmlForWebview(): string {
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Python Learning</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
          }
          .container {
            display: grid;
            grid-template-rows: auto 1fr auto;
            height: 90vh;
          }
          .editor-container {
            display: flex;
            flex-direction: column;
            margin-top: 20px;
          }
          #editor {
            height: 200px;
            border: 1px solid #ccc;
            font-family: monospace;
            padding: 10px;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            resize: none;
          }
          #output {
            margin-top: 10px;
            height: 100px;
            overflow: auto;
            padding: 10px;
            background-color: var(--vscode-terminal-background);
            color: var(--vscode-terminal-foreground);
            font-family: monospace;
          }
          button {
            margin-top: 10px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 6px 12px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Python Interactive Learning</h1>
          <div class="editor-container">
            <h3>Try Python code here:</h3>
            <textarea id="editor">print("Hello, Python!")</textarea>
            <button id="runButton">Run Code</button>
            <pre id="output">// Output will appear here</pre>
          </div>
        </div>

        <script>
          (function() {
            const vscode = acquireVsCodeApi();
            
            document.getElementById('runButton').addEventListener('click', () => {
              const code = document.getElementById('editor').value;
              vscode.postMessage({
                command: 'runCode',
                code: code
              });
            });

            // Handle messages from the extension
            window.addEventListener('message', event => {
              const message = event.data;
              if (message.command === 'executionResult') {
                document.getElementById('output').textContent = message.output;
              }
            });
          })();
        </script>
      </body>
      </html>`;
  }
}