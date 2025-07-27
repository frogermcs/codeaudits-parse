import { ICoreInterface, ISummary } from '../interfaces/core.interface.js'

/**
 * Local implementation of the core interface for non-GitHub Actions usage
 * This mock allows the same codebase to run locally and in GitHub Actions
 */
export class LocalCore implements ICoreInterface {
  private inputs: Record<string, string> = {}
  private outputs: Record<string, string> = {}
  
  constructor(options: any = {}) {
    this.inputs = {
      'style': options.style || 'plain',
      'compress': options.compress?.toString() || 'false',
      'working-directory': options.workingDirectory || '.',
      'output': options.output || 'parsed-repo.txt',
      'instruction': options.instruction || 'architecture',
      'gemini-model': options.geminiModel || process.env.GEMINI_MODEL
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

  summary: ISummary = {
    addHeading: (heading: string, level?: number) => {
      console.log(`${'#'.repeat(level || 1)} ${heading}`)
      return this.summary
    },
    addTable: (table: any) => {
      console.table(table)
      return this.summary
    },
    addBreak: () => {
      console.log('')
      return this.summary
    },
    addRaw: (raw: string) => {
      console.log(raw)
      return this.summary
    },
    addCodeBlock: (code: string, lang?: string) => {
      console.log(`\`\`\`${lang || ''}\n${code}\n\`\`\``)
      return this.summary
    },
    addLink: (text: string, url: string) => {
      console.log(`[${text}](${url})`)
      return this.summary
    },
    write: async () => {
      console.log('Summary written (local mode)')
    }
  }
}
