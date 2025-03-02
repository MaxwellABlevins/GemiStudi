import * as vscode from 'vscode';
import * as path from 'path';
const { spawnSync } = require('child_process');

export class PythonLearningProvider {
  public static readonly viewType = 'pythonLearningView';
  private _panel: vscode.WebviewPanel | undefined;
  private _context: vscode.ExtensionContext;
  private _selectedText: string | undefined;

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
  }

  public open(selectedText?: string) {
    this._selectedText = selectedText;
    
    // If we already have a panel, show it and update content if needed
    if (this._panel) {
      this._panel.reveal(vscode.ViewColumn.One);
      if (selectedText) {
        this._updateContent();
      }
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
    
    // Ensure the webview is initialized before updating content
    // This ensures the event listeners are set up before we try to update content
    this._panel.webview.onDidReceiveMessage(message => {
      if (message.command === 'ready' && this._selectedText) {
        this._updateContent();
      }
    });
  }

  private _updateContent() {
    if (!this._panel) return;
    
    // Update the editor content with selected text if available
    if (this._selectedText) {
      this._panel.webview.postMessage({
        command: 'updateEditor',
        code: this._selectedText
      });
    }
  }

  private _setupMessageListeners() {
    if (!this._panel) return;

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
    // Execute the Python code
    let output: string;
    try {
      const pythonProcess = spawnSync('python', ['-c', code], { encoding: 'utf8' });
      
      const stdout = pythonProcess.stdout || '';
      const stderr = pythonProcess.stderr || '';
      
      if (stderr) {
        output = `Output:\n${stdout}\nError:\n${stderr}`;
      } else {
        output = `Output:\n${stdout}`;
      }
    } catch (err: any) {
      output = `Failed to execute Python code: ${err.message}`;
    }
    
    this._panel?.webview.postMessage({
      command: 'executionResult',
      output: output
    });
  }

  private _getHtmlForWebview(): string {
    // Prepare initial code - use selected text if available
    const initialCode = this._selectedText || 'print("Hello, Python!")';
    
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
            <textarea id="editor">${initialCode}</textarea>
            <button id="runButton">Run Code</button>
            <pre id="output">// Output will appear here</pre>
          </div>
        </div>

        <script>
          (function() {
            const vscode = acquireVsCodeApi();
            
            // Let the extension know the webview is ready
            vscode.postMessage({ command: 'ready' });
            
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
              switch(message.command) {
                case 'executionResult':
                  document.getElementById('output').textContent = message.output;
                  break;
                case 'updateEditor':
                  document.getElementById('editor').value = message.code;
                  break;
              }
            });
          })();
        </script>
      </body>
      </html>`;
  }
}