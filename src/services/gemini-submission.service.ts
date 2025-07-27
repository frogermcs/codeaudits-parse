import { ICoreInterface } from '../interfaces/core.interface.js';
import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs/promises';
import path from 'node:path';

export class GeminiSubmissionService {
  constructor(private core: ICoreInterface) {}

  public async submit(
    parsedCode: string,
    instructionName: string,
    apiKey: string
  ): Promise<void> {
    try {
      this.core.info(`Submitting to Gemini with instruction: ${instructionName}`);

      // 1. Read the instruction file
      const instructionPath = path.resolve(process.cwd(), `src/instructions/${instructionName}.md`);
      const instructionText = await fs.readFile(instructionPath, 'utf-8');

      // 2. Initialize Gemini client
      const ai = new GoogleGenAI({apiKey: apiKey});
      const model = 'gemini-2.0-flash';

      // 3. Construct the full prompt
      const prompt = `${instructionText}\n\n---\n\n${parsedCode}`;

      // 4. Send to Gemini and get response
      const response = await ai.models.generateContent({
            model,
            config: {},
            contents: [prompt],
        });

      // 5. Add response to the job summary
      this.core.summary
        .addHeading(`Gemini Analysis Results (${instructionName})`, 2)
        .addCodeBlock(response.text ?? 'no response from AI provided', 'markdown');

      this.core.info('Successfully received response from Gemini.');
    } catch (error) {
      if (error instanceof Error) {
        this.core.setFailed(`Gemini submission failed: ${error.message}`);
      }
    }
  }
}