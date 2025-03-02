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
const { spawnSync } = require('child_process');
class PythonLearningProvider {
    static viewType = 'pythonLearningView';
    _panel;
    _context;
    _selectedText;
    constructor(context) {
        this._context = context;
    }
    open(selectedText) {
        this._selectedText = selectedText;
        // If we already have a panel, show it and update content if needed
        if (this._panel) {
            this._panel.reveal(vscode.ViewColumn.Three);
            if (selectedText) {
            }
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
        // Ensure the webview is initialized before updating content
        // This ensures the event listeners are set up before we try to update content
        this._panel.webview.onDidReceiveMessage(message => {
            if (message.command === 'ready' && this._selectedText) {
            }
        });
    }
    _setupMessageListeners() {
        if (!this._panel) {
            return;
        }
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
        // Execute the Python code
        let output;
        try {
            const pythonProcess = spawnSync('python', ['-c', code], { encoding: 'utf8' });
            const stdout = pythonProcess.stdout || '';
            const stderr = pythonProcess.stderr || '';
            if (stderr) {
                output = `Output:\n${stdout}\nError:\n${stderr}`;
            }
            else {
                output = `Output:\n${stdout}`;
            }
        }
        catch (err) {
            output = `Failed to execute Python code: ${err.message}`;
        }
        this._panel?.webview.postMessage({
            command: 'executionResult',
            output: output
        });
    }
    _getHtmlForWebview() {
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
        /* Gemini Response section */
        .gemini-container {
        margin-bottom: 20px;
        }
        #geminiResponse {
        width: 100%;
        height: 100px;
        border: 1px solid #ccc;
        padding: 10px;
        margin-top: 10px;
        overflow: auto;
        background-color: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
        }
        #questionInput {
        width: 100%;
        padding: 10px;
        margin-top: 10px;
        border: 1px solid #ccc;
        background-color: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        }
        /* Python editor styling */
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
        margin-right: 5px;
        }
      </style>
      </head>
      <body>
      <div class="container">
        <h1>Python Interactive Learning</h1>
        
        <!-- Gemini AI section -->
        <div class="gemini-container">
        <h3>Resources and Documentation</h3>
        <div id="geminiResponse">${initialCode}</div>
        <input type="text" id="questionInput" placeholder="Ask a Python question...">
        <button id="askButton">Ask Gemini</button>
        </div>
        
        <!-- Python Editor section -->
        <div class="editor-container">
        <h3>Try Python code here:</h3>
        <textarea id="editor">Chill</textarea>
        <button id="runButton">Run Code</button>
        <pre id="output">// Output will appear here</pre>
        </div>
      </div>

      <script>
        (function() {
        const vscode = acquireVsCodeApi();
        
        // Let the extension know the webview is ready
        vscode.postMessage({ command: 'ready' });
        
        // Run Python code
        document.getElementById('runButton').addEventListener('click', () => {
          const code = document.getElementById('editor').value;
          vscode.postMessage({
          command: 'runCode',
          code: code
          });
        });

        // Ask Gemini
        document.getElementById('askButton').addEventListener('click', () => {
          const question = document.getElementById('questionInput').value;
          if (question.trim()) {
          // Show loading indicator
          document.getElementById('geminiResponse').textContent = 'Loading...';
          vscode.postMessage({
            command: 'askGemini',
            question: question
          });
          }
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
          case 'geminiResponse':
            document.getElementById('geminiResponse').textContent = message.response;
            break;
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