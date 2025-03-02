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
exports.activate = activate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const pythonLearningProvider_1 = require("./webview/pythonLearningProvider");
//importing Gemini API to read files from computer
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const useGemini_1 = require("./useGemini");
const gemini = new useGemini_1.createGemini();
function activate(context) {
    const gemPromptDocu = "I am going to give you python code. I am giving you this python code because the user would like to learn more about all the topics that are included in it. I need you to go through all of it and find the key points of what the lines of code are trying to accomplish. Keep in mind they may have some errors in the code they are trying to solve. In the case of these errors I want you to find the key concept they are trying to employ in python. When you get all these key concepts, I want you to find the documentation for the concepts and tools the python code is trying to employ. I want this documentation to solely focus on highly rated stack over flow threads, official documentation from the library of any tool that is being used or from official python documentation, or geeksforgeeks. I want all the documentation to be from just those three things I mentioned and nothing else. All I want your response to be is a list of the websites with a one sentence or less description. DO NOT BE CONVERSATION IN RESPONSE JUST GIVE THE LIST WITH A DESCRIPTION OF EACH LINK ABOVE IT. Here is the code:";
    const gemPromptExpec = "I am going to give you python code. I want you to review it. If it appears to be correct. Give just what you think the expected output is going to be. If the code appears to be wrong or if it can be improved then make sure you suggest the improvements to make and give a suggested output after the changes. When you recommend changes, I just want you to mention the key idea of the change and then give documentation from an official python source to support it. I do not want you to be conversation I want you to just give matter of fact information about what can be improved if needed with documentation. Here is the code:";
    const gemini = new useGemini_1.createGemini();
    const pythonLearningProvider = new pythonLearningProvider_1.PythonLearningProvider(context);
    // Register a command to open the Python Learning panel
    const openPythonLearningCommand = vscode.commands.registerCommand('GemiStudi.openPythonLearning', () => {
        pythonLearningProvider.open();
    });
    // Register a command to open Python Learning with selected text
    const learnWithSelectionCommand = vscode.commands.registerCommand('GemiStudi.learnWithSelection', async () => {
        const pythonLearningProvider = new pythonLearningProvider_1.PythonLearningProvider(context);
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);
            if (selectedText) {
                const documentation = await gemini.callGemini(gemPromptDocu + selectedText);
                const expectedResult = await gemini.callGemini(gemPromptExpec + selectedText);
                pythonLearningProvider.open(selectedText, documentation, expectedResult);
            }
            else {
                pythonLearningProvider.open();
            }
        }
    });
    context.subscriptions.push(openPythonLearningCommand, learnWithSelectionCommand);
}
//# sourceMappingURL=extension.js.map