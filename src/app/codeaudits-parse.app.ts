import { ICoreInterface } from '../interfaces/core.interface.js'
import { RepositoryParser, RepositoryParseOptions } from '../services/repository-parser.service.js'

export interface ActionOptions {
  style: string
  compress: boolean
  outputFilePath: string
  workingDirectory: string
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
      outputFilePath: this.core.getInput('output') || 'parsed-repo.txt',
      workingDirectory: this.core.getInput('working-directory'),
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
      
      await this.core.summary.write()
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        this.core.setFailed(error.message)
      }
    }
  }
}
