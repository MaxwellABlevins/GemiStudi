
import * as dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config({ path: '.env.local'});


export class createGemini{

    public async callGemini(input:string): Promise<string>{
        const apiKey: string = "AIzaSyBJmxRSvjp32ds0YTOphkYBF-SF2-E-ERc";
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not defined');
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({model: 'gemini-2.0-flash'});
        

	    const result = await model.generateContent(input);

	    return await result.response.text().toString();
    }
}