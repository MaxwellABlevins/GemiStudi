"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonLearningProvider = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
class PythonLearningProvider {
    static viewType = 'pythonLearningView';
    _panel;
    _context;
    constructor(context) {
        this._context = context;
    }
    open() {
        // If we already have a panel, show it
        if (this._panel) {
            this._panel.reveal(vscode.ViewColumn.One);
            return;
        }
        // Otherwise, create a new panel
        this._panel = vscode.window.createWebviewPanel(PythonLearningProvider.viewType, 'Python Learning', vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(this._context.extensionPath, 'media'))
            ]
        });
        // Set the webview's html content
        this._panel.webview.html = this._getHtmlForWebview();
        // Reset panel when disposed
        this._panel.onDidDispose(() => {
            this._panel = undefined;
        });
        // Set up message handling
        this._setupMessageListeners();
    }
    _setupMessageListeners() {
        if (!this._panel)
            return;
        this._panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'runCode':
                    await this._runCode(message.code);
                    break;
            }
        });
    }
    async _runCode(code) {
        // For now, we'll just simulate running the code
        const output = `Running Python code:\n${code}\n\nSimulated output: Hello, Python!`;
        this._panel?.webview.postMessage({
            command: 'executionResult',
            output: output
        });
    }
    _getHtmlForWebview() {
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
exports.PythonLearningProvider = PythonLearningProvider;
//# sourceMappingURL=pythonLearningProvider.js.map