import { ICoreInterface } from '../interfaces/core.interface.js';
import fs from 'node:fs/promises';
import path from 'node:path';

export interface InstructionResult {
  text: string;
  label: string;
}

export class InstructionLoaderService {
  constructor(private core: ICoreInterface) {}

  /**
   * Load a predefined instruction from the src/instructions directory
   */
  async loadPredefinedInstruction(instructionName: string): Promise<InstructionResult> {
    try {
      // Load list of available instructions
      const instructionsDir = path.resolve(process.cwd(), 'src/instructions');
      const files = await fs.readdir(instructionsDir);
      const availableInstructions = files
        .filter((file: string) => file.endsWith('.md'))
        .map((file: string) => file.replace('.md', ''))
        .sort();

      // Check if selected instruction exists
      if (!availableInstructions.includes(instructionName)) {
        throw new Error(
          `Instruction '${instructionName}' doesn't exist. Pick one from existing: ${availableInstructions.join(', ')}`
        );
      }

      // Read the instruction file
      const instructionPath = path.resolve(process.cwd(), `src/instructions/${instructionName}.md`);
      const text = await fs.readFile(instructionPath, 'utf-8');

      return {
        text,
        label: instructionName
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load predefined instruction '${instructionName}': ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Load a custom instruction from the repository's /.codeaudits/instructions directory
   */
  async loadCustomInstruction(instructionName: string, workingDirectory: string): Promise<InstructionResult> {
    try {
      if (!workingDirectory) {
        throw new Error('Working directory is required for custom instructions');
      }

      // Construct path to custom instruction
      const instructionFileName = instructionName.endsWith('.md') ? instructionName : `${instructionName}.md`;
      const instructionPath = path.resolve(workingDirectory, '.codeaudits', 'instructions', instructionFileName);
      
      // Check if the custom instruction file exists
      try {
        await fs.access(instructionPath);
      } catch (error) {
        throw new Error(
          `Custom instruction file '${instructionFileName}' not found in /.codeaudits/instructions directory. Please ensure the file exists.`
        );
      }

      // Read the custom instruction file
      const text = await fs.readFile(instructionPath, 'utf-8');

      return {
        text,
        label: `Custom: ${instructionName}`
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load custom instruction '${instructionName}': ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Load instruction based on type
   */
  async loadInstruction(
    instructionName: string,
    instructionType: 'predefined' | 'custom',
    workingDirectory?: string
  ): Promise<InstructionResult> {
    if (instructionType === 'custom') {
      if (!workingDirectory) {
        throw new Error('Working directory is required for custom instructions');
      }
      return this.loadCustomInstruction(instructionName, workingDirectory);
    } else {
      return this.loadPredefinedInstruction(instructionName);
    }
  }
}
