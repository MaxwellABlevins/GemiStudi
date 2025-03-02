
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

	console.log('Congratulations, your extension "Practice" is now active!');


	const disposable = vscode.commands.registerCommand('GemiStudi.helloWorld', async () => {
		const message = await callGemini("Explain how 1+1=2");
		vscode.window.showInformationMessage(message);
	//Create an of PythonLearningProvider
	const pythonLearningProvider = new PythonLearningProvider(context);


	const disposable = vscode.commands.registerCommand('GemiStudi.helloWorld', () => {
		
		vscode.window.showInformationMessage('Hello World from ExtensionPractice!');
	});

	const openPythonLearningCommand = vscode.commands.registerCommand('GemiStudi.openPythonLearning', () => {
		pythonLearningProvider.open();
	});

	context.subscriptions.push(disposable, openPythonLearningCommand);
});
}

export function deactivate() {}
