import * as core from '@actions/core'
import { CliOptions, runCli } from 'repomix'
import fs from 'node:fs/promises'
import path from 'node:path'
import { submitToCodeAudits } from './codeaudits-submission.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const style: string = core.getInput('style')
    const compress: boolean = core.getBooleanInput('compress')
    const pushToCodeaudits: boolean = core.getBooleanInput('push-to-codeaudits')
    const outputFilePath = `parsed-repo.txt`
    const workingDirectory: string = core.getInput('working-directory')

    core.debug(
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
      core.setFailed('Repository could not be parsed')
      return
    }

    const { packResult } = result

    core.setOutput('parse-metadata', JSON.stringify(packResult))
    core.setOutput('parsed-file-name', outputFilePath)

    core.info(
      `Parsing complete. Output written to ${outputFilePath}.\n
      You can export it with actions/upload-artifact@v4.`
    )

    core.summary
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
      core.info('Submitting to CodeAudits')
      const apiKey = core.getInput('codeaudits-api-key')
      const basePath = core.getInput('codeaudits-base-path')
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
      await submitToCodeAudits(content, metadata, basePath, apiKey)
      core.info('Submitted')
    } else {
      core.debug('Code will not be pushed to CodeAudits')
    }
    
    await core.summary.write()
  } catch (error) {
    // Fail the workflow run if an error occurs
    console.error(error)
    if (error instanceof Error) core.setFailed(error.message)
  }
}
