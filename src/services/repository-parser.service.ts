import { CliOptions, PackResult, runCli } from 'repomix'
import fs from 'node:fs/promises'
import path from 'node:path'
import { ICoreInterface } from '../interfaces/core.interface.js'

export interface RepositoryParseOptions {
  style: string
  compress: boolean
  outputFilePath: string
  workingDirectory: string
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
    const { style, compress, outputFilePath, workingDirectory } = options

    this.core.debug(
      `Parsing codebase into ${outputFilePath} file, with style ${style} in directory ${workingDirectory}`
    )

    const absoluteWorkingDirectory = path.resolve(process.cwd(), workingDirectory)

    const cliOptions: CliOptions = {
      output: outputFilePath,
      style: style as 'xml' | 'markdown' | 'plain',
      fileSummary: true,
      directoryStructure: true,
      securityCheck: false,
      topFilesLen: 10,
      quiet: true,
      compress: compress
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
    const { style, compress, workingDirectory, outputFilePath } = options

    const parseMetadata = {
        'fileCharCounts' : packResult.fileCharCounts,
        'totalFiles' : packResult.totalFiles,
        'totalTokens': packResult.totalTokens,
        'suspiciousFilesResults': packResult.suspiciousFilesResults,
        'suspiciousGitDiffResults': packResult.suspiciousGitDiffResults,
        'processedFilesCount': packResult.processedFiles.length,
    }

    this.core.summary
      .addHeading('Code Parsing Summary')
      .addTable([
        ['Parsed output file', outputFilePath],
        ['Style', style],
        ['Compress', compress.toString()],
        ['Working Directory', workingDirectory]
      ])
      .addBreak()
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
