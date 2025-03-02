// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { PythonLearningProvider } from './webview/pythonLearningProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "Practice" is now active!');

    // Create an instance of PythonLearningProvider
    const pythonLearningProvider = new PythonLearningProvider(context);

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand('GemiStudi.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from ExtensionPractice!');
    });

    // Register a command to open the Python Learning panel
    const openPythonLearningCommand = vscode.commands.registerCommand('GemiStudi.openPythonLearning', () => {
        pythonLearningProvider.open();
    });

    // Register a command to open Python Learning with selected text
    const learnWithSelectionCommand = vscode.commands.registerCommand('GemiStudi.learnWithSelection', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);
            if (selectedText) {
                pythonLearningProvider.open(selectedText);
            } else {
                pythonLearningProvider.open();
            }
        }
    });

    context.subscriptions.push(disposable, openPythonLearningCommand, learnWithSelectionCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
