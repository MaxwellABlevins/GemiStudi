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
    _documentation;
    _expected; // Add this line to store the expected parameter
    constructor(context) {
        this._context = context;
    }
    open(selectedText, documentation, expected) {
        this._documentation = documentation;
        this._selectedText = selectedText;
        this._expected = expected; // Store the expected parameter
        // If we already have a panel, show it and update content if needed
        if (this._panel) {
            this._panel.reveal(vscode.ViewColumn.One);
            if (selectedText) {
                // Update the editor content
                this._panel.webview.postMessage({
                    command: 'updateEditor',
                    code: selectedText
                });
            }
            if (documentation) {
                // Update the documentation
                this._panel.webview.postMessage({
                    command: 'geminiResponse',
                    response: documentation
                });
            }
            if (expected) {
                // Update the expected output/code review
                this._panel.webview.postMessage({
                    command: 'codeReviewResponse',
                    response: expected
                });
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
                case 'reviewCode':
                    // Simply show the expected output when Review Code is clicked
                    this._panel?.webview.postMessage({
                        command: 'codeReviewResponse',
                        response: this._expected || 'No expected output provided.'
                    });
                    break;
                case 'askGemini':
                    // Handle the Gemini question using your createGemini class
                    break;
            }
        });
    }
    async _runCode(code) {
        // For now, we'll just simulate running the code
        // Execute the Python code
        let output;
        try {
            // Try python command first
            let pythonProcess = spawnSync('python', ['-c', code], { encoding: 'utf8' });
            // If that fails, try python3
            if (pythonProcess.error) {
                pythonProcess = spawnSync('python3', ['-c', code], { encoding: 'utf8' });
            }
            // If still error, try py on Windows
            if (pythonProcess.error) {
                pythonProcess = spawnSync('py', ['-c', code], { encoding: 'utf8' });
            }
            const stdout = pythonProcess.stdout || '';
            const stderr = pythonProcess.stderr || '';
            if (pythonProcess.error) {
                output = `Error: Could not find Python executable. Make sure Python is installed and in your PATH.`;
            }
            else if (stderr) {
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
    async _reviewCode(code) {
        try {
            // Create a temporary file to run pylint on
            const os = require('os');
            const fs = require('fs');
            const path = require('path');
            const tempDir = os.tmpdir();
            const tempFile = path.join(tempDir, 'temp_code_to_review.py');
            fs.writeFileSync(tempFile, code);
            // Add debugging message at the beginning
            let pylintOutput = '';
            // On Windows, try running pylint directly through Python - most reliable approach
            const { spawnSync } = require('child_process');
            // Try with Python module approach first (most reliable)
            let pylintProcess = spawnSync('python', ['-m', 'pylint', '--output-format=text', '--reports=n', tempFile], { encoding: 'utf8', shell: true });
            // Check if it worked
            if (!pylintProcess.error && pylintProcess.status === 0) {
                pylintOutput = pylintProcess.stdout || 'No issues found.';
            }
            else {
                // If that didn't work, try installing and running in one go
                pylintProcess = spawnSync('python', ['-m', 'pip', 'install', 'pylint', '&&', 'python', '-m', 'pylint',
                    '--output-format=text', '--reports=n', tempFile], { encoding: 'utf8', shell: true });
                if (!pylintProcess.error && pylintProcess.status === 0) {
                    pylintOutput = pylintProcess.stdout || 'No issues found.';
                }
                else {
                    // If all else failed, provide detailed error
                    pylintOutput = `Error: Could not run pylint. 
          
Detailed error: ${pylintProcess.stderr || pylintProcess.error || 'Unknown error'}

To fix this, please run these commands in your terminal:
1. python -m pip install pylint
2. Restart VS Code after installation

You may also need to add Python Scripts directory to your PATH:
1. Find your Python Scripts folder (usually in %USERPROFILE%\\AppData\\Local\\Programs\\Python\\Python*\\Scripts)
2. Add it to your system PATH environment variable
3. Restart VS Code`;
                }
            }
            // Clean up the temp file
            fs.unlinkSync(tempFile);
            // Use Gemini to create a beginner-friendly explanation of the pylint output
            const geminiExplanation = await this._getGeminiFeedback(code, pylintOutput);
            this._panel?.webview.postMessage({
                command: 'codeReviewResponse',
                response: geminiExplanation
            });
        }
        catch (err) {
            this._panel?.webview.postMessage({
                command: 'codeReviewResponse',
                response: `Error during code review: ${err.message}`
            });
        }
    }
    async _getGeminiFeedback(code, pylintOutput) {
        try {
            // You would need to implement the Gemini API call here
            // This is a placeholder assuming you have a createGemini class
            // or similar mechanism to call Gemini AI
            // const gemini = new createGemini();
            // const prompt = `
            //   I have the following Python code:
            //   \`\`\`python
            //   ${code}
            //   \`\`\`
            //   
            //   Pylint gave the following feedback:
            //   \`\`\`
            //   ${pylintOutput}
            //   \`\`\`
            //   
            //   Please explain these issues in a way that's helpful for a beginner programmer.
            //   Focus on explaining the most important issues first, and provide simple examples
            //   of how to fix each issue.
            // `;
            // const response = await gemini.callGemini(prompt);
            // return response;
            // For now, just return the pylint output with a note
            return `Pylint analysis (would be processed by Gemini in a complete implementation):\n\n${pylintOutput}\n\nIn the full implementation, Gemini would explain these issues in a beginner-friendly way.`;
        }
        catch (err) {
            return `Error getting Gemini feedback: ${err.message}`;
        }
    }
    _getHtmlForWebview() {
        const initialCode = this._selectedText || 'print("Hello, Python!")';
        const initialDocumentation = this._documentation || 'Documentation will appear here...';
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
        grid-template-rows: auto auto 1fr auto;
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
        height: 200px;
        border: 1px solid #ccc;
        font-family: monospace;
        padding: 10px;
        background-color: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
        resize: none;        }
        /* Code Review section */
        .code-review-container {
        margin-bottom: 20px;
        }
        #codeReviewResponse {
        height: 200px;
        border: 1px solid #ccc;
        font-family: monospace;
        padding: 10px;
        background-color: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
        resize: none;
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
        <div id="geminiResponse">${initialDocumentation}</div>
        </div>
        
        <!-- Code Review section -->
        <div class="code-review-container">
        <h3>Code Review</h3>
        <div id="codeReviewResponse">Click "Review Code" to get feedback on your code.</div>
        </div>
        
        <!-- Python Editor section -->
        <div class="editor-container">
        <h3>Try Python code here:</h3>
        <textarea id="editor">${initialCode}</textarea>
        <div class="button-row">
          <button id="runButton">Run Code</button>
          <button id="reviewButton">Review Code</button>
        </div>
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

        // Review Python code
        document.getElementById('reviewButton').addEventListener('click', () => {
          const code = document.getElementById('editor').value;
          document.getElementById('codeReviewResponse').textContent = "Analyzing code...";
          vscode.postMessage({
            command: 'reviewCode',
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
            case 'geminiResponse':
              document.getElementById('geminiResponse').textContent = message.response;
              break;
            case 'codeReviewResponse':
              document.getElementById('codeReviewResponse').textContent = message.response;
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