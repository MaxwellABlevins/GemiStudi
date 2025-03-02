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
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
//import { open } from 'fs';
//importing Gemini API to read files from computer
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI("AIzaSyBJmxRSvjp32ds0YTOphkYBF-SF2-E-ERc");
async function callGemini(prompt) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
    return await result.response.text();
}
function activate(context) {
    console.log('Congratulations, your extension "Practice" is now active!');
    const disposable = vscode.commands.registerCommand('GemiStudi.helloWorld', async () => {
        const message = await callGemini("Explain how 1+1=2");
        vscode.window.showInformationMessage(message);
    });
    // Register a command to open the Python Learning panel
    const openPythonLearningCommand = vscode.commands.registerCommand('GemiStudi.openPythonLearning', () => {
        pythonLearningProvider.open();
    });
    context.subscriptions.push(disposable, openPythonLearningCommand);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map