
import * as dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';


export class createGemini{
    
    private apiKey: string;
    private static genAI:any;

    public constructor(apiKey: string){
        this.apiKey = apiKey;
        createGemini.genAI = new GoogleGenerativeAI(this.apiKey);
    }
    

    public async callGemini(input:string): Promise<string>{
        const model = createGemini.genAI.getGenerativeModel({model: 'gemini-2.0-flash'});

	    const result = await model.generateContent(input);
	    console.log(result.response.text());

	    return await result.response.text().toString();
    }
}