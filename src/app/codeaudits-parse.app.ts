import { ICoreInterface } from '../interfaces/core.interface.js'
import { GeminiSubmissionService } from '../services/gemini-submission.service.js'
import { RepositoryParser, RepositoryParseOptions } from '../services/repository-parser.service.js'

export interface ActionOptions {
  style: string
  compress: boolean
  outputFilePath: string
  workingDirectory: string
  instruction?: string
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
      instruction: this.core.getInput('llm-instruction') || undefined
    }
  }

  /**
   * Main execution flow
   */
  async execute(options?: ActionOptions): Promise<void> {
    const myMarkdown = `## My Header

---
Some stuff here :green_circle: With a [link](https://github.com)

### Maybe Add A table

| Header1 | Header2 | Header3 |
|--- |--- | --- |
| value1 | value2 | value |
`

    await this.core.summary.addRaw(myMarkdown).write()

    // try {
    //   const actionOptions = options || this.extractOptionsFromCore()
      
    //   // Parse repository
    //   const parseOptions: RepositoryParseOptions = {
    //     style: actionOptions.style,
    //     compress: actionOptions.compress,
    //     outputFilePath: actionOptions.outputFilePath,
    //     workingDirectory: actionOptions.workingDirectory
    //   }

    //   const parseResult = await this.repositoryParser.parseRepository(parseOptions)
    //   this.repositoryParser.generateSummary(parseOptions, parseResult.packResult)
      
    //   // Step 2: Conditionally submit to Gemini (new)
    //   if (actionOptions.instruction) {
    //     const parsedContent = await this.repositoryParser.readParsedContent(
    //       parseResult.absoluteWorkingDirectory,
    //       parseResult.outputPath
    //     );

    //     await this.geminiService.submit(
    //       parsedContent,
    //       actionOptions.instruction
    //     );
    //   } else {
    //     this.core.info('No LLM instruction provided, skipping Gemini submission.');
    //   }

    //   await this.core.summary.write()
    // } catch (error) {
    //   console.error(error)
    //   if (error instanceof Error) {
    //     this.core.setFailed(error.message)
    //   }
    // }
  }
}
