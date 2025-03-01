

import * as vscode from 'vscode';

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
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
