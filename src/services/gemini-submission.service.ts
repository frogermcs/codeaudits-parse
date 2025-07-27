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
      const instructionText = await fs.readFile(instructionPath, 'utf-8');

      // 2. Initialize Gemini client
      const ai = new GoogleGenAI({apiKey: apiKey});
      const model = 'gemini-2.0-flash';

      // 3. Construct the full prompt
      const prompt = `${instructionText}\n\n---\n\n${parsedCode}`;

      // 4. Send to Gemini and get response
      // const response = await ai.models.generateContent({
      //       model,
      //       config: {},
      //       contents: [prompt],
      //   });

    const myMarkdown = `## My Header

---
Some stuff here :green_circle: With a [link](https://github.com)

### Maybe Add A table

| Header1 | Header2 | Header3 |
|--- |--- | --- |
| value1 | value2 | value |
`

    await this.core.summary.addRaw(myMarkdown).write()

      const response = { text : myMarkdown };

      // 5. Add response to the job summary
      this.core.summary
        .addHeading(`Gemini Analysis Results (${instructionName})`, 2)
        .addRaw('Some content here :speech_balloon:')
        .addRaw(response.text ?? 'no response from AI provided')
        .addCodeBlock(response.text ?? 'no response from AI provided', 'markdown');

      this.core.info('Successfully received response from Gemini.');
    } catch (error) {
      if (error instanceof Error) {
        this.core.setFailed(`Gemini submission failed: ${error.message}`);
      }
    }
  }
}