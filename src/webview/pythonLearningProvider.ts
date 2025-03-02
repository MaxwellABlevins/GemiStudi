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
      <div class="w-[1440px] h-[1024px] relative bg-white  overflow-hidden">
  <div class="w-[443px] h-[233px] left-[568px] top-[435px] absolute flex-col justify-center items-start inline-flex">
    <div class="w-[117px] text-black text-[10px] font-normal font-['Inter']">Response to question</div>
    <div class="w-[443px] h-[221px] p-2.5 rounded-[5px] border border-black justify-start items-start gap-2.5 inline-flex">
      <div class="text-[#9c9797] text-xs font-normal font-['Inter']">Enter text</div>
    </div>
  </div>
  <div class="w-[443px] h-[135px] left-[568px] top-[287px] absolute flex-col justify-center items-start gap-2.5 inline-flex">
    <div class="w-[136px] h-[18px] text-black text-base font-normal font-['Inter']">Gemini Response</div>
    <div data-svg-wrapper>
    <svg width="443" height="107" viewBox="0 0 443 107" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" width="442" height="106" rx="4.5" stroke="black"/>
    </svg>
    </div>
  </div>
  <div data-svg-wrapper class="left-[568px] top-[702px] absolute">
  <svg width="443" height="79" viewBox="0 0 443 79" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="442" height="78" rx="4.5" stroke="black"/>
  </svg>
  </div>
  <div class="left-[568px] top-[681px] absolute text-black text-base font-normal font-['Inter']">Output</div>
</div>`;
  }
}
