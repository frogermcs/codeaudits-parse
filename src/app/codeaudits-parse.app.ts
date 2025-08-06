import { ICoreInterface } from '../interfaces/core.interface.js'
import { GeminiSubmissionService } from '../services/gemini-submission.service.js'
import { PromptLoaderService } from '../services/prompt-loader.service.js'
import { RepositoryParser, RepositoryParseOptions } from '../services/repository-parser.service.js'

export interface ActionOptions {
  style: string
  compress: boolean
  outputFilePath: string
  workingDirectory: string
  prompt?: string
  customPrompt?: string
  includeFiles?: string[]
}

/**
 * Main application orchestrator
 * Coordinates between repository parsing and CodeAudits submission
 */
export class CodeAuditsParseApp {
  private repositoryParser: RepositoryParser
  private geminiService: GeminiSubmissionService;
  private promptLoader: PromptLoaderService;

  constructor(private core: ICoreInterface) {
    this.repositoryParser = new RepositoryParser(core)
    this.geminiService = new GeminiSubmissionService(core);
    this.promptLoader = new PromptLoaderService(core);
  }

  /**
   * Extract options from core inputs
   */
  extractOptionsFromCore(): ActionOptions {
    const includeFilesInput = this.core.getInput('includeFiles')
    const includeFiles = includeFilesInput 
      ? includeFilesInput.split(/\s+/).filter(file => file.trim().length > 0)
      : undefined

    return {
      style: this.core.getInput('style'),
      compress: this.core.getBooleanInput('compress'),
      outputFilePath: this.core.getInput('output'),
      workingDirectory: this.core.getInput('working-directory'),
      prompt: this.core.getInput('llm-prompt') || undefined,
      customPrompt: this.core.getInput('llm-custom-prompt') || undefined,
      includeFiles: includeFiles
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
        workingDirectory: actionOptions.workingDirectory,
        includeFiles: actionOptions.includeFiles
      }

      const parseResult = await this.repositoryParser.parseRepository(parseOptions)
      this.repositoryParser.generateSummary(parseOptions, parseResult.packResult)
      
      // Step 2: Conditionally submit to Gemini (new)
      if (actionOptions.prompt || actionOptions.customPrompt) {
        const parsedContent = await this.repositoryParser.readParsedContent(
          parseResult.absoluteWorkingDirectory,
          parseResult.outputPath
        );

        if (actionOptions.prompt && actionOptions.customPrompt) {
          this.core.setFailed('Cannot use both llm-prompt and llm-custom-prompt at the same time. Please choose one.');
          return;
        }

        if (actionOptions.prompt) {
          const prompt = await this.promptLoader.loadPredefinedPrompt(actionOptions.prompt);
          await this.geminiService.submit(
            parsedContent,
            prompt.text,
            prompt.label
          );
        } else if (actionOptions.customPrompt) {
          const prompt = await this.promptLoader.loadCustomPrompt(
            actionOptions.customPrompt,
            parseResult.absoluteWorkingDirectory
          );
          await this.geminiService.submit(
            parsedContent,
            prompt.text,
            prompt.label
          );
        }
      } else {
        this.core.info('No LLM prompt provided, skipping Gemini submission.');
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
