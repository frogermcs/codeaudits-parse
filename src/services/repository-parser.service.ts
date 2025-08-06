import { CliOptions, PackResult, runCli } from 'repomix'
import fs from 'node:fs/promises'
import path from 'node:path'
import { ICoreInterface } from '../interfaces/core.interface.js'

export interface RepositoryParseOptions {
  style: string
  compress: boolean
  outputFilePath: string
  workingDirectory: string
  includeFiles?: string[]
}

export interface ParseResult {
  packResult: PackResult
  outputPath: string
  absoluteWorkingDirectory: string
}

/**
 * Service for handling repository parsing operations
 * Encapsulates the logic for parsing repositories using repomix
 */
export class RepositoryParser {
  constructor(private core: ICoreInterface) {}

  /**
   * Parse a repository and generate output file
   */
  async parseRepository(options: RepositoryParseOptions): Promise<ParseResult> {
    const { style, compress, outputFilePath, workingDirectory, includeFiles } = options

    this.core.debug(
      `Parsing codebase into ${outputFilePath} file, with style ${style} in directory ${workingDirectory}`
    )

    if (includeFiles && includeFiles.length > 0) {
      this.core.info(
        `Including specific files in analysis: ${includeFiles.join(', ')}`
      )
    }

    const absoluteWorkingDirectory = path.resolve(process.cwd(), workingDirectory)

    const cliOptions: CliOptions = {
      output: outputFilePath,
      style: style as 'xml' | 'markdown' | 'plain',
      fileSummary: true,
      directoryStructure: true,
      securityCheck: false,
      topFilesLen: 10,
      quiet: true,
      compress: compress,
      ignore: '.codeaudits/**' // Ignore .codeaudits directory
    }

    // Add include option if includeFiles is provided
    if (includeFiles && includeFiles.length > 0) {
      cliOptions.include = includeFiles.join(',')
    }

    this.core.debug(`Running repomix with options: ${JSON.stringify(cliOptions)}`)

    const result = await runCli(['.'], absoluteWorkingDirectory, cliOptions)
    if (!result) {
      throw new Error('Repository could not be parsed')
    }

    const { packResult } = result
    this.core.setOutput('parsed-file-name', outputFilePath)

    this.core.info(
      `Parsing complete. Output written to ${outputFilePath}.\n
      You can export it with actions/upload-artifact@v4.`
    )

    return {
      packResult,
      outputPath: outputFilePath,
      absoluteWorkingDirectory
    }
  }

  /**
   * Generate parsing summary for display
   */
  generateSummary(options: RepositoryParseOptions, packResult: PackResult): void {
    const { style, compress, workingDirectory, outputFilePath, includeFiles } = options

    const parseMetadata = {
        'totalFiles' : packResult.totalFiles,
        'totalTokens': packResult.totalTokens,
        'suspiciousFilesResults': packResult.suspiciousFilesResults,
        'suspiciousGitDiffResults': packResult.suspiciousGitDiffResults,
        'processedFilesCount': packResult.processedFiles.length,
    }

    const summaryTable = [
      ['Parsed output file', outputFilePath],
      ['Style', style],
      ['Compress', compress.toString()],
      ['Working Directory', workingDirectory]
    ]

    // Add included files info if present
    if (includeFiles && includeFiles.length > 0) {
      summaryTable.push(['Included Files', `${includeFiles.length} files specified`])
    }

    this.core.summary
      .addHeading('Code Parsing Summary')
      .addTable(summaryTable)
      .addBreak()

    // Show included files if any
    if (includeFiles && includeFiles.length > 0) {
      this.core.summary
        .addHeading('Included Files', 3)
        .addCodeBlock(includeFiles.join('\n'), '')
        .addBreak()
    }

    this.core.summary
      .addHeading('Parsed Metadata', 2)
      .addCodeBlock(JSON.stringify(parseMetadata, null, 2), 'json')
  }

  /**
   * Read the parsed file content
   */
  async readParsedContent(absoluteWorkingDirectory: string, outputFilePath: string): Promise<string> {
    return await fs.readFile(path.join(absoluteWorkingDirectory, outputFilePath), 'utf-8')
  }
}
