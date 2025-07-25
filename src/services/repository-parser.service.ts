import { CliOptions, runCli } from 'repomix'
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
  packResult: any
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

    const result = await runCli(['.'], absoluteWorkingDirectory, cliOptions)
    if (!result) {
      throw new Error('Repository could not be parsed')
    }

    const { packResult } = result

    this.core.setOutput('parse-metadata', JSON.stringify(packResult))
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
  generateSummary(options: RepositoryParseOptions, packResult: any): void {
    const { style, compress, workingDirectory, outputFilePath } = options

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
      .addCodeBlock(JSON.stringify(packResult, null, 2), 'json')
  }

  /**
   * Read the parsed file content
   */
  async readParsedContent(absoluteWorkingDirectory: string, outputFilePath: string): Promise<string> {
    return await fs.readFile(path.join(absoluteWorkingDirectory, outputFilePath), 'utf-8')
  }

  /**
   * Extract metadata for CodeAudits submission
   */
  extractMetadata(packResult: any): Record<string, any> {
    const topFiles = 
      Object.entries(packResult.fileTokenCounts)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, Math.min(10, Object.keys(packResult.fileTokenCounts).length))

    const topFilesResp = topFiles.reduce<Record<string, number>>((obj, [filename, tokens]) => {
      obj[filename] = tokens as number
      return obj
    }, {})
    
    return {
      totalFiles: packResult.totalFiles,
      totalCharacters: packResult.totalCharacters,
      totalTokens: packResult.totalTokens,
      topFiles: topFilesResp
    }
  }
}
