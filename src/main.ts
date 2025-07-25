import * as core from '@actions/core'
import { CliOptions, runCli } from 'repomix'
import fs from 'node:fs/promises'
import path from 'node:path'
import { submitToCodeAudits } from './codeaudits-submission.js'

// Mock implementation for local usage
class LocalCore {
  private inputs: Record<string, string> = {}
  private outputs: Record<string, string> = {}
  
  constructor(options: any = {}) {
    this.inputs = {
      'style': options.style || 'plain',
      'compress': options.compress?.toString() || 'false',
      'push-to-codeaudits': options.pushToCodeaudits?.toString() || 'false',
      'working-directory': options.workingDirectory || '.',
      'codeaudits-api-key': options.codeauditsApiKey || '',
      'codeaudits-base-path': options.codeauditsBasePath || '',
      'output': options.output || 'parsed-repo.txt'
    }
  }

  getInput(name: string): string {
    return this.inputs[name] || ''
  }

  getBooleanInput(name: string): boolean {
    const value = this.getInput(name)
    return value === 'true' || value === '1'
  }

  setOutput(name: string, value: string): void {
    this.outputs[name] = value
    console.log(`Output: ${name} = ${value}`)
  }

  setFailed(message: string): void {
    console.error(`Failed: ${message}`)
    process.exit(1)
  }

  debug(message: string): void {
    console.debug(`Debug: ${message}`)
  }

  info(message: string): void {
    console.log(`Info: ${message}`)
  }

  error(message: string): void {
    console.error(`Error: ${message}`)
  }

  summary = {
    addHeading: (heading: string) => this.summary,
    addTable: (table: any) => this.summary,
    addBreak: () => this.summary,
    addCodeBlock: (code: string, lang: string) => this.summary,
    addLink: (text: string, url: string) => this.summary,
    write: async () => {
      console.log('Summary written (local mode)')
    }
  }
}

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(coreImpl: any = core): Promise<void> {
  try {
    const style: string = coreImpl.getInput('style')
    const compress: boolean = coreImpl.getBooleanInput('compress')
    const pushToCodeaudits: boolean = coreImpl.getBooleanInput('push-to-codeaudits')
    const outputFilePath = coreImpl.getInput('output') || `parsed-repo.txt`
    const workingDirectory: string = coreImpl.getInput('working-directory')

    coreImpl.debug(
      `Parsing codebase into ${outputFilePath} file, with style ${style} in directory ${workingDirectory}`
    )

    const absoluteWorkingDirectory = path.resolve(process.cwd(), workingDirectory);

    const cliOptions = {
      output: outputFilePath,
      style: style,
      fileSummary: true,
      directoryStructure: true,
      securityCheck: false,
      topFilesLen: 10,
      quiet: true,
      compress: compress
    } as CliOptions

    const result = await runCli(['.'], absoluteWorkingDirectory, cliOptions)
    if (!result) {
      coreImpl.setFailed('Repository could not be parsed')
      return
    }

    const { packResult } = result

    coreImpl.setOutput('parse-metadata', JSON.stringify(packResult))
    coreImpl.setOutput('parsed-file-name', outputFilePath)

    coreImpl.info(
      `Parsing complete. Output written to ${outputFilePath}.\n
      You can export it with actions/upload-artifact@v4.`
    )

    coreImpl.summary
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

    if (pushToCodeaudits) {
      coreImpl.info('Submitting to CodeAudits')
      const apiKey = coreImpl.getInput('codeaudits-api-key')
      const basePath = coreImpl.getInput('codeaudits-base-path')
      const content = await fs.readFile(path.join(absoluteWorkingDirectory, outputFilePath), 'utf-8')
      
      const topFiles = 
        Object.entries(packResult.fileTokenCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, Math.min(10, Object.keys(packResult.fileTokenCounts).length));
      const topFilesResp = topFiles.reduce<Record<string, number>>((obj, [filename, tokens]) => {
        obj[filename] = tokens;
        return obj;
      }, {});
      
      const metadata = {
        totalFiles: packResult.totalFiles,
        totalCharacters: packResult.totalCharacters,
        totalTokens: packResult.totalTokens,
        topFiles: topFilesResp
      }
      await submitToCodeAudits(content, metadata, basePath, apiKey, coreImpl)
      coreImpl.info('Submitted')
    } else {
      coreImpl.debug('Code will not be pushed to CodeAudits')
    }
    
    await coreImpl.summary.write()
  } catch (error) {
    // Fail the workflow run if an error occurs
    console.error(error)
    if (error instanceof Error) coreImpl.setFailed(error.message)
  }
}

/**
 * Local runner function for running without GitHub Actions
 */
export async function runLocal(options: any): Promise<void> {
  const localCore = new LocalCore(options)
  await run(localCore)
}
