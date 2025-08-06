import fs from 'node:fs/promises'
import path from 'node:path'
import { ICoreInterface } from '../interfaces/core.interface.js'

export interface PullRequestParseOptions {
  mainBranchFilePath: string
  featureBranchFilePath: string
  workingDirectory: string
}

export interface PullRequestParseResult {
  mainBranchContent: string
  featureBranchContent: string
  absoluteWorkingDirectory: string
  combinedContent: string
}

/**
 * Service for handling Pull Request parsing operations
 * Combines main branch repository content with feature branch changes for analysis
 */
export class PullRequestParser {
  constructor(private core: ICoreInterface) {}

  /**
   * Parse and combine main branch and feature branch content for PR analysis
   */
  async parsePullRequest(options: PullRequestParseOptions): Promise<PullRequestParseResult> {
    const { mainBranchFilePath, featureBranchFilePath, workingDirectory } = options

    this.core.debug(
      `Parsing Pull Request with main branch file: ${mainBranchFilePath} and feature branch file: ${featureBranchFilePath}`
    )

    const absoluteWorkingDirectory = path.resolve(process.cwd(), workingDirectory)

    // Read both files
    const mainBranchContent = await this.readFileContent(absoluteWorkingDirectory, mainBranchFilePath)
    const featureBranchContent = await this.readFileContent(absoluteWorkingDirectory, featureBranchFilePath)

    // Combine content for analysis
    const combinedContent = this.combineContentForAnalysis(mainBranchContent, featureBranchContent)

    this.core.info(
      `Pull Request parsing complete. Main branch content: ${mainBranchContent.length} chars, Feature branch content: ${featureBranchContent.length} chars`
    )

    return {
      mainBranchContent,
      featureBranchContent,
      absoluteWorkingDirectory,
      combinedContent
    }
  }

  /**
   * Generate parsing summary for display
   */
  generateSummary(options: PullRequestParseOptions, result: PullRequestParseResult): void {
    const { mainBranchFilePath, featureBranchFilePath, workingDirectory } = options

    const summaryTable = [
      ['Main Branch File', mainBranchFilePath],
      ['Feature Branch File', featureBranchFilePath],
      ['Working Directory', workingDirectory],
      ['Main Branch Content Size', `${result.mainBranchContent.length} characters`],
      ['Feature Branch Content Size', `${result.featureBranchContent.length} characters`],
      ['Combined Content Size', `${result.combinedContent.length} characters`]
    ]

    this.core.summary
      .addHeading('Pull Request Parsing Summary')
      .addTable(summaryTable)
      .addBreak()
      .addHeading('Analysis Context', 2)
      .addRaw('This analysis compares the current repository state (main branch) with the proposed changes (feature branch) to evaluate the architectural impact of the Pull Request.')
  }

  /**
   * Read file content from the specified path
   */
  private async readFileContent(absoluteWorkingDirectory: string, filePath: string): Promise<string> {
    try {
      const fullPath = path.join(absoluteWorkingDirectory, filePath)
      return await fs.readFile(fullPath, 'utf-8')
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Combine main branch and feature branch content for analysis
   */
  private combineContentForAnalysis(mainBranchContent: string, featureBranchContent: string): string {
    return `# Pull Request Analysis Context

## Current Repository State (Main Branch)

The following represents the current state of the repository on the main branch:

${mainBranchContent}

---

## Proposed Changes (Feature Branch)

The following represents the changed files in the feature branch:

${featureBranchContent}

---

## Analysis Instructions

Please analyze the above content to understand:
1. The current state of the codebase (main branch)
2. The proposed changes in this Pull Request (feature branch changes)
3. How these changes impact the overall architecture and code quality

Focus your analysis on comparing these two states and evaluating the architectural improvements or concerns introduced by the Pull Request.`
  }
}
