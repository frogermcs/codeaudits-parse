import { ICoreInterface } from '../interfaces/core.interface.js';
import { GoogleGenAI } from '@google/genai';

export class GeminiSubmissionService {
  constructor(private core: ICoreInterface) {}

  public async submit(
    parsedCode: string,
    instructionText: string,
    instructionLabel?: string
  ): Promise<void> {
    try {
      // Read API key from environment variable
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is required but not set');
      }

      this.core.info(`Submitting to Gemini${instructionLabel ? ` with instruction: ${instructionLabel}` : ''}`);

      // Initialize Gemini client
      const ai = new GoogleGenAI({apiKey: apiKey});
      const model = 'gemini-2.0-flash';

      // Construct the full prompt
      const prompt = `${parsedCode}\n\n---\n\n${instructionText}`;

      // Send to Gemini and get response
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

      // Add response to the job summary
      const headingLabel = instructionLabel ? `Gemini Analysis Results (${instructionLabel})` : 'Gemini Analysis Results';
      this.core.summary
        .addHeading(headingLabel, 2)
        .addRaw(response.text ?? 'no response from AI provided');

      this.core.info('Successfully received response from Gemini.');
    } catch (error) {
      if (error instanceof Error) {
        this.core.setFailed(`Gemini submission failed: ${error.message}`);
      }
    }
  }
}