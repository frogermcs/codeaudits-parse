import { ICoreInterface } from '../interfaces/core.interface.js';
import fs from 'node:fs/promises';
import path from 'node:path';

export interface PromptResult {
  text: string;
  label: string;
}

export class PromptLoaderService {
  constructor(private core: ICoreInterface) {}

  /**
   * Load a predefined prompt from the src/prompts directory
   */
  async loadPredefinedPrompt(promptName: string): Promise<PromptResult> {
    try {
      // Load list of available prompts
      const promptsDir = path.resolve(process.cwd(), 'src/prompts');
      const files = await fs.readdir(promptsDir);
      const availablePrompts = files
        .filter((file: string) => file.endsWith('.md'))
        .map((file: string) => file.replace('.md', ''))
        .sort();

      // Check if selected prompt exists
      if (!availablePrompts.includes(promptName)) {
        throw new Error(
          `Prompt '${promptName}' doesn't exist. Pick one from existing: ${availablePrompts.join(', ')}`
        );
      }

      // Read the prompt file
      const promptPath = path.resolve(process.cwd(), `src/prompts/${promptName}.md`);
      const text = await fs.readFile(promptPath, 'utf-8');

      return {
        text,
        label: promptName
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load predefined prompt '${promptName}': ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Load a custom prompt from the repository's /.codeaudits/prompts directory
   */
  async loadCustomPrompt(promptName: string, workingDirectory: string): Promise<PromptResult> {
    try {
      if (!workingDirectory) {
        throw new Error('Working directory is required for custom prompts');
      }

      // Construct path to custom prompt
      const promptFileName = promptName.endsWith('.md') ? promptName : `${promptName}.md`;
      const promptPath = path.resolve(workingDirectory, '.codeaudits', 'prompts', promptFileName);
      
      // Check if the custom prompt file exists
      try {
        await fs.access(promptPath);
      } catch (error) {
        throw new Error(
          `Custom prompt file '${promptFileName}' not found in /.codeaudits/prompts directory. Please ensure the file exists.`
        );
      }

      // Read the custom prompt file
      const text = await fs.readFile(promptPath, 'utf-8');

      return {
        text,
        label: `Custom: ${promptName}`
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load custom prompt '${promptName}': ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Load prompt based on type
   */
  async loadPrompt(
    promptName: string,
    promptType: 'predefined' | 'custom',
    workingDirectory?: string
  ): Promise<PromptResult> {
    if (promptType === 'custom') {
      if (!workingDirectory) {
        throw new Error('Working directory is required for custom prompts');
      }
      return this.loadCustomPrompt(promptName, workingDirectory);
    } else {
      return this.loadPredefinedPrompt(promptName);
    }
  }
}
