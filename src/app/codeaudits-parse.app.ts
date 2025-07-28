import { ICoreInterface } from '../interfaces/core.interface.js'
import { GeminiSubmissionService } from '../services/gemini-submission.service.js'
import { RepositoryParser, RepositoryParseOptions } from '../services/repository-parser.service.js'

export interface ActionOptions {
  style: string
  compress: boolean
  outputFilePath: string
  workingDirectory: string
  instruction?: string
  customInstruction?: string
}

/**
 * Main application orchestrator
 * Coordinates between repository parsing and CodeAudits submission
 */
export class CodeAuditsParseApp {
  private repositoryParser: RepositoryParser
  private geminiService: GeminiSubmissionService;

  constructor(private core: ICoreInterface) {
    this.repositoryParser = new RepositoryParser(core)
    this.geminiService = new GeminiSubmissionService(core);
  }

  /**
   * Extract options from core inputs
   */
  extractOptionsFromCore(): ActionOptions {
    return {
      style: this.core.getInput('style'),
      compress: this.core.getBooleanInput('compress'),
      outputFilePath: this.core.getInput('output') || 'parsed-repo.txt',
      workingDirectory: this.core.getInput('working-directory'),
      instruction: this.core.getInput('llm-instruction') || undefined,
      customInstruction: this.core.getInput('llm-custom-instruction') || undefined
    }
  }

  /**
   * Main execution flow
   */
  async execute(options?: ActionOptions): Promise<void> {
    try {
      const actionOptions = options || this.extractOptionsFromCore()
      
      // Parse repository
      const parseOptions: RepositoryParseOptions = {
        style: actionOptions.style,
        compress: actionOptions.compress,
        outputFilePath: actionOptions.outputFilePath,
        workingDirectory: actionOptions.workingDirectory
      }

      const parseResult = await this.repositoryParser.parseRepository(parseOptions)
      this.repositoryParser.generateSummary(parseOptions, parseResult.packResult)
      
      // Step 2: Conditionally submit to Gemini (new)
      if (actionOptions.instruction || actionOptions.customInstruction) {
        const parsedContent = await this.repositoryParser.readParsedContent(
          parseResult.absoluteWorkingDirectory,
          parseResult.outputPath
        );

        if (actionOptions.instruction && actionOptions.customInstruction) {
          this.core.setFailed('Cannot use both llm-instruction and llm-custom-instruction at the same time. Please choose one.');
          return;
        }

        if (actionOptions.instruction) {
          await this.geminiService.submit(
            parsedContent,
            actionOptions.instruction,
            'predefined'
          );
        } else if (actionOptions.customInstruction) {
          await this.geminiService.submit(
            parsedContent,
            actionOptions.customInstruction,
            'custom',
            parseResult.absoluteWorkingDirectory
          );
        }
      } else {
        this.core.info('No LLM instruction provided, skipping Gemini submission.');
      }

      await this.core.summary.write()
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        this.core.setFailed(error.message)
      }
    }
  }
}
