// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { PythonLearningProvider } from './webview/pythonLearningProvider';

//importing Gemini API to read files from computer
import * as dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';


const genAI = new GoogleGenerativeAI("AIzaSyBJmxRSvjp32ds0YTOphkYBF-SF2-E-ERc");

async function callGemini(prompt: string): Promise<string> {
	const model = genAI.getGenerativeModel({model: 'gemini-2.0-flash'});

	const result = await model.generateContent(prompt);
	console.log(result.response.text());

	return await result.response.text();
	}


export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "Practice" is now active!');

// Create an instance of PythonLearningProvider
const pythonLearningProvider = new PythonLearningProvider(context);

// The command has been defined in the package.json file
// Now provide the implementation of the command with registerCommand
// The commandId parameter must match the command field in package.json
const disposable = vscode.commands.registerCommand('GemiStudi.helloWorld', async () => {
    // The code you place here will be executed every time your command is executed
    const message = await callGemini("Explain how 1+1=2");
    vscode.window.showInformationMessage(message);
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