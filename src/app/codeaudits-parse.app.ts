import { ICoreInterface } from '../interfaces/core.interface.js'
import { GeminiSubmissionService } from '../services/gemini-submission.service.js'
import { PromptLoaderService } from '../services/prompt-loader.service.js'
import { RepositoryParser, RepositoryParseOptions } from '../services/repository-parser.service.js'
import { PullRequestParser, PullRequestParseOptions } from '../services/pull-request-parser.service.js'
import path from 'node:path'

export interface ActionOptions {
  mode: string
  style: string
  compress: boolean
  outputFilePath: string
  workingDirectory: string
  prompt?: string
  customPrompt?: string
  includeFiles?: string[]
  mainBranchFile?: string
  featureBranchFile?: string
}

/**
 * Main application orchestrator
 * Coordinates between repository parsing and CodeAudits submission
 */
export class CodeAuditsParseApp {
  private repositoryParser: RepositoryParser
  private pullRequestParser: PullRequestParser
  private geminiService: GeminiSubmissionService;
  private promptLoader: PromptLoaderService;

  constructor(private core: ICoreInterface) {
    this.repositoryParser = new RepositoryParser(core)
    this.pullRequestParser = new PullRequestParser(core)
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
      mode: this.core.getInput('mode'),
      style: this.core.getInput('style'),
      compress: this.core.getBooleanInput('compress'),
      outputFilePath: this.core.getInput('output'),
      workingDirectory: this.core.getInput('working-directory'),
      prompt: this.core.getInput('llm-prompt') || undefined,
      customPrompt: this.core.getInput('llm-custom-prompt') || undefined,
      includeFiles: includeFiles,
      mainBranchFile: this.core.getInput('main-branch-file') || undefined,
      featureBranchFile: this.core.getInput('feature-branch-file') || undefined
    }
  }

  /**
   * Main execution flow
   */
  async execute(options?: ActionOptions): Promise<void> {
    try {
      const actionOptions = options || this.extractOptionsFromCore()
      
      if (actionOptions.mode === 'parse-pr') {
        await this.executePullRequestMode(actionOptions)
      } else {
        await this.executeRepositoryMode(actionOptions)
      }

      await this.core.summary.write()
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        this.core.setFailed(error.message)
      }
    }
  }

  /**
   * Execute repository parsing mode
   */
  private async executeRepositoryMode(actionOptions: ActionOptions): Promise<void> {
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
    
    // Submit to Gemini if prompt is provided
    await this.submitToGeminiIfRequested(
      actionOptions,
      await this.repositoryParser.readParsedContent(
        parseResult.absoluteWorkingDirectory,
        parseResult.outputPath
      )
    )
  }

  /**
   * Execute Pull Request analysis mode
   */
  private async executePullRequestMode(actionOptions: ActionOptions): Promise<void> {
    if (!actionOptions.mainBranchFile || !actionOptions.featureBranchFile) {
      this.core.setFailed('Both main-branch-file and feature-branch-file are required for parse-pr mode')
      return
    }

    const parseOptions: PullRequestParseOptions = {
      mainBranchFilePath: actionOptions.mainBranchFile,
      featureBranchFilePath: actionOptions.featureBranchFile,
      workingDirectory: actionOptions.workingDirectory
    }

    const parseResult = await this.pullRequestParser.parsePullRequest(parseOptions)
    this.pullRequestParser.generateSummary(parseOptions, parseResult)

    // For PR mode, default to PR architecture analysis prompt if no prompt is specified
    const promptToUse = actionOptions.prompt || actionOptions.customPrompt || 'pull-request-architecture-analysis'
    
    const modifiedOptions = {
      ...actionOptions,
      prompt: actionOptions.prompt || (actionOptions.customPrompt ? undefined : 'pull-request-architecture-analysis'),
      customPrompt: actionOptions.customPrompt
    }

    await this.submitToGeminiIfRequested(modifiedOptions, parseResult.combinedContent)
  }

  /**
   * Submit content to Gemini if prompt is requested
   */
  private async submitToGeminiIfRequested(actionOptions: ActionOptions, content: string): Promise<void> {
    if (actionOptions.prompt || actionOptions.customPrompt) {
      if (actionOptions.prompt && actionOptions.customPrompt) {
        this.core.setFailed('Cannot use both llm-prompt and llm-custom-prompt at the same time. Please choose one.');
        return;
      }

      if (actionOptions.prompt) {
        const prompt = await this.promptLoader.loadPredefinedPrompt(actionOptions.prompt);
        await this.geminiService.submit(content, prompt.text, prompt.label);
      } else if (actionOptions.customPrompt) {
        const absoluteWorkingDirectory = path.resolve(process.cwd(), actionOptions.workingDirectory)
        const prompt = await this.promptLoader.loadCustomPrompt(actionOptions.customPrompt, absoluteWorkingDirectory);
        await this.geminiService.submit(content, prompt.text, prompt.label);
      }
    } else if (actionOptions.mode === 'parse-pr') {
      // For PR mode, always use the default PR analysis prompt if no other prompt is specified
      const prompt = await this.promptLoader.loadPredefinedPrompt('pull-request-architecture-analysis');
      await this.geminiService.submit(content, prompt.text, prompt.label);
    } else {
      this.core.info('No LLM prompt provided, skipping Gemini submission.');
    }
  }
}
