import { ICoreInterface } from '../interfaces/core.interface.js'
import { RepositoryParser, RepositoryParseOptions } from '../services/repository-parser.service.js'
import { submitToCodeAudits } from '../codeaudits-submission.js'

export interface ActionOptions {
  style: string
  compress: boolean
  pushToCodeaudits: boolean
  outputFilePath: string
  workingDirectory: string
  codeauditsApiKey?: string
  codeauditsBasePath?: string
}

/**
 * Main application orchestrator
 * Coordinates between repository parsing and CodeAudits submission
 */
export class CodeAuditsParseApp {
  private repositoryParser: RepositoryParser

  constructor(private core: ICoreInterface) {
    this.repositoryParser = new RepositoryParser(core)
  }

  /**
   * Extract options from core inputs
   */
  extractOptionsFromCore(): ActionOptions {
    return {
      style: this.core.getInput('style'),
      compress: this.core.getBooleanInput('compress'),
      pushToCodeaudits: this.core.getBooleanInput('push-to-codeaudits'),
      outputFilePath: this.core.getInput('output') || 'parsed-repo.txt',
      workingDirectory: this.core.getInput('working-directory'),
      codeauditsApiKey: this.core.getInput('codeaudits-api-key'),
      codeauditsBasePath: this.core.getInput('codeaudits-base-path')
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

      // Submit to CodeAudits if requested
      if (actionOptions.pushToCodeaudits) {
        await this.submitToCodeAudits(parseResult, actionOptions)
      } else {
        this.core.debug('Code will not be pushed to CodeAudits')
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
   * Handle CodeAudits submission
   */
  private async submitToCodeAudits(parseResult: any, options: ActionOptions): Promise<void> {
    this.core.info('Submitting to CodeAudits')
    
    const content = await this.repositoryParser.readParsedContent(
      parseResult.absoluteWorkingDirectory, 
      parseResult.outputPath
    )
    
    const metadata = this.repositoryParser.extractMetadata(parseResult.packResult)
    
    await submitToCodeAudits(
      content, 
      metadata, 
      options.codeauditsBasePath || '', 
      options.codeauditsApiKey, 
      this.core
    )
    
    this.core.info('Submitted')
  }
}
