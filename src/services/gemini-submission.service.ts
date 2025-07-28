import { ICoreInterface } from '../interfaces/core.interface.js';
import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs/promises';
import path from 'node:path';

export class GeminiSubmissionService {
  constructor(private core: ICoreInterface) {}

  public async submit(
    parsedCode: string,
    instructionName: string
  ): Promise<void> {
    try {
      // Read API key from environment variable
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is required but not set');
      }

      this.core.info(`Submitting to Gemini with instruction: ${instructionName}`);

      // 1. Read the instruction file
      const instructionPath = path.resolve(process.cwd(), `src/instructions/${instructionName}.md`);
      let instructionText: string;
      
      try {
        instructionText = await fs.readFile(instructionPath, 'utf-8');
      } catch (fileError) {
        // Get list of available instructions
        const instructionsDir = path.resolve(process.cwd(), 'src/instructions');
        try {
          const files = await fs.readdir(instructionsDir);
          const availableInstructions = files
            .filter(file => file.endsWith('.md'))
            .map(file => file.replace('.md', ''))
            .sort();
          
          throw new Error(
            `Instruction '${instructionName}' doesn't exist. Pick one from existing: ${availableInstructions.join(', ')}`
          );
        } catch (dirError) {
          throw new Error(`Instruction '${instructionName}' doesn't exist and couldn't read instructions directory`);
        }
      }

      // 2. Initialize Gemini client
      const ai = new GoogleGenAI({apiKey: apiKey});
      const model = 'gemini-2.0-flash';

      // 3. Construct the full prompt
      const prompt = `${instructionText}\n\n---\n\n${parsedCode}`;      

      // 4. Send to Gemini and get response
      const response = await ai.models.generateContent({
            model,
            config: {
              systemInstruction: [
                "You are an expert software architect and code reviewer. ",
                "Focus on the given code and user request. Keep explanations concise but thorough. Avoid including unrelated or speculative information. ",
                "The ideal response should focus on making the next actionable steps to improve the codebase and meet prompt requirements. ",
                "The response should come in markdown format as the primary output is Github Actions summary page. ",
                "Do not use conversational phrases such as 'Okay,' 'Sure,' or 'Let me.' Start directly with the analysis, plan, or output. "
              ]
            },
            contents: [prompt],
        });

      // 5. Add response to the job summary
      this.core.summary
        .addHeading(`Gemini Analysis Results (${instructionName})`, 2)
        .addRaw(response.text ?? 'no response from AI provided');

      this.core.info('Successfully received response from Gemini.');
    } catch (error) {
      if (error instanceof Error) {
        this.core.setFailed(`Gemini submission failed: ${error.message}`);
      }
    }
  }
}