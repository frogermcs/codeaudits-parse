import { ICoreInterface } from '../interfaces/core.interface.js';
import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs/promises';
import path from 'node:path';

export class GeminiSubmissionService {
  constructor(private core: ICoreInterface) {}

  public async submit(
    parsedCode: string,
    instructionName: string,
    instructionType: 'predefined' | 'custom' = 'predefined',
    workingDirectory?: string
  ): Promise<void> {
    try {
      // Read API key from environment variable
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is required but not set');
      }

      this.core.info(`Submitting to Gemini with ${instructionType} instruction: ${instructionName}`);

      let instructionText: string;
      let instructionPath: string;

      if (instructionType === 'custom') {
        // Handle custom instructions from repository's /.codeaudits/instructions directory
        if (!workingDirectory) {
          throw new Error('Working directory is required for custom instructions');
        }

        // Construct path to custom instruction
        const instructionFileName = instructionName.endsWith('.md') ? instructionName : `${instructionName}.md`;
        instructionPath = path.resolve(workingDirectory, '.codeaudits', 'instructions', instructionFileName);
        
        // Check if the custom instruction file exists
        try {
          await fs.access(instructionPath);
        } catch (error) {
          throw new Error(
            `Custom instruction file '${instructionFileName}' not found in /.codeaudits/instructions directory. Please ensure the file exists.`
          );
        }

        // Read the custom instruction file
        instructionText = await fs.readFile(instructionPath, 'utf-8');
      } else {
        // Handle predefined instructions (original logic)
        // 1. Load list of available instructions
        const instructionsDir = path.resolve(process.cwd(), 'src/instructions');
        const files = await fs.readdir(instructionsDir);
        const availableInstructions = files
          .filter(file => file.endsWith('.md'))
          .map(file => file.replace('.md', ''))
          .sort();

        // 2. Check if selected instruction exists
        if (!availableInstructions.includes(instructionName)) {
          throw new Error(
            `Instruction '${instructionName}' doesn't exist. Pick one from existing: ${availableInstructions.join(', ')}`
          );
        }

        // 3. Read the instruction file
        instructionPath = path.resolve(process.cwd(), `src/instructions/${instructionName}.md`);
        instructionText = await fs.readFile(instructionPath, 'utf-8');
      }

      // 4. Initialize Gemini client
      const ai = new GoogleGenAI({apiKey: apiKey});
      const model = 'gemini-2.0-flash';

      // 5. Construct the full prompt
      const prompt = `${instructionText}\n\n---\n\n${parsedCode}`;      

      // 6. Send to Gemini and get response
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

      // 7. Add response to the job summary
      const instructionLabel = instructionType === 'custom' ? `Custom: ${instructionName}` : instructionName;
      this.core.summary
        .addHeading(`Gemini Analysis Results (${instructionLabel})`, 2)
        .addRaw(response.text ?? 'no response from AI provided');

      this.core.info('Successfully received response from Gemini.');
    } catch (error) {
      if (error instanceof Error) {
        this.core.setFailed(`Gemini submission failed: ${error.message}`);
      }
    }
  }
}