// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { PythonLearningProvider } from './webview/pythonLearningProvider';

//importing Gemini API to read files from computer
import * as dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createGemini } from './useGemini';
import { create } from 'domain';


const gemini = new createGemini();

export function activate(context: vscode.ExtensionContext) {
	const gemPromptDocu: string = "I am going to give you python code. I am giving you this python code because the user would like to learn more about all the topics that are included in it. I need you to go through all of it and find the key points of what the lines of code are trying to accomplish. Keep in mind they may have some errors in the code they are trying to solve. In the case of these errors I want you to find the key concept they are trying to employ in python. When you get all these key concepts, I want you to find the documentation for the concepts and tools the python code is trying to employ. I want this documentation to solely focus on highly rated stack over flow threads, official documentation from the library of any tool that is being used or from official python documentation, or geeksforgeeks. I want all the documentation to be from just those three things I mentioned and nothing else. All I want your response to be is a list of the websites with a one sentence or less description. DO NOT BE CONVERSATION IN RESPONSE JUST GIVE THE LIST WITH A DESCRIPTION OF EACH LINK ABOVE IT. Here is the code:";
	const gemPromptExpec: string = "I am going to give you python code. I want you to review it. If it appears to be correct. Give just what you think the expected output is going to be. If the code appears to be wrong or if it can be improved then make sure you suggest the improvements to make and give a suggested output after the changes. When you recommend changes, I just want you to mention the key idea of the change and then give documentation from an official python source to support it. I do not want you to be conversation I want you to just give matter of fact information about what can be improved if needed with documentation. Here is the code:";

	const gemini = new createGemini();
	const pythonLearningProvider = new PythonLearningProvider(context);

	// Register a command to open the Python Learning panel
	const openPythonLearningCommand = vscode.commands.registerCommand('GemiStudi.openPythonLearning', () => {
		
		pythonLearningProvider.open();
	});

	// Register a command to open Python Learning with selected text
	const learnWithSelectionCommand = vscode.commands.registerCommand('GemiStudi.learnWithSelection', async () => {
		const pythonLearningProvider = new PythonLearningProvider(context);
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const selection = editor.selection;
			const selectedText = editor.document.getText(selection);
			if (selectedText) {
				const documentation: string = await gemini.callGemini(gemPromptDocu + selectedText);
				const expectedResult: string = await gemini.callGemini(gemPromptExpec + selectedText);
				pythonLearningProvider.open(selectedText, documentation, expectedResult);
			} else {
				pythonLearningProvider.open();
			}
		}
	});

	context.subscriptions.push(openPythonLearningCommand, learnWithSelectionCommand);
}